"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupabase } from "@/lib/supabase-provider";
import { toast } from "@/components/ui/use-toast";

export function JoinGroupDialog() {
  const [joinKey, setJoinKey] = useState("");
  const { supabase } = useSupabase();

  async function handleJoinGroup() {
    const { data: group, error: groupError } = await supabase
      .from("group")
      .select()
      .eq("join_key", joinKey)
      .single();

    if (groupError) {
      toast({ title: "Error", description: "Invalid join key" });
      return;
    }

    const { error: joinError } = await supabase.from("group_members").insert({
      group_id: group.id,
      user_id: (await supabase.auth.getUser()).data.user?.id,
    });

    if (joinError) {
      toast({
        title: "Error",
        description: "Already a member or error joining",
      });
      return;
    }

    toast({ title: "Success", description: "Joined group successfully!" });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Join Group</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join a Group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Enter Join Key"
            value={joinKey}
            onChange={(e) => setJoinKey(e.target.value)}
          />
          <Button onClick={handleJoinGroup}>Join Group</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
