'use server';

/**
 * @fileOverview Implements the Smart FAQ feature using Genkit.
 *
 * - smartFAQ - A function that answers user questions based on existing FAQ data.
 * - SmartFAQInput - The input type for the smartFAQ function.
 * - SmartFAQOutput - The return type for the smartFAQ function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartFAQInputSchema = z.object({
  question: z.string().describe('The user question about the products or services.'),
  faq: z.string().describe('The existing FAQ content as a string.'),
});
export type SmartFAQInput = z.infer<typeof SmartFAQInputSchema>;

const SmartFAQOutputSchema = z.object({
  answer: z.string().describe('The intelligent answer generated from the FAQ.'),
});
export type SmartFAQOutput = z.infer<typeof SmartFAQOutputSchema>;

export async function smartFAQ(input: SmartFAQInput): Promise<SmartFAQOutput> {
  return smartFAQFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartFAQPrompt',
  input: {schema: SmartFAQInputSchema},
  output: {schema: SmartFAQOutputSchema},
  prompt: `You are an intelligent FAQ answering system. You are given a question and the existing FAQ content.
  Your task is to generate an answer to the question using the information present in the FAQ.
  If the FAQ does not contain the answer, then respond that you are unable to answer the question.

  Question: {{{question}}}
  FAQ Content: {{{faq}}}
  Answer:`,
});

const smartFAQFlow = ai.defineFlow(
  {
    name: 'smartFAQFlow',
    inputSchema: SmartFAQInputSchema,
    outputSchema: SmartFAQOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
