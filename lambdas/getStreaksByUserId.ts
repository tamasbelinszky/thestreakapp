import { getStreaksByUserId } from "@/lib/streak";
import { ApiHandler } from "sst/node/api";

export const handler = ApiHandler(async (event) => {
  const userId = event.queryStringParameters?.userId;

  if (!userId) {
    return {
      statusCode: 401,
      body: "Unauthorized",
    };
  }

  const data = await getStreaksByUserId(userId);

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
});
