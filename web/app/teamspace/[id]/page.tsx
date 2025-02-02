import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import GroupChat from "@/components/GroupChat";

export default async function GroupPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", params.id)
    .eq("user_id", user.id)
    .single();

  if (membershipError || !membership) {
    redirect("/teamspace");
  }

  return <GroupChat groupId={params.id} />;
}
