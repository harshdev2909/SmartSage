interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

const all_questions: Question[] = [
  {
    id: 1,
    text: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
  },
  {
    id: 2,
    text: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1,
  },
  {
    id: 3,
    text: "Who painted the Mona Lisa?",
    options: [
      "Vincent van Gogh",
      "Pablo Picasso",
      "Leonardo da Vinci",
      "Michelangelo",
    ],
    correctAnswer: 2,
  },
  {
    id: 4,
    text: "What is the largest mammal in the world?",
    options: ["Elephant", "Blue Whale", "Giraffe", "Orca"],
    correctAnswer: 1,
  },
  {
    id: 5,
    text: "What is the square root of 64?",
    options: ["6", "7", "8", "9"],
    correctAnswer: 2,
  },
  {
    id: 6,
    text: "Which element has the chemical symbol 'O'?",
    options: ["Gold", "Oxygen", "Silver", "Hydrogen"],
    correctAnswer: 1,
  },
  {
    id: 7,
    text: "Who wrote 'Romeo and Juliet'?",
    options: [
      "William Shakespeare",
      "Charles Dickens",
      "Mark Twain",
      "Jane Austen",
    ],
    correctAnswer: 0,
  },
  {
    id: 8,
    text: "What is the capital city of Japan?",
    options: ["Beijing", "Seoul", "Tokyo", "Bangkok"],
    correctAnswer: 2,
  },
  {
    id: 9,
    text: "What is the freezing point of water in Celsius?",
    options: ["0", "32", "-32", "100"],
    correctAnswer: 0,
  },
  {
    id: 10,
    text: "Which gas do plants absorb for photosynthesis?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Methane"],
    correctAnswer: 1,
  },
  {
    id: 11,
    text: "What is the smallest prime number?",
    options: ["0", "1", "2", "3"],
    correctAnswer: 2,
  },
  {
    id: 12,
    text: "Which continent is known as the 'Dark Continent'?",
    options: ["Asia", "Africa", "Europe", "South America"],
    correctAnswer: 1,
  },
  {
    id: 13,
    text: "What is the chemical formula of water?",
    options: ["H2O", "CO2", "NaCl", "O2"],
    correctAnswer: 0,
  },
  {
    id: 14,
    text: "What is the tallest mountain in the world?",
    options: ["K2", "Mount Everest", "Kangchenjunga", "Lhotse"],
    correctAnswer: 1,
  },
  {
    id: 15,
    text: "Who developed the theory of relativity?",
    options: [
      "Isaac Newton",
      "Albert Einstein",
      "Galileo Galilei",
      "Nikola Tesla",
    ],
    correctAnswer: 1,
  },
  {
    id: 16,
    text: "What is the largest organ in the human body?",
    options: ["Heart", "Liver", "Skin", "Brain"],
    correctAnswer: 2,
  },
  {
    id: 17,
    text: "What is the capital of Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
    correctAnswer: 2,
  },
  {
    id: 18,
    text: "Which planet is closest to the sun?",
    options: ["Venus", "Mars", "Earth", "Mercury"],
    correctAnswer: 3,
  },
  {
    id: 19,
    text: "What is the currency of the United Kingdom?",
    options: ["Dollar", "Euro", "Pound Sterling", "Yen"],
    correctAnswer: 2,
  },
  {
    id: 20,
    text: "Who discovered penicillin?",
    options: [
      "Marie Curie",
      "Alexander Fleming",
      "Louis Pasteur",
      "Joseph Lister",
    ],
    correctAnswer: 1,
  },
  {
    id: 21,
    text: "What is the main ingredient in sushi?",
    options: ["Bread", "Rice", "Noodles", "Potatoes"],
    correctAnswer: 1,
  },
  {
    id: 22,
    text: "What is the most abundant gas in Earth's atmosphere?",
    options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
    correctAnswer: 1,
  },
  {
    id: 23,
    text: "What is the hardest natural substance on Earth?",
    options: ["Gold", "Iron", "Diamond", "Platinum"],
    correctAnswer: 2,
  },
  {
    id: 24,
    text: "What is the longest river in the world?",
    options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
    correctAnswer: 1,
  },
  {
    id: 25,
    text: "Who invented the telephone?",
    options: [
      "Thomas Edison",
      "Alexander Graham Bell",
      "Nikola Tesla",
      "Guglielmo Marconi",
    ],
    correctAnswer: 1,
  },
  {
    id: 26,
    text: "What is the main language spoken in Brazil?",
    options: ["Spanish", "Portuguese", "French", "English"],
    correctAnswer: 1,
  },
];

export default all_questions;
