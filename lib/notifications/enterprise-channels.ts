import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';
import { ClientSecretCredential } from '@azure/identity';
import axios, { AxiosInstance } from 'axios';
import jwt from 'jsonwebtoken';

interface ZoomMeetingOptions {
  topic: string;
  startTime: Date;
  duration: number;
  timezone?: string;
  agenda?: string;
  type?: 'instant' | 'scheduled' | 'recurring';
}

interface ZoomUserOptions {
  email: string;
  firstName?: string;
  lastName?: string;
  type?: number;
}

interface TeamsNotificationOptions {
  title: string;
  message: string;
  data?: Record<string, any>;
  attachments?: any[];
  channelId?: string;
  teamId?: string;
}

export class MicrosoftGraphIntegration {
  private client: Client;

  constructor() {
    const credential = new ClientSecretCredential(
      process.env.AZURE_TENANT_ID || '',
      process.env.AZURE_CLIENT_ID || '',
      process.env.AZURE_CLIENT_SECRET || ''
    );

    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ['https://graph.microsoft.com/.default'],
    });

    this.client = Client.initWithMiddleware({
      authProvider: authProvider,
    });
  }

  async sendTeamsChannelMessage(options: TeamsNotificationOptions) {
    if (!options.teamId || !options.channelId) {
      throw new Error('Team and Channel IDs are required');
    }

    try {
      const message = {
        body: {
          content: `
            <h2>${options.title}</h2>
            <p>${options.message}</p>
            ${
              options.data
                ? `<div>
                  ${Object.entries(options.data)
                    .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                    .join('<br/>')}
                </div>`
                : ''
            }
          `,
        },
      };

      await this.client
        .api(`/teams/${options.teamId}/channels/${options.channelId}/messages`)
        .post(message);
    } catch (error) {
      console.error('Failed to send Teams message:', error);
      throw error;
    }
  }

  async sendTeamsDirectMessage(userId: string, options: TeamsNotificationOptions) {
    try {
      const chatMessage = {
        body: {
          content: `
            <h2>${options.title}</h2>
            <p>${options.message}</p>
            ${
              options.data
                ? `<div>
                  ${Object.entries(options.data)
                    .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                    .join('<br/>')}
                </div>`
                : ''
            }
          `,
        },
      };

      await this.client.api(`/users/${userId}/chats/allWithUser`).post(chatMessage);
    } catch (error) {
      console.error('Failed to send direct Teams message:', error);
      throw error;
    }
  }

  async listTeams() {
    try {
      const teams = await this.client.api('/teams').get();
      return teams.value;
    } catch (error) {
      console.error('Failed to list teams:', error);
      throw error;
    }
  }

  async createTeamsChannel(teamId: string, channelName: string, description?: string) {
    try {
      const newChannel = {
        displayName: channelName,
        description: description || '',
      };

      const channel = await this.client.api(`/teams/${teamId}/channels`).post(newChannel);
      return channel;
    } catch (error) {
      console.error('Failed to create Teams channel:', error);
      throw error;
    }
  }
}

async function sendTeamsNotification() {
  const graphIntegration = new MicrosoftGraphIntegration();

  try {
    await graphIntegration.sendTeamsChannelMessage({
      teamId: 'your-team-id',
      channelId: 'your-channel-id',
      title: 'Project Update',
      message: 'New milestone achieved!',
      data: {
        milestone: 'Alpha Release',
        progress: '85%',
      },
    });
  } catch (error) {
    console.error('Notification failed');
  }
}

export class ZoomIntegration {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = 'https://api.zoom.us/v2';
  private axiosInstance: AxiosInstance;

  constructor() {
    this.apiKey = process.env.ZOOM_API_KEY || '';
    this.apiSecret = process.env.ZOOM_API_SECRET || '';

    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Zoom API credentials are missing');
    }

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private generateJWT(): string {
    const payload = {
      iss: this.apiKey,
      exp: Date.now() + 1000 * 60 * 60, // 1 hour expiration
    };
    return jwt.sign(payload, this.apiSecret);
  }

  async createMeeting(options: ZoomMeetingOptions) {
    try {
      const response = await this.axiosInstance.post(
        '/users/me/meetings',
        {
          topic: options.topic,
          type: options.type || 'scheduled',
          start_time: options.startTime.toISOString(),
          duration: options.duration,
          timezone: options.timezone || 'UTC',
          agenda: options.agenda,
        },
        {
          headers: {
            Authorization: `Bearer ${this.generateJWT()}`,
          },
        }
      );

      return {
        meetingId: response.data.id,
        joinUrl: response.data.join_url,
        startUrl: response.data.start_url,
      };
    } catch (error) {
      console.error('Failed to create Zoom meeting:', error);
      throw error;
    }
  }

  async createUser(options: ZoomUserOptions) {
    try {
      const response = await this.axiosInstance.post(
        '/users',
        {
          action: 'create',
          user_info: {
            email: options.email,
            first_name: options.firstName,
            last_name: options.lastName,
            type: options.type || 1,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.generateJWT()}`,
          },
        }
      );

      return {
        userId: response.data.id,
        email: response.data.email,
      };
    } catch (error) {
      console.error('Failed to create Zoom user:', error);
      throw error;
    }
  }

  async listMeetings() {
    try {
      const response = await this.axiosInstance.get('/users/me/meetings', {
        headers: {
          Authorization: `Bearer ${this.generateJWT()}`,
        },
        params: {
          type: 'live',
        },
      });

      return response.data.meetings || [];
    } catch (error) {
      console.error('Failed to list Zoom meetings:', error);
      throw error;
    }
  }
}

// Example usage
async function scheduleTeamMeeting() {
  const zoom = new ZoomIntegration();

  try {
    const meeting = await zoom.createMeeting({
      topic: 'Team Sync Meeting',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      duration: 60, // 1 hour
      agenda: 'Weekly team sync and project updates',
    });

    console.log('Meeting created:', meeting.joinUrl);
  } catch (error) {
    console.error('Meeting scheduling failed');
  }
}
