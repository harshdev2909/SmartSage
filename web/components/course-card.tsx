import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface CourseCardProps {
  title: string;
  subtitle: string;
  progress: number;
  lesson: string;
  icon: string;
  badge?: string;
}

export function CourseCard({
  title,
  subtitle,
  progress,
  lesson,
  icon,
  badge,
}: CourseCardProps) {
  return (
    <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-[#FF8000] p-2 text-center text-2xl text-white">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{subtitle}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
            <span>{lesson}</span>
            <span>You are {progress}%</span>
          </div>
          <Progress value={progress} className="bg-gray-200 dark:bg-gray-700">
            <div
              className="bg-[#FF8000] h-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </Progress>
          {badge && (
            <Badge
              variant="secondary"
              className="bg-[#FF8000] text-white hover:bg-[#FF9933]"
            >
              {badge}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
