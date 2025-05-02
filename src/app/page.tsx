import { RecipeSuggester } from '@/components/recipe-suggester';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12">
      <div className="w-full max-w-3xl">
        <header className="mb-8 text-center">
           <Image
              src="https://picsum.photos/150/150"
              alt="Maa Ka Khana Logo"
              width={100}
              height={100}
              className="mx-auto mb-4 rounded-full shadow-md"
              data-ai-hint="indian food cooking mother"
            />
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl">
            Maa Ka Khana
          </h1>
          <p className="mt-3 text-lg text-muted-foreground sm:text-xl">
            Tell Maa what's in your fridge, and get a delicious Indian recipe!
          </p>
        </header>

        <RecipeSuggester />
      </div>
    </main>
  );
}
