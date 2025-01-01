import { google } from 'googleapis';
import { Asana } from 'asana';
import { Jira } from 'jira.js';
import { Client as ServiceNowClient } from 'servicenow-rest-api';
import { Client as WorkdayClient } from 'workday-api';

// Initialize enterprise clients
const calendar = google.calendar({ version: 'v3', auth: process.env.GOOGLE_API_KEY });
const asana = Asana.Client.create().useAccessToken(process.env.ASANA_ACCESS_TOKEN);
const jira = new Jira({
  host: process.env.JIRA_HOST!,
  authentication: {
    basic: {
      email: process.env.JIRA_EMAIL!,
      apiToken: process.env.JIRA_API_TOKEN!,
    },
  },
});
const serviceNow = new ServiceNowClient({
  instance: process.env.SERVICENOW_INSTANCE!,
  username: process.env.SERVICENOW_USERNAME!,
  password: process.env.SERVICENOW_PASSWORD!,
});
const workday = new WorkdayClient({
  baseUrl: process.env.WORKDAY_API_URL!,
  token: process.env.WORKDAY_TOKEN!,
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
    data: {
      name: event.title,
      notes: event.description,
      projects: [target.asanaProject],
      due_on: event.dueDate?.toISOString(),
      assignee: event.assignee,
      custom_fields: {
        priority: event.priority,
        type: event.type,
        ...event.data,
      },
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

  return serviceNow.createIncident({
    short_description: event.title,
    description: event.description,
    priority: event.priority === 'high' ? 1 : event.priority === 'medium' ? 2 : 3,
    assigned_to: event.assignee,
    due_date: event.dueDate?.toISOString(),
    category: event.type,
    variables: event.data,
  });
}

async function createWorkdayTask(event: EnterpriseEvent, target: EnterpriseTarget) {
  if (!target.workdayTenant) return;

  return workday.createTask({
    tenant: target.workdayTenant,
    task: {
      title: event.title,
      description: event.description,
      priority: event.priority,
      dueDate: event.dueDate,
      assignee: event.assignee,
      metadata: {
        type: event.type,
        ...event.data,
      },
    },
  });
}
