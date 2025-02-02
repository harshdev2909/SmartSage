"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import type { Group } from "@/types/supabase";
import { useAuth } from "@/context/AuthProvider";

export default function groupList() {
  const [group, setgroup] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchgroup = async () => {
      // Get group IDs where user is a member
      const { data: memberships } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);

      if (!memberships?.length) {
        setgroup([]);
        setLoading(false);
        return;
      }

      // Get the group
      const { data: groupData } = await supabase
        .from("group")
        .select("*")
        .in(
          "id",
          memberships.map((m) => m.group_id),
        )
        .order("created_at", { ascending: false });

      setgroup(groupData || []);
      setLoading(false);
    };

    fetchgroup();

    // Subscribe to changes
    const channel = supabase
      .channel("group_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "group_members",
          filter: `user_id=eq.${user.id}`,
        },
        fetchgroup,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Your group</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Your group</h2>
      {group.length === 0 ? (
        <p className="text-gray-500">You are not a member of any group.</p>
      ) : (
        group.map((group) => (
          <Link
            key={group.id}
            href={`/teamspace/${group.id}`}
            className="block p-4 border rounded hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{group.name}</h3>
                <p className="text-sm text-gray-500">
                  Created: {new Date(group.created_at).toLocaleDateString()}
                </p>
              </div>
              {group.created_by === user.id && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Owner
                </span>
              )}
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
