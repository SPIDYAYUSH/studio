
// src/components/recipe-suggester.tsx
"use client";

import * as React from 'react';
import { useState, useEffect } from 'react'; // Added useEffect
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, ChefHat, XCircle } from 'lucide-react'; // Added XCircle

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { suggestRecipeFromIngredients, type SuggestRecipeFromIngredientsOutput } from '@/ai/flows/suggest-recipe-from-ingredients';
import { RecipeDisplay } from './recipe-display';

const formSchema = z.object({
  ingredients: z.string().min(3, {
    message: 'Please list at least one ingredient.',
  }),
  spiceLevel: z.string().optional(),
  regionalFlavor: z.string().optional(),
});

const spiceLevels = ["Any", "Mild", "Medium", "Spicy", "Very Spicy"];
const regionalFlavors = ["Any", "North Indian", "South Indian", "East Indian", "West Indian", "Gujarati", "Punjabi", "Bengali", "Maharashtrian"];

interface RecipeSuggesterProps {
  initialRecipe?: SuggestRecipeFromIngredientsOutput | null; // To display a recipe passed from parent
  onClearInitialRecipe?: () => void; // Callback to clear the initial recipe
}

export function RecipeSuggester({ initialRecipe, onClearInitialRecipe }: RecipeSuggesterProps) {
  const [recipe, setRecipe] = useState<SuggestRecipeFromIngredientsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: '',
      spiceLevel: 'Any',
      regionalFlavor: 'Any',
    },
  });

  // Effect to display initialRecipe if provided
  useEffect(() => {
    if (initialRecipe) {
      setRecipe(initialRecipe);
      // Optionally reset form or clear ingredients if a recipe is being viewed
      form.reset({ ingredients: '', spiceLevel: 'Any', regionalFlavor: 'Any' });
    }
  }, [initialRecipe, form]);


  const handleClearDisplayedRecipe = () => {
    setRecipe(null);
    if (onClearInitialRecipe) {
      onClearInitialRecipe();
    }
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRecipe(null); // Clear previous recipe, including any initialRecipe
    if (onClearInitialRecipe) { // Also notify parent if it was an initial recipe
      onClearInitialRecipe();
    }


    try {
      const ingredientList = values.ingredients
        .split(/[\n,]+/)
        .map(item => item.trim())
        .filter(item => item.length > 0);

      console.log("Parsed Ingredients:", ingredientList);

      if (ingredientList.length === 0) {
        form.setError("ingredients", { type: "manual", message: "Please enter valid ingredients separated by commas or newlines." });
        setIsLoading(false);
        return;
      }

      const input = {
        ingredients: ingredientList,
        ...(values.spiceLevel && values.spiceLevel !== 'Any' && { spiceLevel: values.spiceLevel }),
        ...(values.regionalFlavor && values.regionalFlavor !== 'Any' && { regionalFlavor: values.regionalFlavor }),
      };

      console.log("Sending to AI:", input);

      const result = await suggestRecipeFromIngredients(input);
      console.log("Recipe result:", result);

      await new Promise(resolve => setTimeout(resolve, 300));

      setRecipe(result);
    } catch (error) {
      console.error('Error suggesting recipe:', error);
      toast({
        title: 'Uh oh! Something went wrong.',
        description: 'Maa is busy right now. Please try again later.',
        variant: 'destructive',
      });
      setRecipe(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full shadow-xl border border-border/60 transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-3xl font-bold text-primary flex items-center gap-2">
          <ChefHat className="w-8 h-8" />
           What's in the Fridge?
        </CardTitle>
        <CardDescription className="text-md pt-1">List your ingredients and preferences, and Maa will suggest a recipe!</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Only show form if no initialRecipe is being viewed from saved list, or allow overriding */}
        {/* For simplicity, always show form. User can ignore if viewing. */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="ingredients-textarea" className="text-lg font-semibold">Ingredients</FormLabel>
                  <FormControl>
                    <Textarea
                      id="ingredients-textarea"
                      placeholder="e.g., onion, tomato, paneer, chicken, ginger, garlic, yogurt..."
                      className="resize-none text-base shadow-inner bg-input/50 focus:bg-background"
                      rows={5}
                      {...field}
                      aria-describedby="ingredients-message"
                    />
                  </FormControl>
                  <FormMessage id="ingredients-message" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="spiceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">Spice Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-base shadow-sm">
                          <SelectValue placeholder="Select spice level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {spiceLevels.map(level => (
                          <SelectItem key={level} value={level} className="text-base">
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="regionalFlavor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">Regional Flavor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-base shadow-sm">
                          <SelectValue placeholder="Select regional flavor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                         {regionalFlavors.map(flavor => (
                          <SelectItem key={flavor} value={flavor} className="text-base">
                            {flavor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="w-full text-lg font-semibold bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-200 transform hover:scale-105 focus:scale-105 active:scale-100 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Asking Maa...
                </>
              ) : (
                'Get Recipe Suggestion'
              )}
            </Button>
          </form>
        </Form>

        <div className={`transition-opacity duration-500 ease-in-out mt-6 ${recipe ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
           {recipe && (
            <div>
              {initialRecipe && recipe.recipeName === initialRecipe.recipeName && (
                 <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearDisplayedRecipe}
                    className="mb-4 flex items-center"
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Close Viewed Recipe
                  </Button>
              )}
              <RecipeDisplay recipe={recipe} />
            </div>
           )}
        </div>

      </CardContent>
    </Card>
  );
}
