"use client"

import React, { createContext, useState, useContext, useCallback } from 'react';

type ChatbotContextType = {
  isOpen: boolean;
  openChatbot: () => void;
  closeChatbot: () => void;
  toggleChatbot: () => void;
  sendMessage: (message: string) => void;
};

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const openChatbot = useCallback(() => setIsOpen(true), []);
  const closeChatbot = useCallback(() => setIsOpen(false), []);
  const toggleChatbot = useCallback(() => setIsOpen(prev => !prev), []);
  
  // Reference to the sendMessage function in the ChatBot component
  const [sendMessageFn, setSendMessageFn] = useState<((message: string) => void) | null>(null);
  
  const registerSendMessage = useCallback((fn: (message: string) => void) => {
    setSendMessageFn(() => fn);
  }, []);
  
  const sendMessage = useCallback((message: string) => {
    if (sendMessageFn) {
      openChatbot();
      sendMessageFn(message);
    } else {
      // If sendMessageFn is not registered yet, store the message to send later
      window.__pendingChatbotMessages = window.__pendingChatbotMessages || [];
      window.__pendingChatbotMessages.push(message);
      openChatbot();
    }
  }, [sendMessageFn, openChatbot]);

  // Expose the registerSendMessage function for the ChatBot component
  React.useEffect(() => {
    window.__registerChatbotSendMessage = registerSendMessage;
    
    return () => {
      delete window.__registerChatbotSendMessage;
    };
  }, [registerSendMessage]);
  
  return (
    <ChatbotContext.Provider 
      value={{ 
        isOpen, 
        openChatbot, 
        closeChatbot, 
        toggleChatbot,
        sendMessage
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
}

// Add these globals for TypeScript
declare global {
  interface Window {
    __registerChatbotSendMessage?: (fn: (message: string) => void) => void;
    __pendingChatbotMessages?: string[];
  }
}

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};