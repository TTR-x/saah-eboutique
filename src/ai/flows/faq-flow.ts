'use server';
/**
 * @fileOverview Agent d'assistance IA pour SAAH Business.
 *
 * - askFaq - Fonction qui répond aux questions des utilisateurs en se basant sur la FAQ.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { faqContent } from '@/lib/data';

const FaqInputSchema = z.object({
  question: z.string().describe('La question posée par l\'utilisateur.'),
});

const FaqOutputSchema = z.object({
  answer: z.string().describe('La réponse formulée par l\'IA.'),
  foundInFaq: z.boolean().describe('Si la réponse a été trouvée dans les données fournies.'),
});

export async function askFaq(input: { question: string }) {
  return faqFlow(input);
}

const faqFlow = ai.defineFlow(
  {
    name: 'faqFlow',
    inputSchema: FaqInputSchema,
    outputSchema: FaqOutputSchema,
  },
  async (input) => {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      system: `Tu es l'assistant intelligent de SAAH Business, une plateforme d'épargne collaborative (tontine) et de vente d'articles (high-tech, mode, maison).
      Ton but est d'aider les utilisateurs en répondant à leurs questions de manière polie, concise et professionnelle.
      
      Utilise UNIQUEMENT les informations suivantes pour répondre. Si la réponse n'est pas dans le texte, indique poliment que tu ne sais pas et suggère de contacter le support via le formulaire.
      
      CONTENU DE LA FAQ :
      ${faqContent}`,
      prompt: input.question,
    });

    const text = response.text;
    const isUnknown = text.toLowerCase().includes("ne sais pas") || text.toLowerCase().includes("contacter le support");

    return {
      answer: text,
      foundInFaq: !isUnknown,
    };
  }
);
