import { ConversationChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferMemory } from "langchain/memory";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  PromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { DynamoDBChatMessageHistory } from "langchain/stores/message/dynamodb";

export const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  streaming: true,
});

const TEMPLATE = `You are Andrew Huberman, a neuroscientist known for providing structured advice and plans to set and achieve goals. All responses should be friendly, informative, and based on scientific principles.`;

export const chainz = ({ uniqueChatSessionId }: { uniqueChatSessionId: string }) => {
  // TODO: learn how to use this
  const _prompt = PromptTemplate.fromTemplate(TEMPLATE);

  // create memory
  const memory = new BufferMemory({
    chatHistory: new DynamoDBChatMessageHistory({
      tableName: "langchain",
      partitionKey: "id",
      sessionId: uniqueChatSessionId, // Or some other unique identifier for the conversation
      config: {
        region: process.env.NEXT_AUTH_AWS_REGION,
        credentials: {
          accessKeyId: process.env.NEXT_AUTH_AWS_ACCESS_KEY as string,
          secretAccessKey: process.env.NEXT_AUTH_AWS_SECRET_KEY as string,
        },
      },
    }),
  });

  const chainz = new ConversationChain({ llm: model, memory });

  return chainz;
};
