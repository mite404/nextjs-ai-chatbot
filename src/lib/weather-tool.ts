import { z } from 'zod';
import { tool } from 'ai';

export const weatherTool = tool({
  description: 'a tool to check the internet for weather forecasts',
  inputSchema: z.object({
    location: z.string().describe('The location to get the weather for'),
  }),
  execute: async ({ location }) => ({
    location,
    temperature: 72 + Math.floor(Math.random() * 21) - 10,
  }),
});
