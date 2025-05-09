// src/components/cooking-mode-modal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { SuggestRecipeFromIngredientsOutput } from '@/ai/flows/suggest-recipe-from-ingredients';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Timer, Play, Pause, RotateCcw, X, UtensilsCrossed } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface CookingModeModalProps {
  recipe: SuggestRecipeFromIngredientsOutput;
  isOpen: boolean;
  onClose: () => void;
}

export function CookingModeModal({ recipe, isOpen, onClose }: CookingModeModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timerInputMinutes, setTimerInputMinutes] = useState(5); // Default timer input
  const [timerRemainingSeconds, setTimerRemainingSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const instructions = recipe.instructions || [];
  const totalSteps = instructions.length;

  // Reset state when modal opens or recipe changes
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setIsTimerActive(false);
      setTimerRemainingSeconds(0);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }, [isOpen, recipe]);

  // Timer logic
  useEffect(() => {
    if (isTimerActive && timerRemainingSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerRemainingSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerRemainingSeconds === 0 && isTimerActive) {
      setIsTimerActive(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      toast({ title: "Timer Finished!", description: `Timer for step ${currentStepIndex + 1} is done.` });
      // Optionally play a sound here using browser Audio API if desired
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerActive, timerRemainingSeconds, toast, currentStepIndex]);

  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
      resetTimerForNewStep();
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      resetTimerForNewStep();
    }
  };

  const resetTimerForNewStep = () => {
    setIsTimerActive(false);
    setTimerRemainingSeconds(0);
    // setTimerInputMinutes(5); // Reset input to default if needed
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };
  
  const handleStartTimer = () => {
    if (timerInputMinutes <= 0) {
        toast({ title: "Invalid Timer", description: "Please set a timer duration greater than 0 minutes.", variant: "destructive"});
        return;
    }
    setTimerRemainingSeconds(timerInputMinutes * 60);
    setIsTimerActive(true);
  };

  const handlePauseTimer = () => {
    setIsTimerActive(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  const handleResetTimer = () => {
    resetTimerForNewStep();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (!isOpen || totalSteps === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent 
        className="max-w-2xl w-full p-0 sm:rounded-lg flex flex-col" 
        onPointerDownOutside={(e) => e.preventDefault()} 
        onInteractOutside={(e) => e.preventDefault()}
        style={{maxHeight: '90vh'}} // Ensure modal fits viewport
      >
        <DialogHeader className="p-6 pb-2 border-b border-border">
          <DialogTitle className="text-2xl font-bold text-primary flex justify-between items-center">
            <span>{recipe.recipeName}</span>
             <DialogClose asChild>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close cooking mode">
                  <X className="h-5 w-5" />
                </Button>
              </DialogClose>
          </DialogTitle>
          <DialogDescription>
            Step-by-Step Cooking Mode
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-6 overflow-y-auto flex-grow">
          <div className="text-center sticky top-0 bg-background py-2 z-10">
            <p className="text-sm text-muted-foreground">Step {currentStepIndex + 1} of {totalSteps}</p>
            <Progress value={((currentStepIndex + 1) / totalSteps) * 100} className="w-full h-2 mt-1" />
          </div>

          <div className="p-4 bg-muted/30 rounded-lg min-h-[100px] md:min-h-[150px] flex items-center justify-center shadow-inner">
            <p className="text-xl md:text-2xl font-medium text-center leading-relaxed text-foreground">
              {instructions[currentStepIndex]}
            </p>
          </div>

          <div className="p-4 border border-border rounded-lg bg-card/70 space-y-3 shadow">
            <h4 className="text-lg font-semibold flex items-center text-foreground/90">
              <Timer className="mr-2 h-5 w-5 text-secondary" /> Optional Timer
            </h4>
            {isTimerActive || timerRemainingSeconds > 0 ? (
              <div className='text-center space-y-2'>
                <p className="text-5xl font-bold text-primary tabular-nums">{formatTime(timerRemainingSeconds)}</p>
                <div className="flex justify-center gap-2">
                  {isTimerActive ? (
                    <Button onClick={handlePauseTimer} variant="outline" size="sm" className="shadow-sm">
                      <Pause className="mr-1.5 h-4 w-4" /> Pause
                    </Button>
                  ) : (
                    <Button onClick={() => setIsTimerActive(true)} variant="outline" size="sm" disabled={timerRemainingSeconds === 0} className="shadow-sm">
                      <Play className="mr-1.5 h-4 w-4" /> Resume
                    </Button>
                  )}
                  <Button onClick={handleResetTimer} variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                    <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-end gap-3">
                <div className="flex-grow w-full sm:w-auto">
                  <Label htmlFor="timer-minutes" className="text-sm font-medium text-foreground/80">Set duration (minutes):</Label>
                  <Input
                    id="timer-minutes"
                    type="number"
                    min="1"
                    value={timerInputMinutes}
                    onChange={(e) => setTimerInputMinutes(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="mt-1 w-full sm:w-36 bg-input/70 shadow-inner focus:bg-background"
                    disabled={isTimerActive}
                  />
                </div>
                <Button onClick={handleStartTimer} className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md">
                  <Play className="mr-2 h-4 w-4" /> Start Timer
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-2">
          <Button 
            onClick={handlePreviousStep} 
            disabled={currentStepIndex === 0}
            variant="outline"
            className="w-full sm:w-auto shadow-sm"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {currentStepIndex === totalSteps - 1 ? (
             <DialogClose asChild>
                <Button onClick={onClose} className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto shadow-md">
                  Finish Cooking! <UtensilsCrossed className="ml-2 h-4 w-4" />
                </Button>
             </DialogClose>
          ) : (
            <Button onClick={handleNextStep} className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto shadow-md">
              Next Step <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
