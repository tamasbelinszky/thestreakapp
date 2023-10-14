import mailchimp from "@mailchimp/mailchimp_marketing";
import { Config } from "sst/node/config";

mailchimp.setConfig({
  apiKey: Config.MAILCHIMP_API_KEY,
  server: Config.MAILCHIMP_SERVER_PREFIX,
});

type tags = "registered" | "unregistered" | "early-adapter";

export const subscribe = async ({
  email,
  firstName,
  lastName,
  tags,
}: {
  email: string;
  firstName: string;
  lastName: string;
  tags: tags[];
}) => {
  const listId = Config.MAILCHIMP_LIST_ID;

  const response = await mailchimp.lists.addListMember(listId, {
    email_address: email,
    status: "subscribed",
    merge_fields: {
      FNAME: firstName,
      LNAME: lastName,
    },
    tags,
  });

  console.log("Mailchimp response", response);
};
