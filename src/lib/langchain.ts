import { ConversationChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferMemory } from "langchain/memory";
import { ChatPromptTemplate, PromptTemplate, SystemMessagePromptTemplate } from "langchain/prompts";
import { DynamoDBChatMessageHistory } from "langchain/stores/message/dynamodb";
import { Table } from "sst/node/table";

import { getStreakById } from "./streak";

export const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  streaming: true,
});

export const chainz = async ({ streakId, username, input }: { streakId: string; username: string; input: string }) => {
  const getCurrentDate = () => {
    return new Date().toISOString();
  };

  const { data } = await getStreakById(streakId);
  if (!data) throw new Error("Streak not found");
  const { name, description, startDate, period, autoComplete, isCompleted } = data;

  const chatId = composeChatId({ streakId });

  const prompt = new PromptTemplate({
    template: `
    You are Andrew Huberman, a neuroscientist known for providing structured advice and plans to set and achieve goals. All responses should be friendly, informative, and based on scientific principles. You are helping your clients to set and achieve goals. You call these goals streaks.
    You never reveal your identity to your clients. You have a knack for asking meaningful questions that guide your clients towards their goals. Your responses are concise and to the point. You avoid being overly chatty, repetitive, or robotic. You don't use filler words like "um" or "uh", and you never apologize.

    Your client's name is: {username}
    Streak's name: {name},
    Streak's description: {description},
    Streak's start date: {startDate},
    Period which the streak is evaluated: {period},
    If autoComplete is set to true, clients only need to inform you when they couldn't complete the streak in the given period: {autoComplete},
    If completed, it means the client successfully achieved the streak for the current period: {isCompleted},
    Current Date: {currentDate}

    The client's message is: {input}
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
      username,
      input,
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

  const chatHistory = createChatHistory({ chatId });

  const memory = new BufferMemory({
    chatHistory,
  });

  const chainz = new ConversationChain({ llm: model, memory, prompt: chatPrompt });

  return chainz;
};

export const composeChatId = ({ streakId }: { streakId: string }) => {
  return `CHAT#${streakId}`;
};

const createChatHistory = ({ chatId }: { chatId: string }) => {
  const chatHistory = new DynamoDBChatMessageHistory({
    tableName: Table.table.tableName,
    partitionKey: "pk",
    // this will result in "sk" as value which is fine
    sortKey: "sk",
    sessionId: chatId, // unique id for the conversation
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

export const deleteChatHistory = async ({ streakId }: { streakId: string }) => {
  const chatId = composeChatId({ streakId });
  const chatHistory = createChatHistory({ chatId });

  return chatHistory.clear();
};

export const getChatHistoryByStreakId = async ({ streakId }: { streakId: string }) => {
  const chatId = composeChatId({ streakId });
  const chatHistory = createChatHistory({ chatId });

  return chatHistory.getMessages();
};
