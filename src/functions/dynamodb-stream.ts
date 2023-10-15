import { subscribe } from "@/lib/mailchimp";
import { DynamoDBStreamEvent, Handler } from "aws-lambda";
import { z } from "zod";

const DynamoDBStringAttribute = z.object({
  S: z.string(),
});

const DynamoDBNullAttribute = z.object({
  NULL: z.boolean(),
});

const UserSchema = z.object({
  pk: DynamoDBStringAttribute,
  sk: DynamoDBStringAttribute,
  email: DynamoDBStringAttribute,
  name: DynamoDBStringAttribute,
  emailVerified: DynamoDBNullAttribute.optional(),
  image: DynamoDBStringAttribute.optional(),
  gsi1sk: DynamoDBStringAttribute.optional(),
  gsi1pk: DynamoDBStringAttribute.optional(),
  // TODO: maybe store preference as a separate entity?
  id: DynamoDBStringAttribute,
  type: DynamoDBStringAttribute.optional(),
});

export const handler: Handler<DynamoDBStreamEvent> = async (event) => {
  for (const record of event.Records) {
    const pkValue = record?.dynamodb?.Keys?.pk?.S;
    const skValue = record?.dynamodb?.Keys?.sk?.S;

    if (pkValue?.startsWith("USER#") && skValue?.startsWith("USER#")) {
      try {
        const payload = record?.dynamodb?.NewImage;
        console.log(`Attempt to mailchimp.subscribe new user. Validating record: ${JSON.stringify(payload)}`);

        const validatedData = UserSchema.parse(payload);
        const email = validatedData.email.S;
        const name = validatedData.name.S;

        const [firstName, ...lastNameParts] = name.split(" ");
        const lastName = lastNameParts.join(" ");

        await subscribe({
          firstName,
          lastName,
          email,
          tags: ["registered", "early-adapter"],
        });

        console.info("successfully subscribed", {
          firstName,
          lastName,
          email,
        });
      } catch (err) {
        console.error(`Failed to validate record: ${err}`);
      }
    } else {
      console.log(`Skipping record: ${JSON.stringify(record)}`);
    }
  }
};
