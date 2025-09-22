"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCopy, faCheck } from "@fortawesome/free-solid-svg-icons";
import { Agent } from "@/lib/services/agentService";

interface EmbedCodeModalProps {
  agent: Agent;
  onClose: () => void;
}

export function EmbedCodeModal({ agent, onClose }: EmbedCodeModalProps) {
  const [copied, setCopied] = useState(false);

  const API_URL = `${window.location.origin}/api/rag-query`;

  const codeSnippet = `
import { ChatWidget } from '@yourorg/chat-sdk';
import '@yourorg/chat-sdk/dist/style.css';

function MyComponent() {
  return (
    <div style={{ height: '600px', width: '400px' }}>
      <ChatWidget
        agentId="${agent._id}"
        apiUrl="${API_URL}"
        agentName="${agent.name}"
      />
    </div>
  );
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
        <div className="p-6 flex justify-between items-center border-b">
          <h2 className="text-2xl font-bold text-gray-800">Embed "{agent.name}"</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-lg text-gray-700">1. Install SDK via NPM</h3>
            <p className="text-gray-600 text-sm mb-2">After publishing, install the package in your project.</p>
            <pre className="bg-gray-100 p-3 rounded-md text-sm">
              <code>npm install @yourorg/chat-sdk</code>
            </pre>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-700">2. Add Widget to Your App</h3>
            <div className="relative">
              <pre className="bg-gray-800 text-white p-4 rounded-md text-sm overflow-x-auto">
                <code>{codeSnippet.trim()}</code>
              </pre>
              <button onClick={handleCopy} className="absolute top-3 right-3 bg-gray-600 hover:bg-gray-500 text-white text-xs font-bold py-1 px-3 rounded-md">
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="mr-2" />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
