
'use server';
/**
 * @fileOverview A Genkit flow to detect a food dish from an uploaded image.
 *
 * - detectDishFromImage - A function that identifies a dish from an image data URI.
 * - DetectDishFromImageInput - The input type for the detectDishFromImage function.
 * - DetectDishFromImageOutput - The return type for the detectDishFromImage function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const DetectDishFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a food item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectDishFromImageInput = z.infer<typeof DetectDishFromImageInputSchema>;

const DetectDishFromImageOutputSchema = z.object({
  isFoodItem: z.boolean().describe('True if the image contains a recognizable food item, false otherwise.'),
  dishName: z.string().describe('The name of the identified food dish. If not a food item or not identifiable, provide a descriptive message like "Not a food item" or "Dish not recognized".'),
});
export type DetectDishFromImageOutput = z.infer<typeof DetectDishFromImageOutputSchema>;

export async function detectDishFromImage(input: DetectDishFromImageInput): Promise<DetectDishFromImageOutput> {
  return detectDishFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectDishPrompt',
  input: {schema: DetectDishFromImageInputSchema},
  output: {schema: DetectDishFromImageOutputSchema},
  prompt: `You are an expert food identification AI. Analyze the provided image carefully.
Based on the image, determine:
1.  If the image primarily contains a food item.
2.  If it is a food item, identify the name of the dish.

Image: {{media url=imageDataUri}}

Respond with the following JSON structure. For 'dishName', if the image is not a food item or the dish cannot be identified, use a clear message like "Not a food item" or "Dish not recognized". Do not invent dishes if unsure.
`,
});

const detectDishFlow = ai.defineFlow(
  {
    name: 'detectDishFlow',
    inputSchema: DetectDishFromImageInputSchema,
    outputSchema: DetectDishFromImageOutputSchema,
  },
  async (input: DetectDishFromImageInput) => {
    const {output} = await prompt(input);
    if (!output) {
      // Fallback in case the LLM fails to produce structured output
      return {
        isFoodItem: false,
        dishName: "Dish detection failed. No response from AI.",
      };
    }
    return output;
  }
);
