import { RecipeSuggester } from '@/components/recipe-suggester';
import Image from 'next/image';

export default function Home() {
  return (
    <main
      className="min-h-screen py-12 bg-background"
      // Enhanced background with more dynamic gradients and a subtle noise texture
      style={{
        backgroundImage: `
          /* Subtle noise texture */
          linear-gradient(45deg, hsla(0,0%,0%,0.02) 25%, transparent 25%, transparent 75%, hsla(0,0%,0%,0.02) 75%),
          linear-gradient(45deg, hsla(0,0%,0%,0.02) 25%, transparent 25%, transparent 75%, hsla(0,0%,0%,0.02) 75%),
          /* Enhanced gradients */
          radial-gradient(circle at 10% 20%, hsl(var(--primary) / 0.2), transparent 60%),
          radial-gradient(ellipse at 90% 85%, hsl(var(--secondary) / 0.25), transparent 70%),
          radial-gradient(circle at 50% 50%, hsl(var(--accent) / 0.05), transparent 50%),
          /* Base background */
          linear-gradient(to bottom right, hsl(var(--background)), hsl(var(--background) / 0.9))
        `,
        backgroundSize: '10px 10px, 10px 10px, cover, cover, cover, cover', // Size for noise texture
      }}
    >
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
