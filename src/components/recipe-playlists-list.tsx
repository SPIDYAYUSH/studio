"use client";

import * as React from 'react';
import { useRecipePlaylists, type RecipePlaylist } from '@/hooks/use-recipe-playlists';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, ListMusic } from 'lucide-react'; // ListMusic as playlist icon
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from '@/components/ui/separator';

// Note: Viewing recipes within a playlist is deferred for a future step.
// This component will list playlists and allow deletion.

export function RecipePlaylistsList() {
  const { playlists, deletePlaylist } = useRecipePlaylists();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Render nothing or a loading skeleton on the server to avoid hydration mismatch
    return (
        <Card className="mt-8 shadow-md border border-border/60 animate-pulse">
            <CardHeader>
                <div className="h-8 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-10 bg-muted rounded w-full"></div>
            </CardContent>
        </Card>
    );
  }

  if (playlists.length === 0) {
    return (
      <Card className="mt-8 shadow-md border border-border/60">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary flex items-center">
            <ListMusic className="mr-2 h-6 w-6" /> My Recipe Playlists
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You haven't created any recipe playlists yet. Use the form above to create one!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 shadow-lg border-2 border-primary/30 bg-card">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-primary flex items-center">
           <ListMusic className="mr-3 h-7 w-7" /> My Recipe Playlists
        </CardTitle>
        <CardDescription className="text-md">Your curated collections of delicious recipes.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] pr-3 -mr-1"> {/* Adjusted height and padding */}
          <div className="space-y-3">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="flex items-center justify-between p-3 bg-background/40 rounded-lg shadow-sm border border-border/50">
                <div>
                    <p className="font-semibold text-lg text-foreground/90">{playlist.name}</p>
                    <p className="text-xs text-muted-foreground">{playlist.recipeIds.length} recipe(s)</p>
                </div>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete playlist ${playlist.name}`}
                        className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 h-9 w-9"
                        title={`Delete playlist ${playlist.name}`}
                        >
                        <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the playlist "{playlist.name}" and all its recipe associations (the recipes themselves will remain in your saved list).
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deletePlaylist(playlist.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                            Delete Playlist
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
