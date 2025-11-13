# Task Event Reminder Feature

## Tổng quan
Tính năng tự động gửi email nhắc nhở cho người dùng khi có sự kiện (task event) sắp diễn ra.

## Cách hoạt động

### 1. Scheduled Job (Cron Job)
- **Tần suất**: Chạy mỗi 5 phút
- **Thời gian nhắc nhở**: Trước 30 phút khi sự kiện bắt đầu
- **Cơ chế**: Kiểm tra các sự kiện sẽ bắt đầu trong khoảng 25-35 phút tới

### 2. Kiểm tra trùng lặp
- Mỗi task event có 2 trường mới:
  - `reminder_sent`: Boolean - đánh dấu đã gửi email hay chưa
  - `reminder_sent_at`: Date - thời gian gửi email
- Chỉ gửi email cho các sự kiện chưa được gửi reminder

### 3. Gửi Email
- Sử dụng template email đẹp (`task-event-reminder.hbs`)
- Kiểm tra cài đặt thông báo của người dùng (`task_notifications`)
- Gửi qua notification-service

## Kiến trúc

### Productivity Service
- **TaskEventReminderService**: Service chính xử lý cron job và logic gửi email
- **TaskEventRepository**: Thêm method `getUpcomingTaskEvents()` và `markReminderSent()`
- **TaskEvent Schema**: Thêm trường `reminder_sent` và `reminder_sent_at`

### Notification Service
- **Email Template**: `task-event-reminder.hbs` - Template email đẹp với đầy đủ thông tin
- **EmailController**: Endpoint mới `/email/send-task-event-reminder`
- **EmailService**: Method `sendTaskEventReminder()` để xử lý logic gửi email

### HTTP Client
- **NotificationHttpClient**: Method `sendTaskEventReminder()` để gọi API từ productivity-service

## Thông tin email bao gồm
- 📅 Tiêu đề sự kiện
- 🕒 Thời gian bắt đầu
- 📝 Mô tả (nếu có)
- 📍 Địa điểm (nếu có)
- 👥 Danh sách khách mời (nếu có)
- 🔗 Link hành động (có thể tùy chỉnh)

## Cấu hình

### Thời gian nhắc nhở
Mặc định: 30 phút trước sự kiện
Để thay đổi, sửa trong file `task-event-reminder.service.ts`:
```typescript
const reminderWindowStart = new Date(now.getTime() + 25 * 60 * 1000);
const reminderWindowEnd = new Date(now.getTime() + 35 * 60 * 1000);
```

### Tần suất kiểm tra
Mặc định: Mỗi 5 phút
Để thay đổi, sửa decorator trong `task-event-reminder.service.ts`:
```typescript
@Cron(CronExpression.EVERY_5_MINUTES)
// Có thể thay bằng:
// @Cron(CronExpression.EVERY_MINUTE)
// @Cron(CronExpression.EVERY_10_MINUTES)
// @Cron('*/2 * * * *') // Mỗi 2 phút
```

## Cài đặt người dùng
Người dùng có thể bật/tắt thông báo task trong phần cài đặt thông báo:
- Trường: `task_notifications` trong `NotificationSetting`

## Testing

### 1. Tạo sự kiện test
Tạo một task event có `start_time` sau 30 phút:
```typescript
{
  "title": "Test Event",
  "description": "This is a test event",
  "start_time": "2025-11-12T15:30:00Z", // 30 phút sau hiện tại
  "location": "Test Location",
  "user_id": "your_user_id"
}
```

### 2. Kiểm tra logs
Xem logs của productivity-service để theo dõi:
```
Checking for upcoming task events...
Found 1 upcoming events
Reminder email sent for event: Test Event to user@example.com
```

### 3. Kiểm tra email
- Kiểm tra hộp thư đến
- Xác nhận email có đầy đủ thông tin và format đẹp

## Lưu ý kỹ thuật

1. **Timezone**: Đảm bảo server time và database time đồng bộ
2. **Performance**: Query database với index trên trường `start_time` và `reminder_sent`
3. **Error handling**: Nếu gửi email thất bại, event không được đánh dấu đã gửi
4. **Cài đặt thông báo**: Luôn kiểm tra cài đặt thông báo của user trước khi gửi

## Mở rộng trong tương lai

1. **Tùy chỉnh thời gian nhắc nhở**: Cho phép user chọn nhắc trước 15, 30, 60 phút
2. **Nhiều lần nhắc nhở**: Gửi nhiều email (ví dụ: trước 1 ngày, 1 giờ, 30 phút)
3. **Nhắc nhở qua push notification**: Ngoài email, gửi thêm push notification
4. **Nhắc nhở qua SMS**: Tích hợp SMS cho các sự kiện quan trọng
5. **Snooze reminder**: Cho phép user hoãn nhắc nhở

## Troubleshooting

### Email không được gửi
1. Kiểm tra cài đặt `task_notifications` của user
2. Kiểm tra kết nối giữa productivity-service và notification-service
3. Kiểm tra cấu hình SMTP trong notification-service
4. Xem logs để tìm lỗi

### Gửi email trùng lặp
1. Kiểm tra trường `reminder_sent` trong database
2. Đảm bảo cron job không chạy trùng lặp
3. Kiểm tra timezone configuration

### Không tìm thấy sự kiện
1. Kiểm tra query trong `getUpcomingTaskEvents()`
2. Verify `start_time` của events trong database
3. Kiểm tra time window calculation
