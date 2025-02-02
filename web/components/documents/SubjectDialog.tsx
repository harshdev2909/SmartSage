"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

interface SubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (subject: string) => void;
  fileName: string;
}

export function SubjectDialog({
  open,
  onOpenChange,
  onSubmit,
  fileName,
}: SubjectDialogProps) {
  // Create Supabase client using useMemo to prevent recreation on every render
  const supabase = useMemo(
    () =>
      createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  const [subjects, setSubjects] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch subjects from user_profile
  useEffect(() => {
    let isMounted = true;

    async function fetchUserSubjects() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("Error getting user:", userError);
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("subjects")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching subjects:", profileError);
          return;
        }

        if (profileData?.subjects && isMounted) {
          setSubjects([...profileData.subjects, "Other"]);
        }
      } catch (error) {
        console.error("Error in fetchUserSubjects:", error);
      }
    }

    fetchUserSubjects();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const handleSubmit = async () => {
    const finalSubject = subject === "Other" ? customSubject : subject;

    if (subject === "Other" && customSubject) {
      setLoading(true);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("Error getting user:", userError);
          setLoading(false);
          return;
        }

        // Get current subjects array
        const { data: profileData, error: fetchError } = await supabase
          .from("user_profiles")
          .select("subjects")
          .eq("id", user.id)
          .single();

        if (fetchError) {
          console.error("Error fetching current subjects:", fetchError);
          setLoading(false);
          return;
        }

        // Create new subjects array with the custom subject
        const updatedSubjects = [
          ...(profileData?.subjects || []),
          customSubject,
        ];

        // Update the user_profile with new subjects array
        const { error: updateError } = await supabase
          .from("user_profile")
          .update({ subjects: updatedSubjects })
          .eq("id", user.id);

        if (updateError) {
          console.error("Error updating subjects:", updateError);
          setLoading(false);
          return;
        }

        // Update local subjects state
        setSubjects([...updatedSubjects, "Other"]);
      } catch (error) {
        console.error("Error in handleSubmit:", error);
      } finally {
        setLoading(false);
      }
    }

    onSubmit(finalSubject);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Subject</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              File: {fileName}
            </p>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {subject === "Other" && (
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Custom Subject
              </label>
              <Input
                placeholder="Enter custom subject"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              loading || !subject || (subject === "Other" && !customSubject)
            }
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
