"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import ScrambleAnimation from "./ScrambleAnimation";
import { usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // Add this hook
  const [userName, setUserName] = useState<string>("");
  const [user, setUser] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { label: "Features", href: "#features" },
    { label: "How it Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
  ];
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user session
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) throw userError;
        setUser(user.id);
        setUserEmail(user.email || "");

        // Generate avatar URL using UI Avatars
        const uiAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user.email || "User",
        )}&background=random&size=128`;
        setAvatarUrl(uiAvatarUrl);

        // Fetch user profile from profiles table
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        if (profile) {
          setUserName(profile.full_name);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/80 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-primary-foreground">
              <ScrambleAnimation />
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-primary-foreground hover:text-accent transition-colors"
              >
                {item.label}
              </a>
            ))}
            {user ? (
              <Button 
                className="rounded-xl" 
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = '/';
                }}
              >
                Logout
              </Button>
            ) : (
              <Button className="rounded-xl">
                <Link href="/login">Sign In</Link>
              </Button>
            )}
                  {/* <Button className="rounded-xl">
                    <Link href="/signup">Get Started</Link>
                  </Button> */}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-6 w-6 text-primary-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-primary-foreground" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-primary">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block px-3 py-2 text-primary-foreground hover:text-accent transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="flex flex-col space-y-2 p-3">
              <Button className="w-full">Sign in</Button>
              {/* <Button className="w-full">Get Started</Button> */}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
