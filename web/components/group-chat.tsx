"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase-provider";
import { Message } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GroupChatProps {
  groupId: string;
}

export function GroupChat({ groupId }: GroupChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { supabase } = useSupabase();

  useEffect(() => {
    // Load initial messages
    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`group_${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, supabase]);

  async function loadMessages() {
    const { data } = await supabase
      .from("messages")
      .select("*, user:users(full_name, avatar_url)")
      .eq("group_id", groupId)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);
  }

  async function sendMessage() {
    if (!newMessage.trim()) return;

    const { error } = await supabase.from("messages").insert({
      group_id: groupId,
      content: newMessage.trim(),
    });

    if (!error) setNewMessage("");
  }

  return (
    <div className="flex flex-col h-[600px] p-4">
      <ScrollArea className="flex-1 mb-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="bg-muted p-3 rounded-lg">
              <p className="font-semibold">{message.user?.full_name}</p>
              <p>{message.content}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
}
