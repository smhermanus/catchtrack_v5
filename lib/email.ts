import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface QuotaAlertEmailProps {
  to: string;
  vesselName: string;
  quotaAmount: number;
  remainingAmount: number;
  utilizationRate: number;
  daysUntilExpiry?: number;
}

export async function sendQuotaAlertEmail({
  to,
  vesselName,
  quotaAmount,
  remainingAmount,
  utilizationRate,
  daysUntilExpiry,
}: QuotaAlertEmailProps) {
  try {
    const subject = `Quota Alert: ${vesselName}`;

    let message = `
      <h2>Quota Alert for ${vesselName}</h2>
      <p>Current Status:</p>
      <ul>
        <li>Total Quota: ${quotaAmount.toFixed(2)} tons</li>
        <li>Remaining: ${remainingAmount.toFixed(2)} tons</li>
        <li>Utilization: ${utilizationRate.toFixed(1)}%</li>
      </ul>
    `;

    if (daysUntilExpiry !== undefined) {
      message += `
        <p>⚠️ This quota will expire in ${daysUntilExpiry} days.</p>
      `;
    }

    if (utilizationRate >= 90) {
      message += `
        <p>⚠️ Critical: Quota is nearly depleted!</p>
      `;
    } else if (utilizationRate >= 75) {
      message += `
        <p>⚠️ Warning: Quota is reaching high utilization.</p>
      `;
    }

    message += `
      <p>Please take appropriate action to manage your quota usage.</p>
      <p>View detailed analytics in your CatchTrack dashboard.</p>
    `;

    await resend.emails.send({
      from: 'CatchTrack <info@catchtrack.co.za>',
      to: [to],
      subject: 'CatchTrack Quota Alert',
      html: message,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send quota alert email:', error);
    return { success: false, error };
  }
}
