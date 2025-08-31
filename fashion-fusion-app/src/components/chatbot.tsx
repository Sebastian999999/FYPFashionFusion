"use client"

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, MessageSquare, X, Search, BarChart2, SlidersHorizontal } from "lucide-react";
import { useChatbot } from "@/components/providers/chatbot-provider";

interface Message {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Suggested queries to help users understand what they can ask
const suggestedQueries = [
  "Compare Khaadi and Gul Ahmed",
  "Which brand has the best quality?",
  "Show me formal wear options",
  "How does brand ranking work?",
  "Find products under 5000 PKR",
  "Best rated summer collection"
];

export function ChatBot() {
  const { isOpen, closeChatbot, openChatbot } = useChatbot();
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Hi there! I'm the FashionFusion assistant. I can help you find products across different brands, compare them, understand brand rankings, and more. What can I help you with today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(`session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (message = input) => {
    if (!message.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      content: message,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8003/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          session_id: sessionId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }
      
      const data = await response.json();
      
      // Add bot message
      const botMessage: Message = {
        content: data.response,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setSessionId(data.session_id);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        content: "Sorry, I'm having trouble connecting. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Register the sendMessage function with the context
  useEffect(() => {
    if (window.__registerChatbotSendMessage) {
      window.__registerChatbotSendMessage(handleSend);
    }
    
    // Process any pending messages
    if (window.__pendingChatbotMessages && window.__pendingChatbotMessages.length > 0) {
      const pendingMessages = [...window.__pendingChatbotMessages];
      window.__pendingChatbotMessages = [];
      
      // Send the first pending message
      if (pendingMessages.length > 0) {
        handleSend(pendingMessages[0]);
      }
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuery = (query: string) => {
    handleSend(query);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={openChatbot}
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 p-0 shadow-lg bg-purple-600 hover:bg-purple-700"
        aria-label="Open chat"
      >
        <MessageSquare size={24} />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-20 right-4 w-80 md:w-96 shadow-xl border-purple-200 overflow-hidden z-50 max-h-[80vh] flex flex-col">
      <CardHeader className="bg-purple-600 text-white py-3 px-4 flex flex-row justify-between items-center shrink-0">
        <CardTitle className="text-lg font-medium">FashionFusion Assistant</CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={closeChatbot}
          className="h-8 w-8 text-white hover:bg-purple-700 rounded-full"
        >
          <X size={18} />
        </Button>
      </CardHeader>
      
      <ScrollArea className="flex-grow overflow-y-auto max-h-[50vh]">
        <CardContent className="p-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex mb-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'bot' && (
                <Avatar className="h-8 w-8 mr-2 shrink-0">
                  <AvatarImage src="/logo.png" alt="FashionFusion" />
                  <AvatarFallback>FF</AvatarFallback>
                </Avatar>
              )}
              
              <div 
                className={`py-2 px-3 rounded-lg max-w-[80%] ${
                  message.sender === 'user' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              
              {message.sender === 'user' && (
                <Avatar className="h-8 w-8 ml-2 shrink-0">
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>
      </ScrollArea>
      
      {/* Suggested queries section */}
      {messages.length < 3 && (
        <div className="p-3 border-t border-b bg-gray-50">
          <p className="text-xs text-gray-500 mb-2">Try asking about:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((query, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs py-1 px-2 h-auto whitespace-nowrap flex items-center"
                onClick={() => handleSuggestedQuery(query)}
              >
                {query.includes("Compare") && <BarChart2 className="mr-1 h-3 w-3" />}
                {query.includes("Find") && <Search className="mr-1 h-3 w-3" />}
                {query.includes("Best") && <SlidersHorizontal className="mr-1 h-3 w-3" />}
                {query}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <CardFooter className="p-3 border-t shrink-0">
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={() => handleSend()} 
            disabled={isLoading || !input.trim()} 
            size="icon"
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}