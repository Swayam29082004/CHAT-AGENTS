"use client";

type Props = {
  apiKey: string;
  setApiKey: (val: string) => void;
  provider: string;
  setProvider: (val: string) => void;
  model: string;
  setModel: (val: string) => void;
};

export default function Step1APIModel({
  apiKey,
  setApiKey,
  provider,
  setProvider,
  model,
  setModel,
}: Props) {
  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Step 1: API & Model</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Enter API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
        />

        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select Provider</option>
          <option value="openai">OpenAI (GPT)</option>
          <option value="groq">Groq</option>
          <option value="anthropic">Anthropic</option>
        </select>

        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select Model</option>
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-3.5">GPT-3.5</option>
          <option value="mcp">MCP Model</option>
        </select>
      </div>
    </section>
  );
}
