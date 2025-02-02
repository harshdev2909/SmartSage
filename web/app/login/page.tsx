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

export default function LoginPage() {
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) throw error;
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.message || "An error occurred during Google sign in",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-blue-50">
      <Card className="flex-1 rounded-lg shadow-2xl z-10 flex flex-col justify-center items-center bg-white">
        <div className="w-full max-w-md p-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-blue-800">
              Welcome Back
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
                    className="w-full border-blue-200 focus:border-green-500 focus:ring-green-500 rounded-md"
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
                    className="w-full border-blue-200 focus:border-green-500 focus:ring-green-500 rounded-md"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <CardFooter className="flex flex-col space-y-4 px-0 pt-4">
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-md"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Log in"}
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
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 rounded-md"
                  onClick={handleGoogleSignIn}
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
                  className="w-full text-blue-700 hover:text-blue-900 rounded-md"
                  asChild
                >
                  <Link href="/signup">Don't have an account? Sign up</Link>
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
          className="rounded-l-3xl"
        />
      </div>
    </div>
  );
}
