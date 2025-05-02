/**
 * Represents a recipe with details such as ingredients, instructions, calorie count,
 * spice level, and regional flavor.
 * This interface is primarily used for type consistency, but the actual data
 * generation is handled by the AI flows.
 */
export interface Recipe {
  /**
   * The name of the recipe.
   */
  name: string;
  /**
   * The ingredients required for the recipe.
   */
  ingredients: string[];
  /**
   * The instructions to prepare the recipe.
   */
  instructions: string[];
  /**
   * The calorie count of the recipe.
   */
  calorieCount?: number;
  /**
   * The spice level of the recipe (e.g., Mild, Medium, Spicy).
   */
  spiceLevel?: string;
  /**
   * The regional flavor of the recipe (e.g., North Indian, South Indian).
   */
  regionalFlavor?: string;
}

// The getRecipe function is removed as the AI flow `suggestRecipeFromIngredientsFlow`
// now handles the recipe suggestion logic based on the prompt.
// The AI flow directly outputs the recipe details according to its schema.
