import { Resend } from 'resend';
import { Twilio } from 'twilio';
import { WebClient } from '@slack/web-api';

// Initialize clients
const resend = new Resend(process.env.RESEND_API_KEY);
const twilio = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

interface NotificationContent {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical';
  data?: Record<string, any>;
}

interface NotificationTarget {
  email?: string;
  phone?: string;
  slackChannel?: string;
}

export async function sendNotification(
  content: NotificationContent,
  target: NotificationTarget,
  channels: string[]
) {
  const notifications = channels.map((channel) => {
    switch (channel) {
      case 'email':
        return sendEmailNotification(content, target.email!);
      case 'sms':
        return sendSMSNotification(content, target.phone!);
      case 'slack':
        return sendSlackNotification(content, target.slackChannel!);
      default:
        return Promise.resolve();
    }
  });

  try {
    await Promise.all(notifications);
    return { success: true };
  } catch (error) {
    console.error('Failed to send notifications:', error);
    throw new Error('Failed to send notifications');
  }
}

async function sendEmailNotification(content: NotificationContent, to: string) {
  const subject = `${content.type.toUpperCase()}: ${content.title}`;
  const html = `
    <h2>${content.title}</h2>
    <p>${content.message}</p>
    ${content.data ? `<pre>${JSON.stringify(content.data, null, 2)}</pre>` : ''}
  `;

  await resend.emails.send({
    from: 'CatchTrack <info@catchtrack.co.za>',
    to: [to],
    subject,
    html,
  });
}

async function sendSMSNotification(content: NotificationContent, to: string) {
  const message = `${content.type.toUpperCase()}: ${content.title}\n${content.message}`;

  await twilio.messages.create({
    body: message,
    to,
    from: process.env.TWILIO_PHONE_NUMBER,
  });
}

async function sendSlackNotification(content: NotificationContent, channel: string) {
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: content.title,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: content.message,
      },
    },
  ];

  if (content.data) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '```' + JSON.stringify(content.data, null, 2) + '```',
      },
    });
  }

  await slack.chat.postMessage({
    channel,
    blocks,
    text: content.message,
  });
}
