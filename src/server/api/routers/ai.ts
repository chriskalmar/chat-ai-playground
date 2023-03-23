import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { Configuration, OpenAIApi } from "openai";
import { TRPCError } from "@trpc/server";
import axios from "axios";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

type Message = {
  role: "user" | "system" | "assistant";
  content: string;
};

const messages: Message[] = [];

export const aiRouter = createTRPCRouter({
  generateText: publicProcedure
    .input(z.object({ prompt: z.string() }))
    .mutation(async ({ input }) => {
      const { prompt } = input;

      messages.push({
        role: "user",
        content: prompt,
      });

      try {
        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages,
        });

        const generatedText = completion.data.choices[0]?.message?.content;

        if (generatedText) {
          messages.push({
            role: completion.data.choices[0]?.message?.role ?? "system",
            content: generatedText,
          });
        }

        return {
          generatedText: generatedText ?? "<no text generated>",
        };
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            message: error.response?.data?.error?.message,
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }),

  reset: publicProcedure.mutation(() => {
    messages.length = 0;
  }),
});
