interface ChatbotRequest {
  text: string;
  params: {
    user_id: string;
  };
}

interface ChatbotResponse {
  response: {
    generated_text: string;
    params?: string;
  };
}

export async function sendMessage(
  message: string,
  userId: string,
): Promise<ChatbotResponse> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chatbot`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: message,
      params: {
        user_id: userId,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to connect to the chatbot server.");
  }

  return response.json();
}
