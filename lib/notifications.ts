import { pusherServer } from './pusher';
import { db } from './db';

export async function sendNotification({
  title,
  message,
  type = 'info',
  userId,
}: {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  userId?: string;
}) {
  try {
    // Create notification in database
    const notification = await db.notification.create({
      data: {
        title,
        message,
        type,
        userId,
      },
    });

    // Send real-time notification
    await pusherServer.trigger('notifications', 'new-notification', {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      createdAt: notification.createdAt.toISOString(),
    });

    return notification;
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
}
