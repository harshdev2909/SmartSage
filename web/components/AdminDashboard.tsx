"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";

interface Assignment {
  subject: string;
  task: string;
  dueDate: string;
  file?: File;
}

// Change this to a named export
export function AdminDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newAssignment, setNewAssignment] = useState<Assignment>({
    subject: "",
    task: "",
    dueDate: "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAssignments([...assignments, newAssignment]);
    // Reset form
    setNewAssignment({
      subject: "",
      task: "",
      dueDate: "",
    });
  };

  const handleInputChange = (field: keyof Assignment, value: string) => {
    setNewAssignment({
      ...newAssignment,
      [field]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewAssignment({
        ...newAssignment,
        file,
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* <Sidebar darkMode={false} /> */}

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>

          {/* Create Assignment Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    value={newAssignment.subject}
                    onValueChange={(value) =>
                      handleInputChange("subject", value)
                    }
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Data Structures">
                        Data Structures
                      </SelectItem>
                      <SelectItem value="Algorithms">Algorithms</SelectItem>
                      <SelectItem value="Computer Networks">
                        Computer Networks
                      </SelectItem>
                      <SelectItem value="Database Systems">
                        Database Systems
                      </SelectItem>
                      <SelectItem value="Software Engineering">
                        Software Engineering
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="task">Task</Label>
                  <Input
                    id="task"
                    placeholder="Enter task description"
                    value={newAssignment.task}
                    onChange={(e) => handleInputChange("task", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newAssignment.dueDate}
                    onChange={(e) =>
                      handleInputChange("dueDate", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="file">Upload File</Label>
                  <Input id="file" type="file" onChange={handleFileChange} />
                </div>
                <Button type="submit">Create Assignment</Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assigned Assignments */}
            <Card>
              <CardHeader>
                <CardTitle>Assigned Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {assignments.map((assignment, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors duration-200 bg-white shadow-sm hover:shadow-md"
                    >
                      <div className="flex flex-col">
                        <span className="text-lg font-semibold text-gray-900">
                          {assignment.subject}
                        </span>
                        <span className="text-gray-600 mt-1">
                          {assignment.task}
                        </span>
                        <span className="text-sm text-gray-500 mt-2 flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Due{" "}
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Student Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Student Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-40">
                  <BarChart className="h-32 w-32 text-gray-400" />
                </div>
                <p className="text-center mt-4">Average Score: 85%</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Submissions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Submission Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>
                  Arjun Patel - Data Structures Assignment - Submitted at 10:45
                  PM
                </li>
                <li>
                  Priya Sharma - Algorithms Project - Submitted 2 days past due
                </li>
                <li>Rahul Kumar - Computer Networks Lab - Submitted on time</li>
                <li>
                  Ananya Mehta - Database Systems Report - Submitted 1 hour
                  before deadline
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
