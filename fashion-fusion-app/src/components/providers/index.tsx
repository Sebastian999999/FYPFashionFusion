"use client"

//import { ThemeProvider } from "@/components/providers/theme-provider";
import { ChatbotProvider } from "./chatbot-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ChatbotProvider>
        {children}
      </ChatbotProvider>
    // </ThemeProvider> 
  );
}