"use client";

import { useState, FormEvent } from "react";

export default function URLSummarizer() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSummary("");

    if (!url || !url.startsWith("http")) {
      setError("Please enter a valid URL (e.g., https://example.com)");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data: { success?: boolean; summary?: string; error?: string } =
        await response.json();

      if (response.ok && data.success && data.summary) {
        setSummary(data.summary);
      } else {
        setError(
          data.error || "Failed to get summary. Please check the URL and try again."
        );
      }
    } catch {
      setError("A network error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            name="url"
            id="url"
            className="form-input flex-grow"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full sm:w-auto"
          >
            {isLoading ? "Summarizing..." : "Get Summary"}
          </button>
        </div>
      </form>

      {error && <div className="mt-4 alert-error">{error}</div>}

      {summary && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Summary</h3>
          <div className="bg-white p-4 rounded-md border border-gray-200 max-h-96 overflow-y-auto">
            <p className="text-gray-700 whitespace-pre-wrap font-mono text-sm">
              {summary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
