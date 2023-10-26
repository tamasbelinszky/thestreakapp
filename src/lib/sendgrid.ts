"use server";

import sendgridMail, { MailDataRequired } from "@sendgrid/mail";

const SENDGRID_FROM_EMAIL_ADDRESS = "hello@thestreakapp.com";

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY as string);

type SendEmailProps = Pick<MailDataRequired, "to" | "subject" | "html"> & { text: string };

export const sendEmail = async (props: SendEmailProps) =>
  sendgridMail.send({
    from: SENDGRID_FROM_EMAIL_ADDRESS,
    to: props.to,
    subject: props.subject,
    text: props.text,
    html: props.html,
  });

type StreakNotificationTemplateData = {
  name: string;
  description: string;
  startDate: string;
  period: string;
  streak: number;
  id: string;
  isCompleted: boolean;
  autoComplete: boolean;
  createdAt: string;
  updatedAt: string;
};

export const sendStreakNotification = async ({
  to,
  dynamicTemplateData,
}: {
  to: string;
  subject?: string;
  dynamicTemplateData: StreakNotificationTemplateData;
}) => {
  const msg = {
    to,
    subject: `🔥 Streak ${dynamicTemplateData.streak}: ${dynamicTemplateData.name}`,
    from: {
      email: SENDGRID_FROM_EMAIL_ADDRESS,
      name: "The Streak App",
    },
    templateId: "d-2dc48af167704842bdd7065f4f7b78f3",
    dynamic_template_data: dynamicTemplateData,
  };

  console.info({ msg }, "Sending streak notification");
  return sendgridMail.send(msg);
};
