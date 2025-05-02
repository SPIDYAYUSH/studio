import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster" // Import Toaster
import './globals.css';

export const metadata: Metadata = {
  title: 'Maa Ka Khana - AI Recipe Suggester',
  description: 'Get Indian recipe suggestions based on ingredients you have, just like asking Maa!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        {children}
        <Toaster /> {/* Add Toaster component */}
      </body>
    </html>
  );
}
