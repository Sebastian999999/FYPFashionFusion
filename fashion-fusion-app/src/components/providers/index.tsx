"use client"

//import { ThemeProvider } from "@/components/providers/theme-provider";
import { ChatbotProvider } from "./chatbot-provider";
import { CompareProvider } from "./compare-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ChatbotProvider>
        <CompareProvider>
          {children}
        </CompareProvider>
      </ChatbotProvider>
    // </ThemeProvider> 
  );
}