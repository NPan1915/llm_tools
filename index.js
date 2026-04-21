import 'dotenv/config';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "langchain/tools";
import { z } from "zod";

const multiply = tool(
  async ({ a, b }) => {
    console.log("TOOL called: multiply");
    return a * b;
  },
  {
    name: "multiply",
    description: "Multiply two numbers",
    schema: z.object({
      a: z.number(),
      b: z.number(),
    }),
  }
);

const getCurrentTime = tool(
  async () => {
    console.log("TOOL called: getCurrentTime");

    const now = new Date();
    return now.toString(); 
  },
  {
    name: "getCurrentTime",
    description: "Get the current date and time",
    schema: z.object({}), 
  }
);

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  temperature: 0,
});

const llmWithTools = llm.bindTools([multiply, getCurrentTime]);

const response = await llmWithTools.invoke(
  "What is the time right now? You must use the getCurrentTime tool."
);

console.log("Response:", response.content);
console.log("Tool calls:", response.tool_calls);

if (response.tool_calls && response.tool_calls.length > 0) {
  const toolCall = response.tool_calls[0];

  if (toolCall.name === "multiply") {
    const result = await multiply.invoke(toolCall.args);
    console.log("TOOL result:", result);
  }

  if (toolCall.name === "getCurrentTime") {
    const result = await getCurrentTime.invoke(toolCall.args);
    console.log("TOOL result:", result);
  }
}