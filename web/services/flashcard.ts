const API_BASE_URL = "http://localhost:5000";

interface Flashcard {
  question: string;
  answer: string;
  topic: string;
}

export const generateFlashcards = async (file: File): Promise<Flashcard[]> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", "default_user");

  try {
    console.log("Sending file to API:", file.name);
    const response = await fetch(`${API_BASE_URL}/flashcards`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Raw API response:", data);

    if (!data.flashcards || !Array.isArray(data.flashcards)) {
      console.error("Invalid response structure:", data);
      throw new Error("Invalid response format from API");
    }

    // Validate each flashcard
    const validFlashcards = data.flashcards.filter(
      (card: any) =>
        card.question &&
        card.answer &&
        typeof card.question === "string" &&
        typeof card.answer === "string",
    );

    if (validFlashcards.length === 0) {
      throw new Error("No valid flashcards in response");
    }

    console.log("Processed flashcards:", validFlashcards);
    return validFlashcards;
  } catch (error) {
    console.error("Error in generateFlashcards:", error);
    throw error;
  }
};
