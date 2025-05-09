
"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button'; // Import Button
import { Flame, Soup, MapPin, UtensilsCrossed, ListChecks, CookingPot, Bookmark, BookmarkCheck } from 'lucide-react';
import type { SuggestRecipeFromIngredientsOutput } from '@/ai/flows/suggest-recipe-from-ingredients';
import { useSavedRecipes, type SavedRecipe } from '@/hooks/use-saved-recipes'; // Import hook

interface RecipeDisplayProps {
  recipe: SuggestRecipeFromIngredientsOutput;
}

const getSpiceLevel = (level?: string) => {
  switch (level?.toLowerCase()) {
    case 'mild':
      return { icon: <Flame className="h-4 w-4 text-green-700" />, label: 'Mild', color: 'bg-green-100 text-green-800 border-green-300' };
    case 'medium':
      return { icon: <Flame className="h-4 w-4 text-orange-600" />, label: 'Medium', color: 'bg-orange-100 text-orange-800 border-orange-300' };
    case 'spicy':
    case 'hot':
       return { icon: <Flame className="h-4 w-4 text-red-600" />, label: 'Spicy', color: 'bg-red-100 text-red-800 border-red-300' };
    case 'very spicy':
         return { icon: <Flame className="h-4 w-4 text-destructive" />, label: 'Very Spicy', color: 'bg-red-200 text-destructive border-red-400' };
    default:
      return null;
  }
};

export function RecipeDisplay({ recipe }: RecipeDisplayProps) {
  const { addRecipe, removeRecipe, isRecipeSaved, savedRecipes } = useSavedRecipes();
  const spiceInfo = getSpiceLevel(recipe.spiceLevel);
  
  // Find the full saved recipe object if it exists to get its ID for removal
  const currentSavedRecipe = savedRecipes.find(r => r.recipeName === recipe.recipeName);
  const isCurrentlySaved = !!currentSavedRecipe;

  const handleSaveToggle = () => {
    if (isCurrentlySaved && currentSavedRecipe) {
      removeRecipe(currentSavedRecipe.id);
    } else {
      addRecipe(recipe);
    }
  };

  return (
    <Card className="mt-10 border-primary/50 shadow-lg bg-card animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-3xl font-bold text-primary flex-grow">{recipe.recipeName}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSaveToggle}
            aria-label={isCurrentlySaved ? "Unsave recipe" : "Save recipe"}
            className="ml-4 flex-shrink-0 text-accent hover:text-accent/80"
          >
            {isCurrentlySaved ? <BookmarkCheck className="h-6 w-6 text-primary" /> : <Bookmark className="h-6 w-6" />}
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {spiceInfo && (
            <Badge variant="outline" className={`flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full border ${spiceInfo.color}`}>
              {spiceInfo.icon}
              {spiceInfo.label}
            </Badge>
          )}
          {recipe.regionalFlavor && (
            <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-secondary/70 hover:bg-secondary">
              <MapPin className="h-4 w-4" />
              {recipe.regionalFlavor}
            </Badge>
          )}
           {recipe.calorieCount && (
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full border-muted-foreground/50 text-muted-foreground">
                <UtensilsCrossed className="h-4 w-4" />
                {recipe.calorieCount} kcal
                 <span className="ml-1 text-xs opacity-80">(approx.)</span>
            </Badge>
            )}
        </div>
      </CardHeader>
      <Separator className="mx-6 my-2 bg-border/70" />
      <CardContent className="space-y-6 pt-6">
        <div>
          <h3 className="mb-3 text-xl font-semibold flex items-center gap-2 text-foreground/90">
             <ListChecks className="h-5 w-5 text-secondary-foreground" />
             Ingredients Needed:
          </h3>
          <ul className="list-disc space-y-1.5 pl-8 text-muted-foreground text-base">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
        <Separator className="my-4 bg-border/50" />
        <div>
          <h3 className="mb-3 text-xl font-semibold flex items-center gap-2 text-foreground/90">
            <CookingPot className="h-5 w-5 text-secondary-foreground" />
            Instructions from Maa:
            </h3>
          <ol className="list-decimal space-y-3 pl-8 text-base leading-relaxed">
            {recipe.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>
      </CardContent>
       <CardFooter className="pt-4">
         <p className="text-sm text-muted-foreground/80 italic">Enjoy your delicious home-cooked meal!</p>
       </CardFooter>
    </Card>
  );
}
