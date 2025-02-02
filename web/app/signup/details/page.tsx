"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const MAX_SUBJECTS = 10;
const MIN_SUBJECT_LENGTH = 2;
const MAX_SUBJECT_LENGTH = 50;

export default function RegisterDetailsPage() {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [domain, setDomain] = useState("");
  const [year, setYear] = useState("");
  const [subjects, setSubjects] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          router.push("/login");
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error checking authentication:", error);
        router.push("/login");
      }
    };

    checkUser();
  }, []);

  const validateSubject = (subject: string): boolean => {
    return (
      subject.length >= MIN_SUBJECT_LENGTH &&
      subject.length <= MAX_SUBJECT_LENGTH
    );
  };

  const processSubjects = (subjectsString: string): string[] => {
    const subjects = subjectsString
      .split(",")
      .map((subject) => subject.trim())
      .filter((subject) => subject.length > 0)
      .filter(validateSubject);

    return [...new Set(subjects)].slice(0, MAX_SUBJECTS);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Refresh session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("Please sign in again");
      }

      // Validate required fields
      if (!fullName || !domain || !year) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      if (processSubjects(subjects).length === 0) {
        toast({
          title: "Error",
          description: "Please enter at least one valid subject",
          variant: "destructive",
        });
        return;
      }

      const subjectsArray = processSubjects(subjects);

      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert([
          {
            id: session.user.id,
            full_name: fullName,
            domain_of_study: domain,
            year_of_study: year,
            subjects: subjectsArray,
          },
        ]);

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "Your profile has been created successfully!",
      });

      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });

      if (error.message.includes("sign in")) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-blue-50 justify-center items-center">
        <Card className="w-full max-w-md p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking authentication...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-blue-50 justify-center items-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-blue-800">
            Additional Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-blue-700"
                >
                  Name
                </label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  className="w-full border-blue-200 focus:border-green-500 focus:ring-green-500"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="domain"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-blue-700"
                >
                  Domain of Study
                </label>
                <Select
                  value={domain}
                  onValueChange={setDomain}
                  disabled={loading}
                  required
                >
                  <SelectTrigger className="w-full border-blue-200 focus:border-green-500 focus:ring-green-500">
                    <SelectValue placeholder="Select your domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cs">Computer Science</SelectItem>
                    <SelectItem value="it">Information Technology</SelectItem>
                    <SelectItem value="ds">Data Science</SelectItem>
                    <SelectItem value="extc">Electronics</SelectItem>
                    <SelectItem value="mech">Mechanical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="year"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-blue-700"
                >
                  Year of Study
                </label>
                <Select
                  value={year}
                  onValueChange={setYear}
                  disabled={loading}
                  required
                >
                  <SelectTrigger className="w-full border-blue-200 focus:border-green-500 focus:ring-green-500">
                    <SelectValue placeholder="Select your year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">First Year</SelectItem>
                    <SelectItem value="2">Second Year</SelectItem>
                    <SelectItem value="3">Third Year</SelectItem>
                    <SelectItem value="4">Fourth Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="subjects"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-blue-700"
                >
                  Subjects
                </label>
                <div className="space-y-2">
                  <Input
                    id="subjects"
                    placeholder="Enter subjects separated by commas (e.g., Machine Learning, Data Structures, AI)"
                    className="w-full border-blue-200 focus:border-green-500 focus:ring-green-500"
                    value={subjects}
                    onChange={(e) => setSubjects(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">
                    Enter up to {MAX_SUBJECTS} subjects, each between{" "}
                    {MIN_SUBJECT_LENGTH} and {MAX_SUBJECT_LENGTH} characters.
                    Separate subjects with commas.
                  </p>
                  {subjects && (
                    <div className="flex flex-wrap gap-2">
                      {processSubjects(subjects).map((subject, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <CardFooter className="flex flex-col space-y-4 px-0 pt-4">
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={loading}
                >
                  {loading
                    ? "Completing Registration..."
                    : "Complete Registration"}
                </Button>
                <Button
                  variant="link"
                  className="w-full text-blue-700 hover:text-blue-900"
                  asChild
                >
                  <Link href="/login">Back to Login</Link>
                </Button>
              </CardFooter>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
