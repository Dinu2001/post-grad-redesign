/**
 * Email notification service for the Postgraduate Portal.
 * Currently implements logging/mock; integrate with your email provider (SendGrid, AWS SES, etc.)
 */

import nodemailer, { type Transporter } from "nodemailer";

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * SMTP email delivery (defaults tuned for Gmail). Configure with env vars:
 *   SMTP_HOST  — SMTP server host (default: smtp.gmail.com)
 *   SMTP_PORT  — port (default: 465, SSL). Use 587 for STARTTLS.
 *   SMTP_USER  — your full email address (e.g. youruni@gmail.com)
 *   SMTP_PASS  — Gmail App Password (16 chars, NOT your normal password)
 *   EMAIL_FROM — optional "Display Name <address>"; defaults to SMTP_USER
 *
 * When SMTP_USER / SMTP_PASS are not set, emails are logged to the console so
 * local development still works without credentials.
 */
let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  if (!transporter) {
    const port = Number(process.env.SMTP_PORT ?? 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? "smtp.gmail.com",
      port,
      secure: port === 465, // 465 = implicit SSL; 587 = STARTTLS
      auth: { user, pass },
    });
  }
  return transporter;
}

async function sendEmail(data: EmailData): Promise<boolean> {
  const tx = getTransporter();
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || "";

  if (!tx) {
    console.log(`[EMAIL:dev] To: ${data.to}`);
    console.log(`[EMAIL:dev] Subject: ${data.subject}`);
    console.log(`[EMAIL:dev] Body: ${data.text || data.html}`);
    console.log("[EMAIL:dev] SMTP_USER/SMTP_PASS not set — email not actually sent.");
    return true;
  }

  try {
    await tx.sendMail({
      from,
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

/**
 * Send presentation date notification to student
 */
export async function sendPresentationDateNotification(
  studentEmail: string,
  studentName: string,
  presentationDate: Date,
  proposalTitle: string,
  supervisorNames: string[],
): Promise<void> {
  const dateStr = presentationDate.toLocaleString();
  const supervisorList = supervisorNames.join(", ");

  const html = `
    <h2>Presentation Date Assigned</h2>
    <p>Dear ${studentName},</p>
    <p>Your research proposal presentation has been scheduled:</p>
    <ul>
      <li><strong>Date & Time:</strong> ${dateStr}</li>
      <li><strong>Proposal:</strong> ${proposalTitle}</li>
      <li><strong>Supervisors:</strong> ${supervisorList}</li>
    </ul>
    <p>Please ensure you are well-prepared for your presentation. If you have any concerns, please contact the Registrar.</p>
    <p>Best regards,<br/>Wayamba University Registrar</p>
  `;

  const text = `
Your presentation has been scheduled for ${dateStr}.
Proposal: ${proposalTitle}
Supervisors: ${supervisorList}

Please be prepared to present on the scheduled date.
  `;

  await sendEmail({
    to: studentEmail,
    subject: "Presentation Date Assigned - Research Proposal",
    html,
    text: text.trim(),
  });
}

/**
 * Send presentation completion notification to registrar
 */
export async function sendPresentationCompletedNotification(
  registrarEmail: string,
  studentName: string,
  proposalTitle: string,
): Promise<void> {
  const html = `
    <h2>Presentation Completed</h2>
    <p>The following student's presentation has been marked as completed:</p>
    <ul>
      <li><strong>Student:</strong> ${studentName}</li>
      <li><strong>Proposal:</strong> ${proposalTitle}</li>
    </ul>
    <p>Please review the presentation result at your earliest convenience.</p>
  `;

  const text = `
Presentation Completed
Student: ${studentName}
Proposal: ${proposalTitle}

Please review the presentation result in the portal.
  `;

  await sendEmail({
    to: registrarEmail,
    subject: "Presentation Completed - Awaiting Review",
    html,
    text: text.trim(),
  });
}

/**
 * Send student approval notification with login credentials
 */
export async function sendStudentApprovalNotification(
  studentEmail: string,
  studentName: string,
  tempPassword: string,
): Promise<void> {
  const html = `
    <h2>Congratulations!</h2>
    <p>Dear ${studentName},</p>
    <p>Your postgraduate application has been approved!</p>
    <p>You can now log in to the Student Dashboard with these credentials:</p>
    <ul>
      <li><strong>Email:</strong> ${studentEmail}</li>
      <li><strong>Temporary Password:</strong> <code>${tempPassword}</code></li>
    </ul>
    <p><strong>Important:</strong> You must change your temporary password on your first login.</p>
    <p>Log in here: <a href="#">https://portal.university.edu/login</a></p>
  `;

  const text = `
Congratulations! Your postgraduate application has been approved.

Email: ${studentEmail}
Temporary Password: ${tempPassword}

You must change your password on first login.
Login: https://portal.university.edu/login
  `;

  await sendEmail({
    to: studentEmail,
    subject: "Application Approved - Student Portal Access",
    html,
    text: text.trim(),
  });
}

/**
 * Send presentation approved notification to student
 */
export async function sendPresentationApprovedNotification(
  studentEmail: string,
  studentName: string,
): Promise<void> {
  const html = `
    <h2>Presentation Approved</h2>
    <p>Dear ${studentName},</p>
    <p>Congratulations! Your research presentation has been approved.</p>
    <p>You are now officially registered as a postgraduate student.</p>
  `;

  const text = `
Congratulations! Your research presentation has been approved.
You are now registered as a postgraduate student.
  `;

  await sendEmail({
    to: studentEmail,
    subject: "Presentation Approved - Postgraduate Registration Confirmed",
    html,
    text: text.trim(),
  });
}

/**
 * Send password reset notification
 */
export async function sendPasswordResetNotification(
  studentEmail: string,
  studentName: string,
  tempPassword: string,
): Promise<void> {
  const html = `
    <h2>Password Reset</h2>
    <p>Dear ${studentName},</p>
    <p>Your portal password has been reset. Your new temporary password is:</p>
    <p><code>${tempPassword}</code></p>
    <p>You must change this password on your next login.</p>
  `;

  const text = `
Your password has been reset.
Temporary Password: ${tempPassword}

You must change this password on your next login.
  `;

  await sendEmail({
    to: studentEmail,
    subject: "Password Reset - Postgraduate Portal",
    html,
    text: text.trim(),
  });
}

/**
 * Notify applicant that their registration was rejected.
 */
export async function sendRegistrationRejectedNotification(
  studentEmail: string,
  studentName: string,
  reason?: string,
): Promise<void> {
  const detail = reason?.trim() ? `Reason: ${reason}` : "Please contact the Registrar for guidance.";

  const html = `
    <h2>Registration Decision</h2>
    <p>Dear ${studentName},</p>
    <p>We regret to inform you that your postgraduate application was not approved.</p>
    <p>${detail}</p>
    <p>If you wish to reapply, please contact the Registrar's office for the next steps.</p>
  `;

  const text = `
Your postgraduate application has been rejected.

${detail}

If you wish to reapply, please contact the Registrar's office for the next steps.
  `;

  await sendEmail({
    to: studentEmail,
    subject: "Application Status Update - Registration Rejected",
    html,
    text: text.trim(),
  });
}
