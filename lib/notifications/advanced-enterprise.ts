import { google } from 'googleapis';
import { Client as AsanaClient } from 'asana';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Version3Client } from 'jira.js';

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

const calendar = google.calendar({
  version: 'v3',
  auth: getRequiredEnvVar('GOOGLE_API_KEY'),
});

const asana = AsanaClient.create().useAccessToken(getRequiredEnvVar('ASANA_ACCESS_TOKEN'));

const jira = new Version3Client({
  host: getRequiredEnvVar('JIRA_HOST'),
  authentication: {
    basic: {
      email: getRequiredEnvVar('JIRA_EMAIL'),
      apiToken: getRequiredEnvVar('JIRA_API_TOKEN'),
    },
  },
});

export { calendar, asana, jira };

class ServiceNowClient {
  private readonly httpClient: AxiosInstance;
  private readonly baseUrl: string;

  constructor(options: { instance: string; username: string; password: string }) {
    this.baseUrl = `https://${options.instance}.service-now.com/api/now/table/`;

    this.httpClient = axios.create({
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization:
          'Basic ' + Buffer.from(`${options.username}:${options.password}`).toString('base64'),
      },
    });
  }

  async createRecord(table: string, data: Record<string, any>) {
    try {
      const response = await this.httpClient.post(this.baseUrl + table, data);
      return response.data;
    } catch (error) {
      console.error('ServiceNow API Error:', error);
      throw error;
    }
  }
}

class WorkdayClient {
  private readonly httpClient: AxiosInstance;
  private accessToken: string | null = null;

  constructor(options: { baseUrl: string; clientId: string; clientSecret: string }) {
    const basicAuth = Buffer.from(`${options.clientId}:${options.clientSecret}`).toString('base64');

    this.httpClient = axios.create({
      baseURL: options.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basicAuth}`,
      },
    });
  }

  private async getAccessToken() {
    if (this.accessToken) return this.accessToken;

    try {
      const response = await this.httpClient.post(
        '/oauth/token',
        {
          grant_type: 'client_credentials',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error) {
      console.error('Workday API Authentication Error:', error);
      throw error;
    }
  }

  async createTask(data: Record<string, any>) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await this.httpClient.post('/tasks', data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Workday API Error:', error);
      throw error;
    }
  }
}

const serviceNow = new ServiceNowClient({
  instance: getRequiredEnvVar('SERVICENOW_INSTANCE'),
  username: getRequiredEnvVar('SERVICENOW_USERNAME'),
  password: getRequiredEnvVar('SERVICENOW_PASSWORD'),
});

const workday = new WorkdayClient({
  baseUrl: getRequiredEnvVar('WORKDAY_API_URL'),
  clientId: getRequiredEnvVar('WORKDAY_CLIENT_ID'),
  clientSecret: getRequiredEnvVar('WORKDAY_CLIENT_SECRET'),
});

interface EnterpriseEvent {
  title: string;
  description: string;
  type: 'quota' | 'vessel' | 'catch' | 'report';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  assignee?: string;
  data?: Record<string, any>;
}

interface EnterpriseTarget {
  googleCalendar?: string;
  asanaProject?: string;
  jiraProject?: string;
  serviceNowInstance?: string;
  workdayTenant?: string;
}

export async function createEnterpriseEvent(
  event: EnterpriseEvent,
  target: EnterpriseTarget,
  integrations: string[]
) {
  const tasks = integrations.map((integration) => {
    switch (integration) {
      case 'calendar':
        return createGoogleCalendarEvent(event, target);
      case 'asana':
        return createAsanaTask(event, target);
      case 'jira':
        return createJiraIssue(event, target);
      case 'servicenow':
        return createServiceNowTicket(event, target);
      case 'workday':
        return createWorkdayTask(event, target);
      default:
        return Promise.resolve();
    }
  });

  try {
    const results = await Promise.all(tasks);
    return { success: true, results };
  } catch (error) {
    console.error('Failed to create enterprise events:', error);
    throw new Error('Failed to create enterprise events');
  }
}

// Implementation of individual service functions remains the same
async function createGoogleCalendarEvent(event: EnterpriseEvent, target: EnterpriseTarget) {
  if (!target.googleCalendar) return;

  const calendarEvent = {
    summary: event.title,
    description: event.description,
    start: {
      dateTime: event.dueDate?.toISOString() || new Date().toISOString(),
    },
    end: {
      dateTime: event.dueDate?.toISOString() || new Date().toISOString(),
    },
    colorId: event.priority === 'high' ? '11' : event.priority === 'medium' ? '5' : '2',
    attendees: event.assignee ? [{ email: event.assignee }] : undefined,
  };

  return calendar.events.insert({
    calendarId: target.googleCalendar,
    requestBody: calendarEvent,
  });
}

async function createAsanaTask(event: EnterpriseEvent, target: EnterpriseTarget) {
  if (!target.asanaProject) return;

  return asana.tasks.create({
    workspace: target.asanaProject,
    name: event.title,
    notes: event.description,
    projects: [target.asanaProject],
    due_on: event.dueDate?.toISOString().split('T')[0],
    assignee: event.assignee,
    custom_fields: {
      priority: event.priority,
      type: event.type,
      ...(event.data || {}),
    },
  });
}

async function createJiraIssue(event: EnterpriseEvent, target: EnterpriseTarget) {
  if (!target.jiraProject) return;

  return jira.issues.createIssue({
    fields: {
      project: { key: target.jiraProject },
      summary: event.title,
      description: event.description,
      issuetype: { name: 'Task' },
      priority: {
        name: event.priority.charAt(0).toUpperCase() + event.priority.slice(1),
      },
      duedate: event.dueDate?.toISOString(),
      assignee: { name: event.assignee },
      customfield_10000: event.type,
      ...Object.fromEntries(
        Object.entries(event.data || {}).map(([key, value]) => [`customfield_${key}`, value])
      ),
    },
  });
}

async function createServiceNowTicket(event: EnterpriseEvent, target: EnterpriseTarget) {
  if (!target.serviceNowInstance) return;

  const data = {
    short_description: event.title,
    description: event.description,
    priority: event.priority === 'high' ? 1 : event.priority === 'medium' ? 2 : 3,
    assigned_to: event.assignee,
    due_date: event.dueDate?.toISOString(),
    category: event.type,
    variables: event.data,
  };

  return serviceNow.createRecord('incident', data);
}

async function createWorkdayTask(event: EnterpriseEvent, target: EnterpriseTarget) {
  if (!target.workdayTenant) return;

  return workday.createTask({
    title: event.title,
    description: event.description,
    priority: event.priority,
    dueDate: event.dueDate,
    assignee: event.assignee,
    metadata: {
      type: event.type,
      ...event.data,
    },
  });
}
