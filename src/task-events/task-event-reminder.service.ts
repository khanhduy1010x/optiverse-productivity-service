import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TaskEventRepository } from './task-event.repository';
import { NotificationHttpClient, ActionType } from '../http-axios/notification-http.client';
import { UserHttpClient } from '../http-axios/user-http.client';

@Injectable()
export class TaskEventReminderService {
  private readonly logger = new Logger(TaskEventReminderService.name);

  constructor(
    private readonly taskEventRepository: TaskEventRepository,
    private readonly notificationHttpClient: NotificationHttpClient,
    private readonly userHttpClient: UserHttpClient,
  ) {}

  /**
   * Cron job runs every 5 minutes to check for upcoming task events
   * Sends reminder email 30 minutes before the event starts
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkUpcomingTaskEvents() {
    this.logger.log('Checking for upcoming task events...');

    try {
      const now = new Date();
      // Check for events starting in 25-35 minutes
      // (to ensure no events are missed and avoid duplicate sends)
      const reminderWindowStart = new Date(now.getTime() + 25 * 60 * 1000);
      const reminderWindowEnd = new Date(now.getTime() + 35 * 60 * 1000);

      // Get upcoming events
      const upcomingEvents = await this.taskEventRepository.getUpcomingTaskEvents(
        reminderWindowStart,
        reminderWindowEnd,
      );

      this.logger.log(`Found ${upcomingEvents.length} upcoming events`);

      // Send email for each event
      for (const event of upcomingEvents) {
        await this.sendReminderEmail(event);
      }
    } catch (error) {
      this.logger.error('Error checking upcoming task events:', error);
    }
  }

  /**
   * Send reminder email for a task event
   */
  private async sendReminderEmail(event: any) {
    try {
      // Get user information
      const users = await this.userHttpClient.getUsersByIds([event.user_id.toString()]);
      
      if (!users || users.length === 0) {
        this.logger.warn(`User not found for event ${event._id}`);
        return;
      }

      const user = users[0];
      const startTime = new Date(event.start_time);
      
      // Format time
      const formattedTime = this.formatDateTime(startTime);

      // Format guests if available
      const guestsString = event.guests && event.guests.length > 0 
        ? event.guests.join(', ') 
        : undefined;

      // Send email via notification service with beautiful template
      await this.notificationHttpClient.sendTaskEventReminder(
        user.email,
        user.user_id,
        event.title || 'Untitled Event',
        formattedTime,
        event.description,
        event.location,
        guestsString,
        undefined, // actionUrl - can add link to webapp if needed
      );

      // Mark reminder as sent
      await this.taskEventRepository.markReminderSent(event._id.toString());

      this.logger.log(`Reminder email sent for event: ${event.title} to ${user.email}`);
    } catch (error) {
      this.logger.error(`Error sending reminder email for event ${event._id}:`, error);
    }
  }

  /**
   * Format date time to readable format
   */
  private formatDateTime(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };

    return date.toLocaleString('en-US', options);
  }
}
