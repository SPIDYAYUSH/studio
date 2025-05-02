import { RecipeSuggester } from '@/components/recipe-suggester';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-tr from-background via-secondary/10 to-primary/10 py-12">
      <div className="container mx-auto flex flex-col items-center px-4 md:px-8 lg:px-12">
        <div className="w-full max-w-3xl">
          <header className="mb-12 text-center flex flex-col items-center">
             <Image
                src="https://picsum.photos/150/150"
                alt="Maa Ka Khana Logo"
                width={120} // Slightly larger logo
                height={120}
                className="mb-6 rounded-full shadow-xl border-4 border-white" // Added border and more shadow
                data-ai-hint="indian food cooking mother"
              />
            <h1 className="text-5xl font-extrabold tracking-tight text-primary sm:text-6xl lg:text-7xl drop-shadow-md">
              Maa Ka Khana
            </h1>
            <p className="mt-4 text-xl text-foreground/80 sm:text-2xl max-w-xl mx-auto">
              Tell Maa what's in your fridge, add your preferences, and get a delicious Indian recipe instantly!
            </p>
          </header>

          <RecipeSuggester />
        </div>
      </div>
    </main>
  );
}
