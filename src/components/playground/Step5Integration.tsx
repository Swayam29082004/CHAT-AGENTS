"use client";

export default function Step5Integration() {
  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Step 5: Integration</h2>
      <p className="text-gray-600">
        Copy the embed code below to add your chat agent to any website:
      </p>
      <pre className="bg-gray-100 p-4 mt-3 rounded text-sm overflow-x-auto">
        {`<script src="https://your-chat-agent.js"></script>`}
      </pre>
    </section>
  );
}
