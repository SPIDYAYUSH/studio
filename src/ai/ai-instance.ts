import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      // Specify the API version explicitly if needed, otherwise defaults may apply
      // apiVersion: 'v1beta', // Example: Use 'v1beta' if required by specific features
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  // Default model, can be overridden in specific generate calls
  model: 'googleai/gemini-2.0-flash', // Using a generally capable model
  logLevel: 'debug', // Optional: Set log level for development
  enableTracing: true, // Optional: Enable tracing for debugging flows
});
