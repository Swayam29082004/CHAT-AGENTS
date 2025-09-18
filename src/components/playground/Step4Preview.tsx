"use client";

type Props = {
  theme: string;
  color: string;
  agentName: string;
};

export default function Step4Preview({ theme, color, agentName }: Props) {
  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Step 4: Preview</h2>
      <div
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: theme === "dark" ? "#1f2937" : "#f9fafb",
          color,
        }}
      >
        <p className="text-sm">👋 Hello! I’m your chat agent preview.</p>
        <p className="text-xs text-gray-500">Theme: {theme}</p>
        <p className="text-xs text-gray-500">Agent: {agentName}</p>
      </div>
    </section>
  );
}
