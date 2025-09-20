"use client";

import { useState, FormEvent } from "react";

export default function Step3ScrapingRAG() {
  const [url, setUrl] = useState("https://books.toscrape.com/");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ message: string; summary: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      // 1. Get the logged-in user's ID from local storage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.id) {
        throw new Error("You must be logged in to scrape content.");
      }

      // 2. Call the backend API with the URL and userId
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, userId: user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process the website.");
      }

      setResult({ message: data.message, summary: data.summary });

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-2">
        Step 3: Scrape Website & Create Knowledge Base
      </h2>
      <p className="text-gray-600 mb-4">
        Enter a URL to scrape its content. The text will be processed, converted into vector embeddings, and stored in your knowledge base (Pinecone).
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="form-input flex-1"
          required
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Process URL"}
        </button>
      </form>

      {/* --- Display API Call Status --- */}
      {error && <div className="mt-4 alert-error">❌ {error}</div>}
      
      {result && (
        <div className="mt-4 p-4 border rounded-lg bg-green-50 text-green-800">
          <h3 className="font-bold mb-2">✅ Success!</h3>
          <p className="text-sm">{result.message}</p>
          <div className="mt-2 p-2 border-t border-green-200 text-xs text-gray-600">
            <p className="font-semibold">Content Preview:</p>
            <p className="mt-1 italic">{result.summary}</p>
          </div>
        </div>
      )}
    </section>
  );
}