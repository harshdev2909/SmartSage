import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CreateGroupForm from "@/components/CreateGroupForm";
import JoinGroupForm from "@/components/JoinGroupForm";

export default async function groupPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Create New Group</h2>
          <CreateGroupForm />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-4">Join a Group</h2>
          <JoinGroupForm />
        </div>
      </div>

      <div className="mt-8"></div>
    </div>
  );
}
