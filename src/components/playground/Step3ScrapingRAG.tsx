"use client";
import { useState, FormEvent, useEffect, useRef } from "react";

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
    <div
      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-linear"
      style={{ width: `${progress}%` }}
    ></div>
  </div>
);

// ✅ THE FIX: Component now accepts agentId as a prop
export default function Step3ScrapingRAG({ agentId }: { agentId: string | null }) {
  const [url, setUrl] = useState<string>("");
  const [scrapedUrl, setScrapedUrl] = useState<string>("");
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [scrapeResult, setScrapeResult] = useState<{ type: 'success' | 'error'; message: string; time?: number } | null>(null);
  const [scrapeProgress, setScrapeProgress] = useState<number>(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // ... (other state variables remain the same)
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const startProgressSimulator = (setter: React.Dispatch<React.SetStateAction<number>>) => {
    // ... (this helper function remains the same)
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setter(0);
    progressIntervalRef.current = setInterval(() => {
      setter(prev => {
        if (prev >= 95) {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          return prev;
        }
        return prev + Math.random() * 5;
      });
    }, 200);
  };

  const handleScrapeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // ✅ Check for agentId before proceeding
    if (!agentId) {
      setScrapeResult({ type: 'error', message: 'Could not find a valid Agent ID. Please go back and save the agent first.' });
      return;
    }
    const userData = localStorage.getItem('user');
    if (!userData) {
      setScrapeResult({ type: 'error', message: '❌ You must be logged in to scrape content.' });
      return;
    }
    const user = JSON.parse(userData);

    setIsScraping(true);
    setScrapeResult(null);
    setScrapedUrl("");
    startProgressSimulator(setScrapeProgress);
    const startTime = Date.now();

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ THE FIX: Include the agentId in the request body
        body: JSON.stringify({ url, userId: user.id, agentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process the website.");
      
      const timeTaken = (Date.now() - startTime) / 1000;
      setScrapeResult({ type: 'success', message: data.message, time: parseFloat(timeTaken.toFixed(2)) });
      setScrapedUrl(url);
      setUrl("");
    } catch (err: any) {
      setScrapeResult({ type: 'error', message: err.message || "Something went wrong." });
    } finally {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      setScrapeProgress(100);
      setTimeout(() => setIsScraping(false), 1000);
    }
  };

  const handleSummarizeClick = async () => {
      // ... (this function remains the same)
      if (!scrapedUrl) return;
      setIsSummarizing(true);
      setSummary(null);
      setSummaryError(null);
      try {
        const res = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: scrapedUrl }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to generate summary.");
        setSummary(data.summary);
      } catch (err: any) {
        setSummaryError(err.message || "An unexpected error occurred.");
      } finally {
        setIsSummarizing(false);
      }
  };

  if (!agentId) {
    return (
        <section className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-2 text-yellow-600">Please Save Your Agent First</h2>
            <p className="text-gray-600">Go back to the previous step to save your agent's configuration. This will generate an Agent ID needed to add knowledge.</p>
        </section>
    );
  }

  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-2">Step 3: Add Knowledge to Your Agent</h2>
      <p className="text-gray-600 mb-4">
        Scrape websites to create a knowledge base. Your agent will use this data to answer questions.
      </p>

      <form onSubmit={handleScrapeSubmit} className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="url"
          placeholder="https://example.com/faq"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="form-input flex-1"
          required
          disabled={isScraping}
        />
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={isScraping}>
          {isScraping ? "Scraping..." : "Scrape & Embed"}
        </button>
      </form>
      
      {/* ... (rest of the JSX for displaying results remains the same) ... */}
      {isScraping && (
        <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm font-semibold text-blue-800">Extracting content, please wait...</p>
            <ProgressBar progress={scrapeProgress} />
            <p className="text-xs text-blue-700 text-right">{Math.round(scrapeProgress)}% Complete</p>
        </div>
      )}
      {scrapeResult && !isScraping && (
        <div className={`mt-4 p-4 rounded-lg ${scrapeResult.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <h3 className="font-bold">{scrapeResult.type === 'success' ? `✅ Scrape Successful! (Completed in ${scrapeResult.time}s)` : '❌ Error'}</h3>
          <p className="text-sm mt-1">{scrapeResult.message}</p>
          
          {scrapeResult.type === 'success' && (
             <div className="mt-3 pt-3 border-t border-green-200">
                <button
                    onClick={handleSummarizeClick}
                    disabled={isSummarizing}
                    className="bg-green-600 text-white text-sm font-semibold py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                    {isSummarizing ? 'Generating...' : 'Generate AI Summary'}
                </button>
             </div>
          )}
        </div>
      )}
      {summaryError && (
          <div className="mt-4 p-4 rounded-lg bg-red-50 border-red-200 text-red-800">
              <h3 className="font-bold">❌ Summary Failed</h3>
              <p className="text-sm mt-1">{summaryError}</p>
          </div>
      )}
      {summary && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Generated Summary</h3>
          <div className="bg-gray-100 p-4 rounded-md border border-gray-200">
            <p className="text-gray-700 whitespace-pre-wrap text-sm">{summary}</p>
          </div>
        </div>
      )}
    </section>
  );
}
