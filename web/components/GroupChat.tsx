"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import type { MessageWithUser } from "@/types/supabase";
import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";

interface GroupChatProps {
  groupId: string;
}

const STOP_WORDS = new Set([
  "fuck",
  "fuk",
  "fck",
  "f*ck",
  "f**k",
  "f***",
  "shit",
  "sh*t",
  "sh!t",
  "shyt",
  "bitch",
  "b*tch",
  "b!tch",
  "dick",
  "d*ck",
  "pussy",
  "p*ssy",
  "ass",
  "a$$",
  "a**",
  "nigga",
  "n*gga",
  "nigger",
  "n*gger",
  "cunt",
  "c*nt",
  "whore",
  "wh*re",
  "sex",
  "s*x",
  // Add more variations and common misspellings
]);

export default function GroupChat({ groupId }: GroupChatProps) {
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          *,
          user_profiles!user_id (
            id,
            full_name
          )
        `,
        )
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          stack: error.stack,
        });
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };

    // Initial fetch
    fetchMessages();

    // Set up interval for periodic refresh
    const refreshInterval = setInterval(fetchMessages, 5000);

    // Subscribe to new messages
    const channel = supabase
      .channel(`room:${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          // Fetch the complete message with profile
          const { data: messageData, error: messageError } = await supabase
            .from("messages")
            .select(
              `
              *,
              user_profiles!user_id (
                id,
                full_name
              )
            `,
            )
            .eq("id", payload.new.id)
            .single();

          if (!messageError && messageData) {
            setMessages((current) => [...current, messageData]);
          }
        },
      )
      .subscribe();

    return () => {
      clearInterval(refreshInterval);
      supabase.removeChannel(channel);
    };
  }, [groupId, supabase, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [isSending, setIsSending] = useState(false);

  const containsStopWords = (text: string): boolean => {
    const words = text.toLowerCase().split(/\s+/);

    // Check each word
    for (const word of words) {
      // Remove common substitution characters
      const cleanWord = word
        .replace(/[1!@#$%^&*]/g, "") // Remove common substitution characters
        .replace(/0/g, "o") // Replace 0 with o
        .replace(/1/g, "i") // Replace 1 with i
        .replace(/3/g, "e") // Replace 3 with e
        .replace(/4/g, "a") // Replace 4 with a
        .replace(/5/g, "s") // Replace 5 with s
        .replace(/7/g, "t") // Replace 7 with t
        .replace(/8/g, "b") // Replace 8 with b
        .trim();

      if (STOP_WORDS.has(cleanWord)) {
        return true;
      }

      // Check for partial matches (for embedded bad words)
      for (const stopWord of STOP_WORDS) {
        if (cleanWord.includes(stopWord)) {
          return true;
        }
      }
    }

    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || isSending) return;

    try {
      setIsSending(true);

      // First check against our stop words
      if (containsStopWords(newMessage)) {
        setWarning(
          "Please keep the conversation respectful. Your message contains inappropriate content.",
        );
        return;
      }

      // Then check with the API as a second layer
      const profanityCheck = await fetch("https://vector.profanity.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      });

      if (!profanityCheck.ok) {
        throw new Error("Failed to check message content");
      }

      const profanityResult = await profanityCheck.json();

      // If message contains profanity
      if (profanityResult.isProfanity || profanityResult.score > 0.9) {
        setWarning(
          "Please keep the conversation respectful. Your message contains inappropriate content.",
        );
        return;
      }

      // If passes both checks, send the message
      const { error } = await supabase.from("messages").insert({
        content: newMessage,
        group_id: groupId,
        user_id: user.id,
      });

      if (error) throw error;

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setWarning("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[80%] ${
              message.user_id === user?.id ? "ml-auto" : ""
            }`}
          >
            {message.user_id !== user?.id && (
              <div className="text-sm text-gray-600 mb-1">
                {message.user?.full_name || "Anonymous"}
              </div>
            )}
            <div
              className={`p-3 rounded-lg ${
                message.user_id === user?.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {message.content}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatDistanceToNow(new Date(message.created_at), {
                addSuffix: true,
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {warning && (
        <div className="p-2 mb-2 text-sm text-red-600 bg-red-50 rounded">
          {warning}
          <button
            className="ml-2 text-red-800 hover:text-red-900"
            onClick={() => setWarning(null)}
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isSending}
          />
          <Button type="submit" disabled={!newMessage.trim() || isSending}>
            {isSending ? "Sending..." : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
}
