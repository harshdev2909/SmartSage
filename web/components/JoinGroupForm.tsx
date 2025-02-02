"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function JoinGroupForm() {
  const [joinKey, setJoinKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to join a group");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Find the group by join key
      const { data: group, error: groupError } = await supabase
        .from("group")
        .select("id")
        .eq("join_key", joinKey.trim())
        .limit(1);

      if (groupError || !group?.length) {
        throw new Error("Invalid join key");
      }

      const groupId = group[0].id;

      // Check if already a member
      const { data: existingMember } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingMember) {
        throw new Error("You are already a member of this group");
      }

      // Join the group
      const { error: joinError } = await supabase.from("group_members").insert({
        group_id: groupId,
        user_id: user.id,
      });

      if (joinError) throw joinError;

      setJoinKey("");
      router.push(`/group/${groupId}`);
      router.refresh();
    } catch (err: any) {
      console.error("Error joining group:", err);
      setError(err.message || "Failed to join group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="joinKey" className="block text-sm font-medium">
          Join Key
        </label>
        <Input
          id="joinKey"
          type="text"
          value={joinKey}
          onChange={(e) => setJoinKey(e.target.value.toUpperCase())}
          placeholder="Enter join key"
          required
          disabled={loading}
          className="uppercase"
        />
        <p className="mt-1 text-sm text-gray-500">
          Enter the join key exactly as it appears
        </p>
      </div>

      <Button type="submit" disabled={loading || !joinKey.trim()}>
        {loading ? "Joining..." : "Join Group"}
      </Button>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
}
