import type { Handler } from "aws-lambda";
import { z } from "zod";

export const lambdaHandler = <T extends z.ZodType<any, any>>(schema: T, handler: Handler<z.infer<T>, any>): Handler => {
  return async (event, context, callback) => {
    try {
      if (!schema) {
        throw new Error("No schema provided");
      }
      console.debug(JSON.stringify(event, null, 2), "Lambda have been called.");

      const parsedEvent = schema.parse(event);

      return handler(parsedEvent, context, callback);
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        if (err instanceof z.ZodError) {
          console.error(JSON.stringify(event, null, 2), "Invalid event payload", err.errors);
          throw err;
        }
        throw err;
      }

      console.error("Unknown error", err);
      throw new Error(String(err));
    }
  };
};
