import OpenAI from "openai";
import { Configuration, OpenAIApi } from "openai-edge";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openaiEdge = new OpenAIApi(configuration);
