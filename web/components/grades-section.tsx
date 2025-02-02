import { Card, CardContent } from "@/components/ui/card";

export function GradesSection() {
  const grades = [
    { subject: "DBMS", score: 98 },
    { subject: "DSA", score: 72 },
    { subject: "Computer Networks", score: 34 },
  ];

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Grades
      </h2>
      <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <CardContent className="p-4">
          <div className="space-y-3">
            {grades.map((grade) => (
              <div
                key={grade.subject}
                className="flex items-center justify-between"
              >
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {grade.subject}
                </span>
                <span
                  className={`text-lg font-semibold ${
                    grade.score >= 90
                      ? "text-[#FF8000]"
                      : grade.score >= 70
                        ? "text-[#FF9933]"
                        : "text-[#FFB266]"
                  }`}
                >
                  {grade.score}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
