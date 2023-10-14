import {
  CreateScheduleCommand,
  DeleteScheduleCommand,
  GetScheduleCommand,
  SchedulerClient,
  UpdateScheduleCommand,
} from "@aws-sdk/client-scheduler";

import { StreakPeriod } from "./streak";

const UTC_DAYS_OF_WEEK_TO_AWS = {
  0: 7,
  1: 2,
  2: 3,
  3: 4,
  4: 5,
  5: 6,
  6: 1,
} as const;

const schedulerClient = new SchedulerClient({});

type StreakScheduleProps = {
  streakId: string;
  streakPeriod: StreakPeriod;
  userId: string;
  startTime: number;
};

export const createOrUpdateStreakSchedule = async ({
  userId,
  streakId,
  streakPeriod,
  startTime,
}: StreakScheduleProps) => {
  const scheduledAt = mapStreakPeriodToScheduleExpression(streakPeriod, startTime);
  const StartDate = new Date(startTime) > new Date() ? new Date(startTime) : undefined;

  const getCommand = new GetScheduleCommand({
    Name: streakId,
  });

  const existingSchedule = await schedulerClient.send(getCommand).catch((err) => {
    if (err.name === "ResourceNotFoundException") {
      console.info("no existing schedule. Creating first schedule for: ", {
        streakId,
      });
      return;
    }

    throw err;
  });

  if (existingSchedule?.State === "ENABLED") {
    console.debug("updating existing schedule", { scheduledAt });
    const updateCommand = new UpdateScheduleCommand({
      Name: streakId,
      ScheduleExpression: scheduledAt,
      Target: existingSchedule.Target,
      FlexibleTimeWindow: existingSchedule.FlexibleTimeWindow,
    });

    return schedulerClient.send(updateCommand);
  }

  const payload = {
    userId,
    streakId,
  };

  const command = new CreateScheduleCommand({
    Name: streakId,
    FlexibleTimeWindow: { Mode: "OFF" },
    ScheduleExpression: scheduledAt,
    StartDate,
    Target: {
      Arn: process.env.STREAK_VALUATOR_FUNCTION_ARN,
      RoleArn: process.env.STREAK_VALUATOR_FUNCTION_ROLE_ARN,
      Input: JSON.stringify(payload),
    },
  });

  const result = await schedulerClient.send(command);

  return result;
};

const mapStreakPeriodToScheduleExpression = (streakPeriod: StreakPeriod, startTime: number) => {
  console.info("mapStreakPeriodToScheduleExpression", { streakPeriod, startTime });
  const date = new Date(startTime);

  const dayOfWeek = date.getUTCDay() as keyof typeof UTC_DAYS_OF_WEEK_TO_AWS;

  console.info("dayOfWeek", { dayOfWeek });

  switch (streakPeriod) {
    case "daily":
      return `cron(0 0 * * ? *)`;
    case "weekly":
      return `cron(0 0 ? * ${UTC_DAYS_OF_WEEK_TO_AWS[dayOfWeek]} *)`;
    default:
      throw new Error("Invalid streakPeriod");
  }
};

export const deleteStreakSchedule = async (streakId: string) => {
  const command = new DeleteScheduleCommand({
    Name: streakId,
  });

  return schedulerClient.send(command);
};

export const createOrUpdateNotificationSchedule = async ({
  userId,
  period,
  hour,
  startDate,
  minute,
}: {
  userId: string;
  period: StreakPeriod;
  startDate: Date;
  hour: number;
  minute: number;
}) => {};

export const composeNotificationScheduleName = (userId: string) => {
  return `USER-${userId}-NOTIFICATION`;
};

export const getNotificationScheduleByName = async (userId: string) => {
  const name = composeNotificationScheduleName(userId);

  const command = new GetScheduleCommand({
    Name: name,
  });

  return schedulerClient.send(command);
};
