import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function checkGroupMembership(groupId: string, userId: string) {
  const cookieStore = cookies();
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error checking membership:", error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error("Error in checkGroupMembership:", err);
    return false;
  }
}
