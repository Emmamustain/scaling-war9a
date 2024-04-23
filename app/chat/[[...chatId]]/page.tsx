"use client";

import { useState } from "react";

export default function Chatgpt() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  async function handleSubmit() {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer process.env.NEXT_PUBLIC_OPENAI_API_KEY`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ content: input, role: "user" }],
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch response from OpenAI API");
    }
    // Read the response body as text
    const responseBodyText = await response.text();

    // Parse the response body text as JSON
    const responseData = JSON.parse(responseBodyText);
    console.log(
      "Response from OpenAI:",
      responseData.choices[0].message.content,
    );
    setResponse(
      (curr) => curr + "\n\n" + responseData.choices[0].message.content,
    );
  }

  return (
    <div className="h-full min-h-screen w-full bg-gray-800">
      <title>Next JS ChatGPT Started</title>

      <h1>Welcome to ChatId page</h1>

      <input
        type="text"
        onChange={(e) => setInput(e.target.value)}
        value={input}
        className="rounded border-0 border-white bg-gray-600 p-4 text-white outline-none"
      />
      <h1 className="text-3xl text-white">RESPONSE:</h1>
      <pre className="text-white">{response}</pre>
      <button
        onClick={() => handleSubmit()}
        className="rounded bg-blue-500 p-4"
      >
        Submit
      </button>
    </div>
  );
}
