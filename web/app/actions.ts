"use server";

import { createClient } from "@/utils/supabase/server";
import { nanoid } from "nanoid";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createGroup(formData: FormData) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: "Not authenticated" };
    }

    const groupName = formData.get("name") as string;
    if (!groupName) {
      return { error: "Group name is required" };
    }

    // Create group
    const { data: group, error: groupError } = await supabase
      .from("group")
      .insert({
        name: groupName,
        join_key: nanoid(10),
        created_by: user.id,
      })
      .select()
      .single();

    if (groupError) throw groupError;

    // Add creator as member
    const { error: memberError } = await supabase.from("group_members").insert({
      group_id: group.id,
      user_id: user.id,
    });

    if (memberError) throw memberError;

    redirect(`/group/${group.id}`);
  } catch (error: any) {
    return { error: error.message };
  }
}
