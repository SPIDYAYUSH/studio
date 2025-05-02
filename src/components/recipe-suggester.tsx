"use client";

import * as React from 'react';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { suggestRecipeFromIngredients, type SuggestRecipeFromIngredientsOutput } from '@/ai/flows/suggest-recipe-from-ingredients';
import { RecipeDisplay } from './recipe-display'; // Import RecipeDisplay

const formSchema = z.object({
  ingredients: z.string().min(3, {
    message: 'Please list at least one ingredient.',
  }),
});

export function RecipeSuggester() {
  const [recipe, setRecipe] = useState<SuggestRecipeFromIngredientsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRecipe(null); // Clear previous recipe

    try {
      // Basic parsing: split by comma or newline, trim whitespace, filter empty strings
      const ingredientList = values.ingredients
        .split(/[\n,]+/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
      console.log(ingredientList); // DEBUG: Log parsed ingredients

      if (ingredientList.length === 0) {
        form.setError("ingredients", { type: "manual", message: "Please enter valid ingredients separated by commas or newlines." });
        setIsLoading(false);
        return;
      }

      const result = await suggestRecipeFromIngredients({ ingredients: ingredientList });
      console.log("Recipe result:", result); // DEBUG: Log the result from the AI flow
      setRecipe(result);
    } catch (error) {
      console.error('Error suggesting recipe:', error);
      toast({
        title: 'Uh oh! Something went wrong.',
        description: 'Maa is busy right now. Please try again later.',
        variant: 'destructive',
      });
      setRecipe(null); // Ensure recipe is cleared on error
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">What's in the Fridge?</CardTitle>
        <CardDescription>List your ingredients (e.g., onion, tomato, paneer) and Maa will suggest a recipe!</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="ingredients-textarea" className="sr-only">Ingredients</FormLabel>
                  <FormControl>
                    <Textarea
                      id="ingredients-textarea"
                      placeholder="e.g., chicken, ginger, garlic, yogurt..."
                      className="resize-none"
                      rows={4}
                      {...field}
                      aria-describedby="ingredients-message"
                    />
                  </FormControl>
                  <FormMessage id="ingredients-message" />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Asking Maa...
                </>
              ) : (
                'Get Recipe Suggestion'
              )}
            </Button>
          </form>
        </Form>

        {/* Conditionally render RecipeDisplay only when recipe state is not null */}
        {recipe && <RecipeDisplay recipe={recipe} />}
      </CardContent>
    </Card>
  );
}
