"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

const PLAYLIST_STORAGE_KEY = 'recipePlaylists';

export interface RecipePlaylist {
  id: string;
  name: string;
  recipeIds: string[]; // Stores IDs of SavedRecipe
}

export function useRecipePlaylists() {
  const [playlists, setPlaylists] = useState<RecipePlaylist[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Ensure localStorage is accessed only on the client side
    if (typeof window !== 'undefined') {
      try {
        const storedPlaylists = localStorage.getItem(PLAYLIST_STORAGE_KEY);
        if (storedPlaylists) {
          setPlaylists(JSON.parse(storedPlaylists));
        }
      } catch (error) {
        console.error("Failed to load playlists from localStorage", error);
        toast({
          title: "Error",
          description: "Could not load your recipe playlists.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const updateLocalStorage = (updatedPlaylists: RecipePlaylist[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(updatedPlaylists));
      } catch (error) {
        console.error("Failed to save playlists to localStorage", error);
        toast({
          title: "Error",
          description: "Could not save playlists. Your browser storage might be full.",
          variant: "destructive",
        });
      }
    }
  };

  const createPlaylist = useCallback((name: string) => {
    if (!name.trim()) {
      toast({ title: "Error", description: "Playlist name cannot be empty.", variant: "destructive" });
      return;
    }
    setPlaylists(prevPlaylists => {
      if (prevPlaylists.some(p => p.name.toLowerCase() === name.toLowerCase().trim())) {
        toast({ title: "Playlist Exists", description: `A playlist named "${name}" already exists.`, variant: "default" });
        return prevPlaylists;
      }
      const newPlaylist: RecipePlaylist = {
        id: name.trim().replace(/\s+/g, '-') + '-' + Date.now().toString(), // Simple ID generation
        name: name.trim(),
        recipeIds: [],
      };
      const updatedPlaylists = [...prevPlaylists, newPlaylist];
      updateLocalStorage(updatedPlaylists);
      toast({ title: "Playlist Created!", description: `Playlist "${newPlaylist.name}" has been created.` });
      return updatedPlaylists;
    });
  }, [toast]);

  const deletePlaylist = useCallback((playlistId: string) => {
    setPlaylists(prevPlaylists => {
      const playlistToDelete = prevPlaylists.find(p => p.id === playlistId);
      const updatedPlaylists = prevPlaylists.filter(p => p.id !== playlistId);
      updateLocalStorage(updatedPlaylists);
      if (playlistToDelete) {
        toast({ title: "Playlist Deleted", description: `"${playlistToDelete.name}" has been deleted.` });
      }
      return updatedPlaylists;
    });
  }, [toast]);

  const addRecipeToPlaylist = useCallback((playlistId: string, recipeId: string, recipeName: string) => {
    setPlaylists(prevPlaylists => {
      const playlistIndex = prevPlaylists.findIndex(p => p.id === playlistId);
      if (playlistIndex === -1) {
        toast({ title: "Error", description: "Playlist not found.", variant: "destructive" });
        return prevPlaylists;
      }
      const playlist = prevPlaylists[playlistIndex];
      if (playlist.recipeIds.includes(recipeId)) {
        toast({ title: "Already Added", description: `"${recipeName}" is already in "${playlist.name}".`, variant: "default" });
        return prevPlaylists;
      }
      const updatedPlaylist = { ...playlist, recipeIds: [...playlist.recipeIds, recipeId] };
      const updatedPlaylists = [...prevPlaylists];
      updatedPlaylists[playlistIndex] = updatedPlaylist;
      updateLocalStorage(updatedPlaylists);
      toast({ title: "Recipe Added", description: `"${recipeName}" added to playlist "${playlist.name}".` });
      return updatedPlaylists;
    });
  }, [toast]);
  
  const removeRecipeFromPlaylist = useCallback((playlistId: string, recipeId: string, recipeName: string) => {
    setPlaylists(prevPlaylists => {
      const playlistIndex = prevPlaylists.findIndex(p => p.id === playlistId);
      if (playlistIndex === -1) {
        toast({ title: "Error", description: "Playlist not found.", variant: "destructive" });
        return prevPlaylists;
      }
      const playlist = prevPlaylists[playlistIndex];
      if (!playlist.recipeIds.includes(recipeId)) {
        // This case should ideally not be hit if UI is correct
        toast({ title: "Not Found", description: `"${recipeName}" is not in this playlist.`, variant: "default" });
        return prevPlaylists;
      }
      const updatedRecipeIds = playlist.recipeIds.filter(id => id !== recipeId);
      const updatedPlaylist = { ...playlist, recipeIds: updatedRecipeIds };
      const updatedPlaylists = [...prevPlaylists];
      updatedPlaylists[playlistIndex] = updatedPlaylist;
      updateLocalStorage(updatedPlaylists);
      toast({ title: "Recipe Removed", description: `"${recipeName}" removed from "${playlist.name}".` });
      return updatedPlaylists;
    });
  }, [toast]);

  const getPlaylistById = useCallback((playlistId: string): RecipePlaylist | undefined => {
    return playlists.find(p => p.id === playlistId);
  }, [playlists]);


  return { playlists, createPlaylist, deletePlaylist, addRecipeToPlaylist, removeRecipeFromPlaylist, getPlaylistById };
}
