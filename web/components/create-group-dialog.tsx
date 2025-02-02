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

export function CreateGroupDialog() {
  const [groupName, setGroupName] = useState("");
  const { supabase } = useSupabase();

  async function handleCreateGroup() {
    const joinKey = generateJoinKey();
    const { data, error } = await supabase
      .from("group")
      .insert({
        name: groupName,
        join_key: joinKey,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: error.message });
      return;
    }

    // Also add creator as member
    await supabase.from("group_members").insert({
      group_id: data.id,
      user_id: (await supabase.auth.getUser()).data.user?.id,
    });

    toast({
      title: "Success",
      description: `Group created! Join key: ${joinKey}`,
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create New Group</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <Button onClick={handleCreateGroup}>Create Group</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
