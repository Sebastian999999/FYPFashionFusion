"use client"

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useChatbot } from "@/components/providers/chatbot-provider";

type ChatHelpProps = {
  question: string;
  buttonText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

export function ChatHelp({ 
  question, 
  buttonText = "Ask assistant", 
  variant = "outline",
  size = "sm",
  className = ""
}: ChatHelpProps) {
  const { sendMessage } = useChatbot();
  
  return (
    <Button 
      onClick={() => sendMessage(question)}
      variant={variant}
      size={size}
      className={className}
    >
      <MessageCircle className="mr-2 h-4 w-4" />
      {buttonText}
    </Button>
  );
}