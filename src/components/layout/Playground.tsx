/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { HexColorPicker } from "react-colorful";

export default function Playground() {
  const defaultAvatar =
    "E:\Coding\MERN_Project\CHAT-AGENTS\public\PHOTO_AGENT.jpg";

  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [theme, setTheme] = useState("light");
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [color, setColor] = useState("#4f46e5");
  const [agentName, setAgentName] = useState("");

  // Save agent to DB
  const handleSave = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          provider,
          modelName: model,
          apiKey,
          theme,
          avatar: avatar || defaultAvatar,
          color,
          agentName,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Agent saved securely!");
      } else {
        alert(data.error || "❌ Failed to save agent");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving agent");
    }
  };

  // Handle Avatar Upload (Drag + Drop + Input)
  const handleAvatarUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64 }),
      });

      const data = await res.json();
      if (data.success) {
        setAvatar(data.url); // Cloudinary URL
      } else {
        alert("Upload failed ❌");
      }
    };
    reader.readAsDataURL(file);
  };

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

          <button
            onClick={handleSave}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Save Agent
          </button>
        </div>
      </section>

      {/* Step 2: Customization */}
      <section className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Step 2: Customize Theme, Avatar, Name & Colors
        </h2>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Agent Name */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Agent Name</label>
            <input
              type="text"
              placeholder="Enter agent name"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Avatar Upload */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Avatar</label>
            <div
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleAvatarUpload(file);
              }}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById("avatarInput")?.click()}
              className="w-32 h-32 border-2 border-dashed rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 transition"
            >
              <img
                src={avatar || defaultAvatar}
                alt="Avatar preview"
                className="w-28 h-28 rounded-full object-cover border shadow-sm"
              />
              <input
                id="avatarInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAvatarUpload(file);
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Drag & Drop or click to upload. Default avatar from Cloudinary.
            </p>
          </div>

          {/* Theme Color Picker */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Theme Color</label>
            <HexColorPicker color={color} onChange={setColor} />
            <p className="text-sm mt-2">
              Selected: <span style={{ color }}>{color}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Step 3: MCP & RAG */}
      <section className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Step 3: Extend with Website Scraping & RAG
        </h2>
        <p className="text-gray-600">
          The chat agent will scrape content and use MCP + RAG
          (Retrieval-Augmented Generation) to provide extended answers.
        </p>
      </section>

      {/* Step 4: Preview */}
      <section className="bg-white shadow rounded-lg p-6 mb-6">
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
