"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getSubjectSummary } from "@/utils/gemini";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserProfile {
  subjects: string[];
  domain_of_study: string;
  year_of_study: string;
}

interface SubjectWithSummary {
  name: string;
  summary: string;
}

const subjectColors = [
  "bg-blue-100 text-blue-800",
  "bg-green-100 text-green-800",
  "bg-purple-100 text-purple-800",
  "bg-yellow-100 text-yellow-800",
  "bg-pink-100 text-pink-800",
  "bg-indigo-100 text-indigo-800",
];

export default function SubjectsCard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subjectsWithSummaries, setSubjectsWithSummaries] = useState<
    SubjectWithSummary[]
  >([]);
  const [selectedSubject, setSelectedSubject] =
    useState<SubjectWithSummary | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (profile?.subjects) {
      fetchSubjectSummaries();
    }
  }, [profile]);

  const fetchSubjectSummaries = async () => {
    if (!profile?.subjects) return;

    const summariesPromises = profile.subjects.map(async (subject) => ({
      name: subject,
      summary: await getSubjectSummary(subject),
    }));

    const summaries = await Promise.all(summariesPromises);
    setSubjectsWithSummaries(summaries);
  };

  const fetchUserProfile = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error("User not found");

      const { data, error } = await supabase
        .from("user_profiles")
        .select("subjects, domain_of_study, year_of_study")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectColor = (index: number) => {
    return subjectColors[index % subjectColors.length];
  };

  const handleSubjectClick = (subject: SubjectWithSummary) => {
    setSelectedSubject(subject);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-64" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile?.subjects?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Your Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No subjects found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-semibold">
            Your Subjects
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xl px-6 py-2">
              {profile.domain_of_study.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-xl px-6 py-2">
              Year {profile.year_of_study}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjectsWithSummaries.map((subject, index) => (
              <div
                key={subject.name}
                className={`p-4 rounded-xl cursor-pointer transition-all
                  hover:shadow-lg ${getSubjectColor(index)}`}
                onClick={() => handleSubjectClick(subject)}
                role="button"
                tabIndex={0}
              >
                <h3 className="text-xl font-semibold mb-2">{subject.name}</h3>
                <p className="text-sm line-clamp-2">{subject.summary}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedSubject?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-gray-700">{selectedSubject?.summary}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
