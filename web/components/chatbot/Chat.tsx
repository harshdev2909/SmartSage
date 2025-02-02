"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import removeMd from "remove-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
  doc?: string;
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: input,
          params: {
            user_id: "user_1",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to the chatbot server.");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data?.response?.generated_text
          ? removeMd(data.response.generated_text)
          : "I couldn't process your request. Please try again.",
        doc: data?.response?.params
          ? removeMd(data.response.params)
          : "No additional details available.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "An error occurred while processing your request.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-[100dvh] flex">
      <Card className="w-full flex flex-col mx-auto">
        <CardContent className="p-6 flex-1 flex flex-col overflow-hidden">
          {/* Main container with fixed height and flex column */}
          <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
            {/* Scrollable chat area that takes remaining space */}
            <ScrollArea className="flex-1 pr-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } mb-4`}
                >
                  <div
                    className={`flex items-start ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={
                          message.role === "user"
                            ? "/user-avatar.png"
                            : "/bot-avatar.png"
                        }
                      />
                      <AvatarFallback>
                        {message.role === "user" ? "U" : "AI"}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`mx-2 p-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      {message.role === "assistant" && message.doc && (
                        <div className="text-gray-500 text-sm mb-1">
                          {message.doc}
                        </div>
                      )}
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input form fixed at bottom */}
            <div className="pt-4">
              <form onSubmit={handleSubmit} className="flex w-full">
                <Input
                  type="text"
                  placeholder="Type your message here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-grow mr-2"
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  aria-disabled={isLoading}
                  className={isLoading ? "cursor-not-allowed" : ""}
                >
                  {isLoading ? "Sending..." : "Send"}
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
