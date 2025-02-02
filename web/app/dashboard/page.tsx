"use client";

import Calendar from "@/components/dashboard/Calendar";
import SubjectsCard from "@/components/dashboard/SubjectsCard";

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-6">
        {/* Subjects Section */}
        <div>
          <SubjectsCard />
        </div>

        {/* Calendar Section */}
        <div>
          <Calendar />
        </div>
      </div>
    </div>
  );
}
