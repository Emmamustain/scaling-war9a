const quotes = [
  "The two most powerful warriors are patience and time. - Leo Tolstoy",
  "Patience is bitter, but its fruit is sweet. - Aristotle",
  "Patience is not passive, on the contrary, it is concentrated strength. - Bruce Lee",
  "One minute of patience, ten years of peace. - Greek Proverb",
  "Have patience. All things are difficult before they become easy. - Saadi",
  "The trees that are slow to grow bear the best fruit. - Molière",
  "Patience is a flower that does not bloom all at once. - Unknown",
  "Waiting is a sign of true love and patience. - Unknown",
  "Be patient. Everything is coming together. - Unknown",
  "Patience is not the ability to wait, but how you act while you're waiting. - Unknown",
  "Patience is the key to paradise. - Turkish Proverb",
  "Slow progress is better than no progress. - Unknown",
  "Patience is the art of hoping. - Luc de Clapiers",
  "Patience makes the heart grow stronger. - Unknown",
  "In patience, there is peace. - Unknown",
  "Wait for it... - Unknown",
  "The journey of a thousand miles begins with a single step. - Lao Tzu",
  "Time and patience change the mulberry leaf to silk. - Chinese Proverb",
  "To lose patience is to lose the battle. - Mahatma Gandhi",
  "Be patient. Everything is difficult before it is easy. - Unknown",
  "Patience is a conquering virtue. - Geoffrey Chaucer",
  "With time and patience, the mulberry leaf becomes a silk gown. - Ancient Chinese Proverb",
  "Patience and fortitude conquer all things. - Ralph Waldo Emerson",
  "It does not matter how slowly you go as long as you do not stop. - Confucius",
  "Patience is a virtue that leads to beautiful outcomes. (Sahih al-Bukhari)",
  "The strength of a person lies in their ability to remain patient during challenges. (Sahih Muslim)",
  "Patience in adversity is a sign of faith. (Sunan Abu Dawood)",
  "True patience is shown when faced with difficulties, without losing hope. (Sunan an-Nasa'i)",
  "Patience is a source of inner peace and strength. (Sunan at-Tirmidhi)",
  "Through patience, one can find blessings even in hardships. (Sunan Ibn Majah)",
];

export default function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex].split(".")[0];
  const author = quotes[randomIndex].split(".")[1];
  return { quote: quote, author: author };
}
