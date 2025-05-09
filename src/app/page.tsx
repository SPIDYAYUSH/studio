"use client";

import * as React from 'react';
import { RecipeSuggester } from '@/components/recipe-suggester';
import { SavedRecipesList } from '@/components/saved-recipes-list';
import type { SavedRecipe } from '@/hooks/use-saved-recipes';
import { Button } from '@/components/ui/button';
import { ListCollapse, ListOrdered, Plus, ListMusic } from 'lucide-react';
import Image from 'next/image';
import type { SuggestRecipeFromIngredientsOutput } from '@/ai/flows/suggest-recipe-from-ingredients';
import { useRecipePlaylists } from '@/hooks/use-recipe-playlists';
import { RecipePlaylistsList } from '@/components/recipe-playlists-list';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';


export default function Home() {
  const [showSavedRecipes, setShowSavedRecipes] = React.useState(false);
  const [recipeToView, setRecipeToView] = React.useState<SuggestRecipeFromIngredientsOutput | null>(null);

  const { createPlaylist } = useRecipePlaylists();
  const [newPlaylistName, setNewPlaylistName] = React.useState('');
  const [showPlaylistSection, setShowPlaylistSection] = React.useState(false);


  const handleViewRecipe = (recipe: SavedRecipe) => {
    setRecipeToView(recipe);
    setShowSavedRecipes(false); // Hide saved list if viewing one from there
    setShowPlaylistSection(false); // Also hide playlist section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onRecipeSuggestionClosed = () => {
    setRecipeToView(null);
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName(''); 
    }
  };

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: "url('https://th.bing.com/th/id/OIP.qqQCzCVLbgiSZeOyaM4oJAHaFd?rs=1&pid=ImgDetMain')" }} 
      data-ai-hint="indian spices"
    >
      <div className="absolute inset-0 bg-background/75"></div>

      <div className="container mx-auto flex flex-col items-center px-4 py-12 relative z-10 md:px-6 lg:px-8">
        <div className="w-full max-w-3xl bg-card/80 p-6 md:p-8 rounded-xl shadow-2xl backdrop-blur-sm animate-fade-in">
          <header className="mb-10 text-center flex flex-col items-center">
            <Image
              src="https://img.freepik.com/premium-vector/free-vector-mother-cooking-kitchen_727932-18.jpg?w=2000"
              alt="Maa Ka Khana - A loving mother's touch in cooking"
              width={120}
              height={120}
              className="mb-6 rounded-full shadow-2xl border-4 border-primary/60 object-cover"
              data-ai-hint="mother cooking"
            />
            <h1 className="text-5xl font-extrabold tracking-tight text-primary sm:text-6xl lg:text-7xl drop-shadow-md">
              Maa Ka Khana
            </h1>
            <p className="mt-4 text-xl text-foreground/90 sm:text-2xl max-w-xl mx-auto drop-shadow-sm">
              Tell Maa what's in your fridge, add your preferences, and get a delicious Indian recipe instantly!
            </p>
          </header>

          <RecipeSuggester initialRecipe={recipeToView} onClearInitialRecipe={onRecipeSuggestionClosed} />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
            <Button
              onClick={() => {
                setShowSavedRecipes(!showSavedRecipes);
                if (showSavedRecipes) setRecipeToView(null); // Clear viewed recipe if hiding list
                setShowPlaylistSection(false); // Hide other section
              }}
              variant="outline"
              size="lg"
              className="w-full bg-secondary/90 hover:bg-secondary text-secondary-foreground font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {showSavedRecipes ? <ListCollapse className="mr-2 h-5 w-5" /> : <ListOrdered className="mr-2 h-5 w-5" />}
              {showSavedRecipes ? 'Hide Saved Recipes' : 'Show Saved Recipes'}
            </Button>
            <Button
              onClick={() => {
                setShowPlaylistSection(!showPlaylistSection);
                setShowSavedRecipes(false); // Hide other section
                 if (showPlaylistSection) setRecipeToView(null);
              }}
              variant="outline"
              size="lg"
              className="w-full bg-accent/90 hover:bg-accent text-accent-foreground font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <ListMusic className="mr-2 h-5 w-5" />
              {showPlaylistSection ? 'Hide Recipe Playlists' : 'Manage Playlists'}
            </Button>
          </div>
          
          <div className={`transition-all duration-500 ease-in-out ${showSavedRecipes ? 'max-h-screen opacity-100 mt-8' : 'max-h-0 opacity-0 overflow-hidden mt-0'}`}>
            {showSavedRecipes && <SavedRecipesList onViewRecipe={handleViewRecipe} />}
          </div>

          <div className={`transition-all duration-500 ease-in-out ${showPlaylistSection ? 'max-h-none opacity-100 mt-8' : 'max-h-0 opacity-0 overflow-hidden mt-0'}`}>
            {showPlaylistSection && (
              <Card className="mt-8 shadow-md border border-border/60">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold text-accent flex items-center">
                    <Plus className="mr-2 h-6 w-6" /> Create New Playlist
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreatePlaylist} className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="text"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      placeholder="Enter playlist name (e.g., Quick Dinners)"
                      className="flex-grow text-base shadow-inner bg-input/50 focus:bg-background"
                      aria-label="New playlist name"
                    />
                    <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold w-full sm:w-auto">
                      <Plus className="mr-2 h-4 w-4" /> Create Playlist
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
            {showPlaylistSection && <RecipePlaylistsList />}
          </div>
        </div>
      </div>
    </main>
  );
}
