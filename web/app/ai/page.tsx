import Chat from "@/components/chatbot/Chat";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-gray-100 dark:bg-gray-900">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <Chat />
      </main>
    </div>
  );
}
