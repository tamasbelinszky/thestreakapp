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
import { Table } from "sst/node/table";

import { getStreakById } from "./streak";

export const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  streaming: true,
});

export const chainz = async ({ streakId }: { streakId: string }) => {
  // TODO: learn how to use this
  const getCurrentDate = () => {
    return new Date().toISOString();
  };

  const { data } = await getStreakById(streakId);
  if (!data) throw new Error("Streak not found");
  const { name, description, startDate, period, autoComplete, isCompleted } = data;

  const prompt = new PromptTemplate({
    template: `
    You are Andrew Huberman, a neuroscientist known for providing structured advice and plans to set and achieve goals. All responses should be friendly, informative, and based on scientific principles. You are helping your clients to set and achieve goals. You call these goals streaks.
    Streak's name: {name},
    Streak's description: {description},
    Streak's start date: {startDate},
    Period which the streak is evaluated: {period},
    If autoComplete set to true, clients only required to tell you when they couldn't complete the streak in the given period: {autoComplete},
    If completed it means the client successfully completed the streak for the current period: {isCompleted},
    current Date: {currentDate}
  `,
    inputVariables: [],
    partialVariables: {
      currentDate: getCurrentDate(),
      autoComplete: autoComplete ? "true" : "false",
      isCompleted: isCompleted ? "true" : "false",
      name,
      description,
      startDate: new Date(startDate).toISOString().split("T")[0],
      period,
    },
  });

  const systemMessagePrompt = new SystemMessagePromptTemplate({
    prompt,
  });

  const chatPrompt = ChatPromptTemplate.fromMessages<{
    input_language: string;
    output_language: string;
    text: string;
  }>([systemMessagePrompt]);

  const chatHistory = createChatHistory(streakId);

  const isFirstMessage = await chatHistory.getMessages().then((messages) => messages.length === 0);
  console.log("langchain.ts: isFirstMessage", isFirstMessage);

  const memory = new BufferMemory({
    chatHistory,
  });

  const chainz = new ConversationChain({ llm: model, memory, prompt: isFirstMessage ? chatPrompt : undefined });

  return chainz;
};

export const getLangChainMessages = async (streakId: string) => {
  const chatHistory = createChatHistory(streakId);

  return chatHistory.getMessages();
};

const createChatHistory = (streakId: string) => {
  const chatHistory = new DynamoDBChatMessageHistory({
    tableName: Table.table.tableName,
    partitionKey: "pk",
    // could not use anything else here
    sortKey: "sk",
    sessionId: streakId, // unique id for the conversation
    config: {
      region: process.env.NEXT_AUTH_AWS_REGION,
      credentials: {
        accessKeyId: process.env.NEXT_AUTH_AWS_ACCESS_KEY as string,
        secretAccessKey: process.env.NEXT_AUTH_AWS_SECRET_KEY as string,
      },
    },
  });

  return chatHistory;
};
