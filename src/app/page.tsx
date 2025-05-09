
"use client";

import * as React from 'react';
import { RecipeSuggester } from '@/components/recipe-suggester';
import { SavedRecipesList } from '@/components/saved-recipes-list';
import type { SavedRecipe } from '@/hooks/use-saved-recipes';
import { Button } from '@/components/ui/button';
import { ListCollapse, ListOrdered } from 'lucide-react';
import Image from 'next/image';
import type { SuggestRecipeFromIngredientsOutput } from '@/ai/flows/suggest-recipe-from-ingredients';

export default function Home() {
  const [showSavedRecipes, setShowSavedRecipes] = React.useState(false);
  const [recipeToView, setRecipeToView] = React.useState<SuggestRecipeFromIngredientsOutput | null>(null);

  const handleViewRecipe = (recipe: SavedRecipe) => {
    setRecipeToView(recipe);
    setShowSavedRecipes(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onRecipeSuggestionClosed = () => {
    setRecipeToView(null);
  };

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: "url('https://th.bing.com/th/id/OIP.qqQCzCVLbgiSZeOyaM4oJAHaFd?rs=1&pid=ImgDetMain')" }}
      data-ai-hint="indian spices"
    >
      <div className="absolute inset-0 bg-background/75 backdrop-blur-[2px]"></div>

      <div className="container mx-auto flex flex-col items-center px-4 md:px-8 lg:px-12 relative z-10 py-12">
        <div className="w-full max-w-3xl">
          <header className="mb-12 text-center flex flex-col items-center">
            <Image
              src="https://picsum.photos/120/120"
              alt="Maa Ka Khana - A loving mother's touch in cooking"
              width={120}
              height={120}
              className="mb-6 rounded-full shadow-2xl border-4 border-primary/60"
              data-ai-hint="cooking logo"
            />
            <h1 className="text-5xl font-extrabold tracking-tight text-primary sm:text-6xl lg:text-7xl drop-shadow-md">
              Maa Ka Khana
            </h1>
            <p className="mt-4 text-xl text-foreground/90 sm:text-2xl max-w-xl mx-auto drop-shadow-sm">
              Tell Maa what's in your fridge, add your preferences, and get a delicious Indian recipe instantly!
            </p>
          </header>

          <RecipeSuggester initialRecipe={recipeToView} onClearInitialRecipe={onRecipeSuggestionClosed} />

          <div className="mt-12 text-center">
            <Button
              onClick={() => {
                setShowSavedRecipes(!showSavedRecipes);
                if (showSavedRecipes) {
                  setRecipeToView(null);
                }
              }}
              variant="outline"
              size="lg"
              className="bg-secondary/90 hover:bg-secondary text-secondary-foreground font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {showSavedRecipes ? <ListCollapse className="mr-2 h-5 w-5" /> : <ListOrdered className="mr-2 h-5 w-5" />}
              {showSavedRecipes ? 'Hide Saved Recipes' : 'Show Saved Recipes'}
            </Button>
          </div>

          <div className={`transition-all duration-500 ease-in-out ${showSavedRecipes ? 'max-h-screen opacity-100 mt-8' : 'max-h-0 opacity-0 overflow-hidden mt-0'}`}>
            {showSavedRecipes && <SavedRecipesList onViewRecipe={handleViewRecipe} />}
          </div>
        </div>
      </div>
    </main>
  );
}

