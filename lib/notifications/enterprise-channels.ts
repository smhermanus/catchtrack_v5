import { Client as TeamsClient } from '@microsoft/microsoft-graph-client';
import { Client as DiscordClient } from 'discord.js';
import { ZoomClient } from '@zoom/zoom-api';
import { Client as WebexClient } from 'webex';

// Initialize enterprise clients
const teamsClient = TeamsClient.init({
  authProvider: (done) => {
    done(null, process.env.TEAMS_ACCESS_TOKEN);
  },
});

const discordClient = new DiscordClient({
  intents: ['GuildMessages', 'DirectMessages'],
});
discordClient.login(process.env.DISCORD_BOT_TOKEN);

const zoomClient = new ZoomClient({
  clientId: process.env.ZOOM_CLIENT_ID,
  clientSecret: process.env.ZOOM_CLIENT_SECRET,
});

const webexClient = new WebexClient({
  credentials: {
    access_token: process.env.WEBEX_ACCESS_TOKEN,
  },
});

interface EnterpriseNotification {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical';
  data?: Record<string, any>;
  attachments?: {
    name: string;
    content: Buffer;
    contentType: string;
  }[];
}

interface EnterpriseTarget {
  teamsChannel?: string;
  teamsUser?: string;
  discordChannel?: string;
  discordUser?: string;
  zoomChannel?: string;
  webexRoom?: string;
}

export async function sendEnterpriseNotification(
  notification: EnterpriseNotification,
  target: EnterpriseTarget,
  channels: string[]
) {
  const notifications = channels.map(channel => {
    switch (channel) {
      case 'teams':
        return sendTeamsNotification(notification, target);
      case 'discord':
        return sendDiscordNotification(notification, target);
      case 'zoom':
        return sendZoomNotification(notification, target);
      case 'webex':
        return sendWebexNotification(notification, target);
      default:
        return Promise.resolve();
    }
  });

  try {
    await Promise.all(notifications);
    return { success: true };
  } catch (error) {
    console.error('Failed to send enterprise notifications:', error);
    throw new Error('Failed to send enterprise notifications');
  }
}

async function sendTeamsNotification(
  notification: EnterpriseNotification,
  target: EnterpriseTarget
) {
  const card = {
    type: 'AdaptiveCard',
    version: '1.4',
    body: [
      {
        type: 'TextBlock',
        size: 'Medium',
        weight: 'Bolder',
        text: notification.title,
      },
      {
        type: 'TextBlock',
        text: notification.message,
        wrap: true,
      },
    ],
  };

  if (notification.data) {
    card.body.push({
      type: 'FactSet',
      facts: Object.entries(notification.data).map(([key, value]) => ({
        title: key,
        value: String(value),
      })),
    });
  }

  if (target.teamsChannel) {
    await teamsClient.api(`/teams/${target.teamsChannel}/channels`)
      .post({
        body: {
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: card,
        },
      });
  }

  if (target.teamsUser) {
    await teamsClient.api(`/users/${target.teamsUser}/chat/messages`)
      .post({
        body: {
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: card,
        },
      });
  }
}

async function sendDiscordNotification(
  notification: EnterpriseNotification,
  target: EnterpriseTarget
) {
  const embed = {
    title: notification.title,
    description: notification.message,
    color: notification.type === 'critical' ? 0xFF0000 : 
           notification.type === 'warning' ? 0xFFA500 : 
           0x00FF00,
    fields: notification.data ? 
      Object.entries(notification.data).map(([key, value]) => ({
        name: key,
        value: String(value),
        inline: true,
      })) : [],
    timestamp: new Date(),
  };

  if (target.discordChannel) {
    const channel = await discordClient.channels.fetch(target.discordChannel);
    if (channel?.isTextBased()) {
      await channel.send({ embeds: [embed] });
    }
  }

  if (target.discordUser) {
    const user = await discordClient.users.fetch(target.discordUser);
    await user.send({ embeds: [embed] });
  }
}

async function sendZoomNotification(
  notification: EnterpriseNotification,
  target: EnterpriseTarget
) {
  if (target.zoomChannel) {
    const message = {
      message: `**${notification.title}**\n\n${notification.message}`,
      to_channel: target.zoomChannel,
    };

    if (notification.data) {
      message.message += '\n\n' + Object.entries(notification.data)
        .map(([key, value]) => `**${key}**: ${value}`)
        .join('\n');
    }

    await zoomClient.chat.post(message);
  }
}

async function sendWebexNotification(
  notification: EnterpriseNotification,
  target: EnterpriseTarget
) {
  if (target.webexRoom) {
    let markdown = `**${notification.title}**\n\n${notification.message}`;

    if (notification.data) {
      markdown += '\n\n' + Object.entries(notification.data)
        .map(([key, value]) => `**${key}**: ${value}`)
        .join('\n');
    }

    await webexClient.messages.create({
      roomId: target.webexRoom,
      markdown,
      attachments: notification.attachments,
    });
  }
}
