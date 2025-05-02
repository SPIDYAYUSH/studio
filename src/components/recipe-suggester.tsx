// src/components/recipe-suggester.tsx
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select components
import { useToast } from '@/hooks/use-toast';
import { suggestRecipeFromIngredients, type SuggestRecipeFromIngredientsOutput } from '@/ai/flows/suggest-recipe-from-ingredients';
import { RecipeDisplay } from './recipe-display';

// Update form schema to include optional spiceLevel and regionalFlavor
const formSchema = z.object({
  ingredients: z.string().min(3, {
    message: 'Please list at least one ingredient.',
  }),
  spiceLevel: z.string().optional(),
  regionalFlavor: z.string().optional(),
});

// Define options for the Select components
const spiceLevels = ["Any", "Mild", "Medium", "Spicy", "Very Spicy"];
const regionalFlavors = ["Any", "North Indian", "South Indian", "East Indian", "West Indian", "Gujarati", "Punjabi", "Bengali", "Maharashtrian"];


export function RecipeSuggester() {
  const [recipe, setRecipe] = useState<SuggestRecipeFromIngredientsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: '',
      spiceLevel: 'Any', // Default value
      regionalFlavor: 'Any', // Default value
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

      console.log(ingredientList); // Log ingredient list

      if (ingredientList.length === 0) {
        form.setError("ingredients", { type: "manual", message: "Please enter valid ingredients separated by commas or newlines." });
        setIsLoading(false);
        return;
      }

      // Prepare input for the AI flow, including preferences
      const input = {
        ingredients: ingredientList,
        // Only include preference if it's not "Any"
        ...(values.spiceLevel && values.spiceLevel !== 'Any' && { spiceLevel: values.spiceLevel }),
        ...(values.regionalFlavor && values.regionalFlavor !== 'Any' && { regionalFlavor: values.regionalFlavor }),
      };

      console.log("Sending to AI:", input); // DEBUG: Log input sent to AI

      const result = await suggestRecipeFromIngredients(input);
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
        <CardDescription>List your ingredients and preferences, and Maa will suggest a recipe!</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Ingredients Textarea */}
            <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="ingredients-textarea">Ingredients</FormLabel>
                  <FormControl>
                    <Textarea
                      id="ingredients-textarea"
                      placeholder="e.g., onion, tomato, paneer, chicken, ginger, garlic, yogurt..."
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Spice Level Select */}
              <FormField
                control={form.control}
                name="spiceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spice Level Preference</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select spice level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {spiceLevels.map(level => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Regional Flavor Select */}
              <FormField
                control={form.control}
                name="regionalFlavor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Regional Flavor Preference</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select regional flavor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                         {regionalFlavors.map(flavor => (
                          <SelectItem key={flavor} value={flavor}>
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

            {/* Submit Button */}
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