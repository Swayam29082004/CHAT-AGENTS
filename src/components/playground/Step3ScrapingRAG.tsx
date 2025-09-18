"use client";

import { useState } from "react";

export default function Step3ScrapingRAG() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      alert("Please enter a valid URL");
      return;
    }

    setLoading(true);
    setData(null);
    setError(null);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch scraped data");
      }

      const result = await res.json();
      setData(result.content); // assuming backend returns { content: "...scraped text..." }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">
        Step 3: Extend with Website Scraping & RAG
      </h2>
      <p className="text-gray-600 mb-4">
        The chat agent will scrape content and use MCP + RAG (Retrieval-Augmented
        Generation) to provide extended answers.
      </p>

      {/* URL Input + Submit */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="url"
          placeholder="Enter website URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          disabled={loading}
        >
          {loading ? "Loading..." : "Submit"}
        </button>
      </form>

      {/* Display states */}
      {loading && <p className="text-blue-600">⏳ Scraping in progress...</p>}
      {error && <p className="text-red-600">❌ {error}</p>}
      {data && (
        <div className="mt-4 p-3 border rounded-lg bg-gray-50 text-gray-800 max-h-64 overflow-y-auto">
          <h3 className="font-semibold mb-2">Scraped Content:</h3>
          <p>{data}</p>
        </div>
      )}
    </section>
  );
}
