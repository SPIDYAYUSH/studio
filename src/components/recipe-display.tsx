"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Soup, MapPin, UtensilsCross } from 'lucide-react'; // Icons for spice, cuisine type, region
import type { SuggestRecipeFromIngredientsOutput } from '@/ai/flows/suggest-recipe-from-ingredients';

interface RecipeDisplayProps {
  recipe: SuggestRecipeFromIngredientsOutput;
}

// Helper to get spice level icon and color
const getSpiceLevel = (level?: string) => {
  switch (level?.toLowerCase()) {
    case 'mild':
      return { icon: <Flame className="h-4 w-4 text-green-600" />, label: 'Mild', color: 'bg-green-100 text-green-800' };
    case 'medium':
      return { icon: <Flame className="h-4 w-4 text-orange-500" />, label: 'Medium', color: 'bg-orange-100 text-orange-800' };
    case 'spicy':
    case 'hot':
      return { icon: <Flame className="h-4 w-4 text-red-600" />, label: 'Spicy', color: 'bg-red-100 text-red-800' };
    default:
      return null;
  }
};

export function RecipeDisplay({ recipe }: RecipeDisplayProps) {
  const spiceInfo = getSpiceLevel(recipe.spiceLevel);

  return (
    <Card className="mt-8 border-primary shadow-md">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-primary">{recipe.recipeName}</CardTitle>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {spiceInfo && (
            <Badge variant="outline" className={`flex items-center gap-1 px-3 py-1 ${spiceInfo.color} border-none`}>
              {spiceInfo.icon}
              {spiceInfo.label} Spice
            </Badge>
          )}
          {recipe.regionalFlavor && (
            <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
              <MapPin className="h-4 w-4" />
              {recipe.regionalFlavor}
            </Badge>
          )}
           {recipe.calorieCount && (
            <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                <UtensilsCross className="h-4 w-4" />
                {recipe.calorieCount} kcal (approx.)
            </Badge>
            )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="mb-2 text-xl font-semibold">Ingredients Needed:</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-xl font-semibold">Instructions from Maa:</h3>
          <ol className="list-decimal space-y-2 pl-5">
            {recipe.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>
      </CardContent>
      {/* Optional Footer can be added later if needed
       <CardFooter>
         <p className="text-sm text-muted-foreground">Enjoy your meal!</p>
       </CardFooter>
      */}
    </Card>
  );
}
