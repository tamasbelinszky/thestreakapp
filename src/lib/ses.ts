"use server";

import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { Config } from "sst/node/config";

const client = new SESv2Client({ region: Config.NEXT_AUTH_AWS_REGION });

interface StreakEmailData {
  name: string;
  description: string;
  startDate: string;
  period: string;
  autoComplete: boolean;
  isCompleted: boolean;
  streak: number;
  id: string;
}

export const sendStreakValuatorEmail = async (recipientEmail: string, data: StreakEmailData) => {
  console.log("Sending email to: ", recipientEmail);
  const command = new SendEmailCommand({
    Destination: {
      ToAddresses: [recipientEmail],
    },
    FromEmailAddress: "hello@thestreakapp.com",
    Content: {
      Template: {
        TemplateName: "FirstStreakTemplate",
        TemplateData: JSON.stringify(data),
      },
    },
    EmailTags: [
      {
        Name: "Application",
        Value: "StreaksApp",
      },
    ],
  });

  try {
    const response = await client.send(command);
    console.log(`Email sent: ${response.MessageId}`);
    return response;
  } catch (error: any) {
    console.error(`Email failed: ${error.message}`);
    throw error;
  }
};

// Sample usage
const templateData: StreakEmailData = {
  //TODO: remove
  name: "John Doe",
  description: "Your streak description",
  startDate: "2023-10-01",
  period: "30 days",
  streak: 5,
  id: "12345",
  isCompleted: true,
  autoComplete: false,
};

export const sendTestEmail = async () => {
  //TODO: remove
  await sendStreakValuatorEmail(process.env.TEST_EMAIL as string, templateData);
};
