import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";

interface Event {
  date: number;
  title: string;
  color: string;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Sample events - you can replace this with your actual events data
  const events: Event[] = [
    { date: 4, title: "Machine Learning", color: "blue" },
    { date: 10, title: "Artificial Intelligence", color: "green" },
    { date: 15, title: "Cloud Computing", color: "yellow" },
    { date: 19, title: "Paper Review", color: "purple" },
  ];

  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const getEventForDay = (day: number) => {
    return events.find((event) => event.date === day);
  };

  const getEventStyles = (color: string) => {
    const styles = {
      blue: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      yellow: "bg-yellow-100 text-yellow-800",
      purple: "bg-purple-100 text-purple-800",
    };
    return styles[color as keyof typeof styles] || "";
  };

  return (
    <Card>
      <CardHeader className="space-y-0 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Your Schedule</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousMonth}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Badge
              variant="outline"
              className="flex items-center justify-center px-3"
            >
              {format(currentDate, "MMMM yyyy")}
            </Badge>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before the start of the month */}
          {Array.from({ length: startDate.getDay() }).map((_, index) => (
            <div key={`empty-start-${index}`} className="aspect-square" />
          ))}

          {/* Days of the month */}
          {days.map((day) => {
            const dayOfMonth = day.getDate();
            const event = getEventForDay(dayOfMonth);

            return (
              <div
                key={day.toISOString()}
                className="aspect-square flex flex-col items-center justify-center border rounded-lg p-2"
              >
                <span className="text-sm font-medium">{dayOfMonth}</span>
                {event && (
                  <div
                    className={`mt-1 text-sm rounded px-3 py-1 w-full text-center truncate ${getEventStyles(
                      event.color,
                    )}`}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty cells for days after the end of the month */}
          {Array.from({
            length: 6 - endDate.getDay(),
          }).map((_, index) => (
            <div key={`empty-end-${index}`} className="aspect-square" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
