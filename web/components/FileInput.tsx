import { ChangeEvent } from "react";

interface FileInputProps {
  onFileSelect: (file: File) => void;
}

export default function FileInput({ onFileSelect }: FileInputProps) {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <label className="group relative cursor-pointer">
        <div className="flex flex-col items-center gap-2">
          <div className="relative rounded-lg bg-white px-8 py-4 shadow-md transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center gap-3">
              <svg
                className="h-6 w-6 text-blue-500 transition-transform duration-300 group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="text-lg font-medium text-gray-700">
                Choose Flashcard File
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Upload a CSV or Text file
            </div>
          </div>
        </div>
        <input
          type="file"
          className="hidden"
          accept=".csv,.txt"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}
