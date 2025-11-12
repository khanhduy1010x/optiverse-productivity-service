import { Injectable } from '@nestjs/common';
import { AxiosClient } from './axios-client';

export enum ActionType {
  TASK = 'task',
  NOTE = 'note',
  FLASHCARD = 'flashcard',
  CHAT = 'chat',
  FRIEND = 'friend',
}

@Injectable()
export class NotificationHttpClient {
  private readonly client = new AxiosClient('http://notification-service:3002');

  async sendEmail(
    to: string,
    subject: string,
    content: string,
    actionType: ActionType,
    userId?: string,
  ): Promise<any> {
    try {
      const response = await this.client.post('email/send-simple', {
        to,
        subject,
        content,
        actionType,
        userId,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return null;
    }
  }

  async sendShareNotification(
    to: string,
    resourceType: string,
    resourceName: string,
    ownerName: string,
    permission: string,
    userId?: string,
  ): Promise<any> {
    const subject = `You have been shared a ${resourceType === 'note' ? 'note' : 'folder'}`;

    const content = `
      ${ownerName} has shared the ${resourceType === 'note' ? 'note' : 'folder'} "${resourceName}" with you.\n
      You have ${permission === 'view' ? 'view' : 'edit'} permission for this resource.\n
      Please log in to the application to access it.
    `;

    return this.sendEmail(to, subject, content, ActionType.NOTE, userId);
  }

  async sendTaskEventReminder(
    to: string,
    userId: string,
    eventTitle: string,
    startTime: string,
    description?: string,
    location?: string,
    guests?: string,
    actionUrl?: string,
  ): Promise<any> {
    try {
      const response = await this.client.post('email/send-task-event-reminder', {
        to,
        userId,
        eventTitle,
        startTime,
        description,
        location,
        guests,
        actionUrl,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending task event reminder:', error);
      return null;
    }
  }
}
