"use client";

// This component is now much simpler since we are using text inputs instead of dropdowns.

type Props = {
  apiKey: string;
  setApiKey: (val: string) => void;
  provider: string;
  setProvider: (val: string) => void;
  modelName: string;
  setModelName: (val: string) => void;
};

export default function Step1APIModel({
  apiKey,
  setApiKey,
  provider,
  setProvider,
  modelName,
  setModelName,
}: Props) {
  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Step 1: API & Model</h2>
      <div className="space-y-4">
        {/* Input for API Key */}
        <input
          type="text"
          placeholder="Enter API Key (Optional)"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="form-input"
        />

        {/* Text input for Provider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
          <input
            type="text"
            placeholder="e.g., OpenAI"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="form-input bg-gray-100" // Slightly gray to show it has a default
          />
        </div>

        {/* Text input for Model */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model Name</label>
            <input
                type="text"
                placeholder="e.g., gpt-4o-mini"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="form-input bg-gray-100" // Slightly gray to show it has a default
            />
        </div>
      </div>
    </section>
  );
}