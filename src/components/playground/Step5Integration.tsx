"use client";
import { useState } from 'react';

export default function Step5Integration() {
  // In a real app, you'd get this ID after the agent is saved
  const DUMMY_AGENT_ID = "b7e4a9f1-1234-5678-abcd-e5f6g7h8i9j0";
  const embedCode = `<script src="${process.env.NEXT_PUBLIC_APP_URL}/api/embed?agentId=${DUMMY_AGENT_ID}" async defer></script>`;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-2">Step 5: Integration</h2>
      <p className="text-gray-600 mb-4">
        Copy the embed code below to add your chat agent to any website.
      </p>
      <div className="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-sm relative">
        <pre><code>{embedCode}</code></pre>
        <button 
          onClick={handleCopy}
          className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded-md text-xs"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg">
        <h3 className="font-bold">How it works:</h3>
        <p className="text-sm mt-1">
          This script will automatically inject a chat bubble into the bottom-right corner of the page. When clicked, it will open an iframe containing your configured chat agent.
        </p>
      </div>
    </section>
  );
}