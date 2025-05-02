// src/ai/flows/suggest-recipe-from-ingredients.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting Indian recipes based on available ingredients.
 *
 * - suggestRecipeFromIngredients - A function that suggests a recipe based on the provided ingredients.
 * - SuggestRecipeFromIngredientsInput - The input type for the suggestRecipeFromIngredients function.
 * - SuggestRecipeFromIngredientsOutput - The return type for the suggestRecipeFromIngredients function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestRecipeFromIngredientsInputSchema = z.object({
  ingredients: z
    .array(z.string())
    .describe('An array of ingredients available in the fridge.'),
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

// Define the prompt for the AI model
const prompt = ai.definePrompt({
  name: 'suggestRecipeFromIngredientsPrompt',
  input: {
    schema: z.object({
      ingredients: z
        .array(z.string())
        .describe('An array of ingredients available in the fridge.'),
    }),
  },
  output: {
    // Ensure the prompt's output schema matches the flow's output schema
    schema: SuggestRecipeFromIngredientsOutputSchema,
  },
  // The prompt instructs the AI on its persona and task
  prompt: `You are a helpful and warm Indian mom. A user will provide you with ingredients they have available. Respond with a delicious Indian recipe they can make using primarily those ingredients (you can suggest adding common pantry staples if necessary).

Provide the following details for the recipe:
- recipeName: The name of the dish.
- ingredients: A list of ingredients needed for the recipe.
- instructions: Clear, step-by-step cooking instructions.
- calorieCount: An estimated calorie count per serving (optional, provide if you can reasonably estimate).
- spiceLevel: The typical spice level (Mild, Medium, Spicy).
- regionalFlavor: The regional origin or style of the dish (e.g., Punjabi, Bengali, South Indian).

Available ingredients: {{#each ingredients}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Suggest a recipe based on these ingredients. Return the response in JSON format conforming to the output schema.`,
});

// Define the Genkit flow
const suggestRecipeFromIngredientsFlow = ai.defineFlow<
  typeof SuggestRecipeFromIngredientsInputSchema,
  typeof SuggestRecipeFromIngredientsOutputSchema
>(
  {
    name: 'suggestRecipeFromIngredientsFlow',
    inputSchema: SuggestRecipeFromIngredientsInputSchema,
    outputSchema: SuggestRecipeFromIngredientsOutputSchema, // Ensure flow output schema matches
  },
  async (input) => {
    // Call the AI prompt with the provided ingredients
    const { output } = await prompt({
      ingredients: input.ingredients,
    });

    // The prompt is configured to return the structured output directly.
    // Handle potential null output from the AI model.
    if (!output) {
        throw new Error("AI failed to generate a recipe suggestion.");
    }

    // Return the structured output from the AI.
    return output;
  }
);
