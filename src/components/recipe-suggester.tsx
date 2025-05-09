// src/components/recipe-suggester.tsx
"use client";

import * as React from 'react';
import { useState, useEffect, useRef } from 'react'; // Added useRef
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, ChefHat, XCircle, Mic, MicOff } from 'lucide-react'; // Added Mic, MicOff

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
  initialRecipe?: SuggestRecipeFromIngredientsOutput | null;
  onClearInitialRecipe?: () => void;
}

export function RecipeSuggester({ initialRecipe, onClearInitialRecipe }: RecipeSuggesterProps) {
  const [recipe, setRecipe] = useState<SuggestRecipeFromIngredientsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: '',
      spiceLevel: 'Any',
      regionalFlavor: 'Any',
    },
  });

  useEffect(() => {
    if (initialRecipe) {
      setRecipe(initialRecipe);
      form.reset({ ingredients: '', spiceLevel: 'Any', regionalFlavor: 'Any' });
    }
  }, [initialRecipe, form]);

  // Initialize SpeechRecognition
  useEffect(() => {
    console.log('Speech recognition effect runs. isListening:', isListening);
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        if (!speechRecognitionRef.current) { // Initialize only if not already initialized
            speechRecognitionRef.current = new SpeechRecognitionAPI();
            console.log('SpeechRecognition API initialized.');
        }
        
        const recognition = speechRecognitionRef.current;
        recognition.continuous = true; // Keep listening even after a pause
        recognition.interimResults = false; // We only want final results
        recognition.lang = 'en-IN';

        recognition.onstart = () => {
          console.log('Speech recognition started.');
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          console.log('Speech recognition result:', event);
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              transcript += event.results[i][0].transcript + ' '; // Add space after each part
            }
          }

          if (transcript.trim()) {
            console.log('Final transcript:', transcript.trim());
            const currentIngredients = form.getValues('ingredients');
            const newIngredients = (currentIngredients ? currentIngredients.trim() + ', ' : '') + transcript.trim();
            form.setValue('ingredients', newIngredients.trim() + ' '); // Add trailing space for next input
            // toast({ title: "Heard:", description: transcript.trim() }); // Optional: for quick feedback
          } else {
            console.log('No final transcript in this result event or transcript is empty.');
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error, event.message);
          let errorMessage = `Could not recognize speech. Error: ${event.error}.`;
          if (event.message) {
            errorMessage += ` Message: ${event.message}`;
          }

          if (event.error === 'no-speech') {
            errorMessage = 'No speech was detected. Please try speaking louder or ensure your microphone is not muted.';
          } else if (event.error === 'audio-capture') {
            errorMessage = 'Audio capture failed. Please check your microphone connection and permissions.';
          } else if (event.error === 'not-allowed') {
            errorMessage = 'Microphone access was denied or not available. Please enable it in your browser settings.';
          } else if (event.error === 'network') {
            errorMessage = 'Network error during speech recognition. Please check your internet connection.';
          }


          toast({
            title: 'Voice Input Error',
            description: errorMessage,
            variant: 'destructive',
          });
          setIsListening(false); // Ensure UI reflects that it's not listening
        };

        recognition.onend = () => {
          console.log('Speech recognition ended.');
          // Only set isListening to false if it was not intentionally stopped
          // This check relies on isListening being up-to-date from the closure
          // If an error or natural end occurred, and we are not manually stopping, this ensures state is reset.
          // If handleToggleListening set isListening to false already, this is fine.
          setIsListening(false);
        };
      } else {
         console.warn('SpeechRecognition API constructor not found, though present in window.');
      }
    } else {
      console.warn('SpeechRecognition API not available in this browser.');
    }

    // Cleanup on component unmount or when isListening changes causing re-setup
    return () => {
      console.log('Speech recognition effect cleanup. isListening:', isListening);
      if (speechRecognitionRef.current) {
        console.log('Stopping speech recognition in cleanup.');
        speechRecognitionRef.current.stop(); // Stop any active recognition
        // It's good practice to nullify handlers to prevent potential memory leaks
        // or calls on unmounted components, though modern browsers might handle this well.
        speechRecognitionRef.current.onstart = null;
        speechRecognitionRef.current.onresult = null;
        speechRecognitionRef.current.onerror = null;
        speechRecognitionRef.current.onend = null;
        // speechRecognitionRef.current = null; // Avoid nullifying ref if re-used, unless re-creating instance
      }
    };
  }, [form, toast, isListening]); // Re-run effect if isListening changes to correctly manage start/stop and handler closures

  const handleToggleListening = async () => {
    if (!speechRecognitionRef.current) {
      toast({
        title: 'Voice Input Not Supported',
        description: 'Your browser does not support voice input, or it failed to initialize.',
        variant: 'destructive',
      });
      console.error('speechRecognitionRef.current is null in handleToggleListening');
      return;
    }

    if (isListening) {
      console.log('Manually stopping speech recognition.');
      speechRecognitionRef.current.stop();
      setIsListening(false); // This will trigger useEffect cleanup/re-setup
    } else {
      try {
        // Check for microphone permission
        if (navigator.permissions) {
            const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            if (permissionStatus.state === 'denied') {
                 toast({
                    title: 'Microphone Access Denied',
                    description: 'Please enable microphone access in your browser settings to use voice input.',
                    variant: 'destructive',
                });
                console.warn('Microphone permission denied.');
                return;
            }
             if (permissionStatus.state === 'prompt') {
                console.log('Microphone permission prompt will be shown.');
            }
        }
        console.log('Attempting to start speech recognition.');
        speechRecognitionRef.current.start();
        setIsListening(true); // This will trigger useEffect to potentially re-attach handlers with new 'isListening' closure
        toast({
          title: 'Listening...',
          description: 'Speak your ingredients now. Click the mic again to stop.',
        });
      } catch (error: any) {
        console.error('Error starting speech recognition:', error);
        toast({
          title: 'Could not start voice input',
          description: `Error: ${error.message || 'Unknown error'}. Please ensure microphone access is allowed.`,
          variant: 'destructive',
        });
        setIsListening(false);
      }
    }
  };


  const handleClearDisplayedRecipe = () => {
    setRecipe(null);
    if (onClearInitialRecipe) {
      onClearInitialRecipe();
    }
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setRecipe(null);
    if (onClearInitialRecipe) {
      onClearInitialRecipe();
    }

    // Ensure speech recognition is stopped before submitting
    if (isListening && speechRecognitionRef.current) {
        console.log('Stopping speech recognition before submitting form.');
        speechRecognitionRef.current.stop();
        setIsListening(false);
    }


    try {
      const ingredientList = values.ingredients
        .split(/[\n,]+/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
      
      console.log('Submitting ingredients:', ingredientList);


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

      const result = await suggestRecipeFromIngredients(input);
      console.log('Recipe suggestion result:', result);
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay for UX
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel htmlFor="ingredients-textarea" className="text-lg font-semibold">Ingredients</FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleToggleListening}
                      className={`p-2 rounded-full transition-colors ${isListening ? 'bg-destructive/20 text-destructive hover:bg-destructive/30 animate-pulse' : 'hover:bg-accent/20'}`}
                      aria-label={isListening ? "Stop listening" : "Start voice input"}
                    >
                      {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea
                      id="ingredients-textarea"
                      placeholder="e.g., onion, tomato, paneer, chicken, ginger, garlic, yogurt... or click the mic!"
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
              disabled={isLoading || isListening} 
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
