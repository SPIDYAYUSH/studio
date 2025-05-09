// src/hooks/use-saved-recipes.ts
"use client";

import type { SuggestRecipeFromIngredientsOutput } from '@/ai/flows/suggest-recipe-from-ingredients';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

const LOCAL_STORAGE_KEY = 'savedIndianRecipes';

export type SavedRecipe = SuggestRecipeFromIngredientsOutput & { id: string };

export function useSavedRecipes() {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedRecipes = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedRecipes) {
        setSavedRecipes(JSON.parse(storedRecipes) as SavedRecipe[]);
      }
    } catch (error) {
      console.error("Failed to load saved recipes from localStorage", error);
      toast({
        title: "Error",
        description: "Could not load saved recipes.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const updateLocalStorage = (recipes: SavedRecipe[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(recipes));
    } catch (error)
      {
      console.error("Failed to save recipes to localStorage", error);
      toast({
        title: "Error",
        description: "Could not save recipes. Your browser storage might be full.",
        variant: "destructive",
      });
    }
  };

  const addRecipe = useCallback(async (recipe: SuggestRecipeFromIngredientsOutput): Promise<SavedRecipe | null> => {
    const existingRecipe = savedRecipes.find(r => r.recipeName === recipe.recipeName);
    if (existingRecipe) {
      toast({
        title: "Already Saved",
        description: `"${recipe.recipeName}" is already in your saved list.`,
      });
      return existingRecipe;
    }
    
    const newRecipeWithId: SavedRecipe = { ...recipe, id: recipe.recipeName.replace(/\s+/g, '-') + '-' + Date.now().toString() };
    
    setSavedRecipes(prevRecipes => {
      const updatedRecipes = [...prevRecipes, newRecipeWithId];
      updateLocalStorage(updatedRecipes);
      return updatedRecipes;
    });

    toast({
      title: "Recipe Saved!",
      description: `"${newRecipeWithId.recipeName}" has been added to your list.`,
    });
    return newRecipeWithId;
  }, [savedRecipes, toast]);

  const removeRecipe = useCallback((recipeId: string) => {
    setSavedRecipes(prevRecipes => {
      const recipeToRemove = prevRecipes.find(r => r.id === recipeId);
      const updatedRecipes = prevRecipes.filter(r => r.id !== recipeId);
      updateLocalStorage(updatedRecipes);
      if (recipeToRemove) {
        toast({
          title: "Recipe Removed",
          description: `"${recipeToRemove.recipeName}" has been removed from your list.`,
        });
      }
      return updatedRecipes;
    });
  }, [toast]);

  const isRecipeSaved = useCallback((recipeName: string): boolean => {
    return savedRecipes.some(r => r.recipeName === recipeName);
  }, [savedRecipes]);

  return { savedRecipes, addRecipe, removeRecipe, isRecipeSaved };
}

