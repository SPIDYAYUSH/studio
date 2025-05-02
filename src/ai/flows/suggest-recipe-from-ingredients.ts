
// src/ai/flows/suggest-recipe-from-ingredients.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting Indian recipes based on available ingredients,
 * spice level preference, and regional flavor preference.
 *
 * - suggestRecipeFromIngredients - A function that suggests a recipe based on the provided inputs.
 * - SuggestRecipeFromIngredientsInput - The input type for the suggestRecipeFromIngredients function.
 * - SuggestRecipeFromIngredientsOutput - The return type for the suggestRecipeFromIngredients function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

// Define the input schema including optional spice level and regional flavor
const SuggestRecipeFromIngredientsInputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('An array of ingredients available in the fridge.'),
  spiceLevel: z.string().optional().describe('Desired spice level (e.g., Mild, Medium, Spicy).'),
  regionalFlavor: z.string().optional().describe('Desired regional flavor (e.g., North Indian, South Indian, Any).'),
});
export type SuggestRecipeFromIngredientsInput = z.infer<
  typeof SuggestRecipeFromIngredientsInputSchema
>;

// Use a specific output schema matching the prompt's expected output
const SuggestRecipeFromIngredientsOutputSchema = z.object({
  recipeName: z.string().describe('The name of the suggested recipe.'),
  ingredients: z.array(z.string()).describe('The list of ingredients required for the recipe (may include items not originally provided if essential).'),
  instructions: z.array(z.string()).describe('Step-by-step instructions to make the recipe.'),
  calorieCount: z.number().optional().describe('Approximate calorie count per serving.'),
  spiceLevel: z.string().optional().describe('Spice level (e.g., Mild, Medium, Spicy).'),
  regionalFlavor: z.string().optional().describe('Regional origin or style (e.g., North Indian, Gujarati, South Indian).'),
});
export type SuggestRecipeFromIngredientsOutput = z.infer<
  typeof SuggestRecipeFromIngredientsOutputSchema
>;

// Define the function that will be called from the frontend
export async function suggestRecipeFromIngredients(
  input: SuggestRecipeFromIngredientsInput
): Promise<SuggestRecipeFromIngredientsOutput> {
  return suggestRecipeFromIngredientsFlow(input);
}

// Define the prompt for the AI model, updated to use preferences
const prompt = ai.definePrompt({
  name: 'suggestRecipeFromIngredientsPrompt',
  input: {
    schema: SuggestRecipeFromIngredientsInputSchema, // Use the updated input schema
  },
  output: {
    schema: SuggestRecipeFromIngredientsOutputSchema,
  },
  // The prompt instructs the AI on its persona and task, including preferences
  prompt: `You are a helpful and warm Indian mom. A user will provide you with ingredients they have available {{#if spiceLevel}}and their desired spice level ({{{spiceLevel}}}){{/if}}{{#if regionalFlavor}} and regional flavor preference ({{{regionalFlavor}}}){{/if}}. Respond with a delicious Indian recipe they can make using primarily those ingredients (you can suggest adding common pantry staples if necessary).

{{#if spiceLevel}}Consider the user's preferred spice level: {{{spiceLevel}}}.{{/if}}
{{#if regionalFlavor}}Consider the user's preferred regional flavor: {{{regionalFlavor}}}. If they specified 'Any', feel free to choose.{{/if}}

Provide the following details for the recipe:
- recipeName: The name of the dish.
- ingredients: A list of ingredients needed for the recipe.
- instructions: Clear, step-by-step cooking instructions.
- calorieCount: An estimated calorie count per serving (optional, provide if you can reasonably estimate).
- spiceLevel: The resulting spice level (Mild, Medium, Spicy).
- regionalFlavor: The regional origin or style of the dish (e.g., Punjabi, Bengali, South Indian).

Available ingredients: {{#each ingredients}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Suggest a recipe based on these ingredients and preferences. Return the response in JSON format conforming to the output schema.`,
});

// Define the Genkit flow
const suggestRecipeFromIngredientsFlow = ai.defineFlow<
  typeof SuggestRecipeFromIngredientsInputSchema,
  typeof SuggestRecipeFromIngredientsOutputSchema
>(
  {
    name: 'suggestRecipeFromIngredientsFlow',
    inputSchema: SuggestRecipeFromIngredientsInputSchema,
    outputSchema: SuggestRecipeFromIngredientsOutputSchema,
  },
  async (input) => {
    // Call the AI prompt with the provided ingredients and preferences
    const { output } = await prompt(input); // Pass the whole input object

    // Handle potential null output from the AI model.
    if (!output) {
        throw new Error("AI failed to generate a recipe suggestion.");
    }

    // Return the structured output from the AI.
    return output;
  }
);
