"use client";

import { useState } from "react";

export default function Playground() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [theme, setTheme] = useState("light");
  const [avatar, setAvatar] = useState("default");
  const [color, setColor] = useState("#4f46e5");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Chat Agent Playground</h1>

      {/* Step 1: API Key + Model */}
      <section className="bg-white shadow rounded-lg p-6 mb-6">
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

      {/* Step 2: Customization */}
      <section className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Step 2: Customize Theme, Avatar & Colors
        </h2>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Theme */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          {/* Avatar */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Avatar</label>
            <select
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
            >
              <option value="default">Default</option>
              <option value="robot">🤖 Robot</option>
              <option value="human">👤 Human</option>
              <option value="cat">🐱 Cat</option>
            </select>
          </div>

          {/* Color */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Accent Color</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-16 h-10 border rounded"
            />
          </div>
        </div>
      </section>

      {/* Step 3: MCP & RAG */}
      <section className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Step 3: Extend with Website Scraping & RAG
        </h2>
        <p className="text-gray-600">
          The chat agent will scrape content and use MCP + RAG (Retrieval-Augmented
          Generation) to provide extended answers.
        </p>
      </section>

      {/* Step 4: Preview */}
      <section className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Step 4: Preview</h2>
        <div
          className={`p-4 rounded-lg border`}
          style={{ backgroundColor: theme === "dark" ? "#1f2937" : "#f9fafb", color }}
        >
          <p className="text-sm">👋 Hello! I’m your chat agent preview.</p>
          <p className="text-xs text-gray-500">Theme: {theme}</p>
          <p className="text-xs text-gray-500">Avatar: {avatar}</p>
        </div>
      </section>

      {/* Step 5: Embed */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Step 5: Integration</h2>
        <p className="text-gray-600">
          Copy the embed code below to add your chat agent to any website:
        </p>
        <pre className="bg-gray-100 p-4 mt-3 rounded text-sm overflow-x-auto">
{`<script src="https://your-chat-agent.js"></script>`}
        </pre>
      </section>
    </div>
  );
}
