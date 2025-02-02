"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data.user && data.session) {
        // Redirect to signup/details page instead of dashboard
        router.push("/signup/details");
      } else {
        // Email confirmation required
        toast({
          title: "Check your email",
          description:
            "We sent you a confirmation link to complete your registration",
          variant: "default",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred during sign up",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred during Google sign up",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-blue-50">
      <Card className="flex-1 rounded-[2rem] shadow-2xl z-10 flex flex-col justify-center items-center bg-white">
        <div className="w-full max-w-md p-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-blue-800">
              Create Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-blue-700"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    className="w-full border-blue-200 focus:border-green-500 focus:ring-green-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-blue-700"
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    className="w-full border-blue-200 focus:border-green-500 focus:ring-green-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>
              </div>
              <CardFooter className="flex flex-col space-y-4 px-0 pt-4">
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create account"}
                </Button>
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-blue-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-blue-600">
                      Or continue with
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={handleGoogleSignUp}
                  type="button"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="google"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                  >
                    <path
                      fill="currentColor"
                      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                    ></path>
                  </svg>
                  Google
                </Button>
                <Button
                  variant="link"
                  className="w-full text-blue-700 hover:text-blue-900"
                  asChild
                >
                  <Link href="/login">Already have an account? Login here</Link>
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </div>
      </Card>
      <div className="relative flex-1 hidden md:block">
        <Image
          src="/placeholder.svg?height=1080&width=1920&text=Study+Image"
          alt="Education background"
          layout="fill"
          objectFit="cover"
          className="rounded-[2rem]"
        />
      </div>
    </div>
  );
}
