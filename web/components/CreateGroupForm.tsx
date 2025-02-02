"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateGroupForm() {
  const [groupName, setGroupName] = useState("");
  const [joinKey, setJoinKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to create a group");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const generatedJoinKey = nanoid(8).toUpperCase();

      // Create the group
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert({
          name: groupName,
          join_key: generatedJoinKey,
          created_by: user.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as member
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: group.id,
          user_id: user.id,
        });

      if (memberError) throw memberError;

      setJoinKey(generatedJoinKey);
      setGroupName("");

      // Delay redirect to show join key
      setTimeout(() => {
        router.push(`/teamspace/${group.id}`);
        router.refresh();
      }, 5000);
    } catch (err: any) {
      console.error("Error creating group:", err);
      setError(err.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Please log in to create a group</div>;
  }

  return (
    <div className="space-y-4">
      {joinKey ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <h3 className="text-green-800 font-medium">
            Group Created Successfully!
          </h3>
          <p className="mt-2 text-sm text-green-600">
            Share this join key with others:
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="bg-white px-4 py-2 rounded border text-lg font-mono">
              {joinKey}
            </code>
            <Button
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(joinKey);
                alert("Join key copied!");
              }}
            >
              Copy
            </Button>
          </div>
          <p className="mt-2 text-xs text-green-600">
            Redirecting to group page in a few seconds...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium">
              Group Name
            </label>
            <Input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              required
              disabled={loading}
              minLength={3}
              maxLength={50}
            />
          </div>

          <Button type="submit" disabled={loading || !groupName.trim()}>
            {loading ? "Creating..." : "Create Group"}
          </Button>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      )}
    </div>
  );
}
