"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Add this import
import {
  LayoutDashboard,
  FileText,
  Book,
  Users,
  BotIcon as Robot,
  MapIcon as RoadMap,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname(); // Add this hook
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const supabase = createClient();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user session
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) throw userError;

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

  const navigationItems = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      href: "/documents",
      icon: FileText,
      label: "Documents",
    },
    {
      href: "/teamspace",
      icon: Users,
      label: "Teamspace",
    },
    {
      href: "/flashcards",
      icon: Book,
      label: "Flashcards",
    },
    {
      href: "/quiz-generator",
      icon: Book,
      label: "Quiz",
    },
    {
      href: "/courses",
      icon: Book,
      label: "Course Generation",
    },
    {
      href: "/ai",
      icon: Robot,
      label: "My AI",
    },
    {
      href: "/roadmap",
      icon: RoadMap,
      label: "Roadmap Generation",
    },
    {
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      label: "Admin Dashboard",
    },
  ];

  return (
    <aside className="w-[250px] border-r border-gray-200 bg-white text-gray-900 p-6">
      {/* Profile Section */}
      <div className="mb-6 flex items-center gap-3">
        <Avatar>
          <AvatarImage src={avatarUrl} alt={userName || "User avatar"} />
          <AvatarFallback className="bg-gray-200">
            {userName ? userName[0].toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{userName || "Welcome!"}</h2>
          <p className="text-sm text-gray-500 truncate" title={userEmail}>
            {userEmail}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                isActive
                  ? "bg-[#FF8000] text-white"
                  : "text-gray-700 hover:bg-gray-100",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
