
"use client"; // Mark as client component due to useState and event handlers

import * as React from 'react'; // Import React
import { RecipeSuggester } from '@/components/recipe-suggester';
import { SavedRecipesList } from '@/components/saved-recipes-list';
import type { SavedRecipe } from '@/hooks/use-saved-recipes';
import { Button } from '@/components/ui/button';
import { ListCollapse, ListOrdered } from 'lucide-react';
import Image from 'next/image';
import type { SuggestRecipeFromIngredientsOutput } from '@/ai/flows/suggest-recipe-from-ingredients';


export default function Home() {
  const [showSavedRecipes, setShowSavedRecipes] = React.useState(false);
  // Add state to temporarily show a recipe from the saved list in the main display
  const [recipeToView, setRecipeToView] = React.useState<SuggestRecipeFromIngredientsOutput | null>(null);


  const handleViewRecipe = (recipe: SavedRecipe) => {
    // When a saved recipe is clicked to "View", set it to be displayed by RecipeSuggester/RecipeDisplay
    // This assumes RecipeSuggester can accept an initial recipe or has a way to display a passed recipe.
    // For now, we'll pass it down and RecipeSuggester can decide how to show it.
    // Or, we could have RecipeDisplay directly here.
    setRecipeToView(recipe);
    setShowSavedRecipes(false); // Optionally hide the list when viewing one
     // Scroll to the top to see the recipe display
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Callback for RecipeSuggester to clear the viewed recipe
  const onRecipeSuggestionClosed = () => {
    setRecipeToView(null);
  };


  return (
    <main
      className="min-h-screen py-12 bg-gradient-to-tr from-teal-50 via-emerald-50 to-green-50 relative overflow-hidden"
    >
      <div className="fixed inset-0 -z-10">
        <Image
            src="https://picsum.photos/1920/1080"
            alt="Abstract culinary background"
            layout="fill"
            objectFit="cover"
            quality={80}
            className="opacity-20 blur-sm"
            data-ai-hint="culinary abstract pattern"
        />
      </div>

      <div className="container mx-auto flex flex-col items-center px-4 md:px-8 lg:px-12 relative z-10">
        <div className="w-full max-w-3xl">
          <header className="mb-12 text-center flex flex-col items-center">
             <Image
                src="https://picsum.photos/150/150"
                alt="Maa Ka Khana Logo"
                width={120}
                height={120}
                className="mb-6 rounded-full shadow-xl border-4 border-white"
                data-ai-hint="indian food cooking mother"
              />
            <h1 className="text-5xl font-extrabold tracking-tight text-primary sm:text-6xl lg:text-7xl drop-shadow-md">
              Maa Ka Khana
            </h1>
            <p className="mt-4 text-xl text-foreground/80 sm:text-2xl max-w-xl mx-auto">
              Tell Maa what's in your fridge, add your preferences, and get a delicious Indian recipe instantly!
            </p>
          </header>

          {/* Pass recipeToView and onRecipeSuggestionClosed to RecipeSuggester */}
          <RecipeSuggester initialRecipe={recipeToView} onClearInitialRecipe={onRecipeSuggestionClosed} />

          <div className="mt-12 text-center">
            <Button
              onClick={() => {
                setShowSavedRecipes(!showSavedRecipes);
                if(showSavedRecipes) { // If we are closing the list, also clear any recipe being viewed from the list
                   setRecipeToView(null);
                }
              }}
              variant="outline"
              size="lg"
              className="bg-secondary/80 hover:bg-secondary text-secondary-foreground font-semibold shadow-md"
            >
              {showSavedRecipes ? <ListCollapse className="mr-2 h-5 w-5" /> : <ListOrdered className="mr-2 h-5 w-5" />}
              {showSavedRecipes ? 'Hide Saved Recipes' : 'Show Saved Recipes'}
            </Button>
          </div>

          {/* Conditional rendering for SavedRecipesList */}
          {/* Wrapped in a div for transition control if needed */}
          <div className={`transition-all duration-500 ease-in-out ${showSavedRecipes ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            {showSavedRecipes && <SavedRecipesList onViewRecipe={handleViewRecipe} />}
          </div>
        </div>
      </div>
    </main>
  );
}
