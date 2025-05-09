
// src/components/saved-recipes-list.tsx
"use client";

import * as React from 'react';
import { useSavedRecipes, type SavedRecipe } from '@/hooks/use-saved-recipes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Eye, UtensilsCrossed, Flame, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from './ui/separator';

interface SavedRecipesListProps {
  onViewRecipe: (recipe: SavedRecipe) => void;
}

const getSpiceLevelInfo = (level?: string) => {
  switch (level?.toLowerCase()) {
    case 'mild': return { icon: <Flame className="h-3 w-3 text-green-700" />, label: 'Mild', color: 'bg-green-100 text-green-800 border-green-300' };
    case 'medium': return { icon: <Flame className="h-3 w-3 text-orange-600" />, label: 'Medium', color: 'bg-orange-100 text-orange-800 border-orange-300' };
    case 'spicy': case 'hot': return { icon: <Flame className="h-3 w-3 text-red-600" />, label: 'Spicy', color: 'bg-red-100 text-red-800 border-red-300' };
    case 'very spicy': return { icon: <Flame className="h-3 w-3 text-destructive" />, label: 'Very Spicy', color: 'bg-red-200 text-destructive border-red-400' };
    default: return null;
  }
};


export function SavedRecipesList({ onViewRecipe }: SavedRecipesListProps) {
  const { savedRecipes, removeRecipe } = useSavedRecipes();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Render nothing or a loading skeleton on the server to avoid hydration mismatch
    return null; 
  }

  if (savedRecipes.length === 0) {
    return (
      <Card className="mt-8 shadow-md border border-border/60">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">My Saved Recipes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You haven't saved any recipes yet. Go ahead and find some delicious ones!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-12 shadow-lg border-2 border-primary/30 bg-card">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-primary">My Saved Recipes</CardTitle>
        <CardDescription className="text-md">Here are the recipes you've saved for later.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4"> {/* Added max height and scroll */}
          <div className="space-y-6">
            {savedRecipes.map((recipe) => {
              const spiceInfo = getSpiceLevelInfo(recipe.spiceLevel);
              return (
                <Card key={recipe.id} className="bg-background/50 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-semibold text-primary/90">{recipe.recipeName}</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewRecipe(recipe)}
                          aria-label={`View ${recipe.recipeName}`}
                          className="text-xs"
                        >
                          <Eye className="mr-1.5 h-4 w-4" /> View
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRecipe(recipe.id)}
                          aria-label={`Remove ${recipe.recipeName}`}
                          className="text-destructive hover:text-destructive/80 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                     <div className="mt-2 flex flex-wrap items-center gap-2">
                        {spiceInfo && (
                          <Badge variant="outline" className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${spiceInfo.color}`}>
                            {spiceInfo.icon}
                            {spiceInfo.label}
                          </Badge>
                        )}
                        {recipe.regionalFlavor && (
                          <Badge variant="secondary" className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-secondary/70 hover:bg-secondary">
                            <MapPin className="h-3 w-3" />
                            {recipe.regionalFlavor}
                          </Badge>
                        )}
                        {recipe.calorieCount && (
                          <Badge variant="outline" className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border-muted-foreground/50 text-muted-foreground">
                              <UtensilsCrossed className="h-3 w-3" />
                              {recipe.calorieCount} kcal
                          </Badge>
                        )}
                      </div>
                  </CardHeader>
                  {/* Optionally display a snippet of ingredients or instructions here */}
                   <Separator className="mx-4 my-1 bg-border/50" />
                   <CardContent className="pt-3 pb-4 text-sm">
                        <p className="text-muted-foreground line-clamp-2">
                            <span className="font-medium text-foreground/80">Ingredients: </span>
                            {recipe.ingredients.slice(0, 5).join(', ')}{recipe.ingredients.length > 5 ? '...' : ''}
                        </p>
                   </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
