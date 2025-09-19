import URLSummarizer from '@/components/dashboard/URLSummarizer';

export default function SummarizerPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Website Summarizer</h1>
        <p className="text-gray-600 mb-8">
          Enter a URL to scrape its content and generate a brief summary.
        </p>
        <URLSummarizer />
      </div>
    </div>
  );
}