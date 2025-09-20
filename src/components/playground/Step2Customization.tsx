"use client";

import { HexColorPicker } from "react-colorful";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

type Props = {
  agentName: string;
  setAgentName: (val: string) => void;
  avatar: string;
  setAvatar: (val: string) => void;
  color: string;
  setColor: (val: string) => void;
  welcomeMessage: string;
  setWelcomeMessage: (val: string) => void;
  placeholderText: string;
  setPlaceholderText: (val: string) => void;
};

export default function Step2Customization({
  agentName,
  setAgentName,
  avatar,
  setAvatar,
  color,
  setColor,
  welcomeMessage,
  setWelcomeMessage,
  placeholderText,
  setPlaceholderText,
}: Props) {
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
        setAvatar(data.url);
      } else {
        alert("Upload failed ❌");
      }
    };
    reader.readAsDataURL(file);
  };

  const isDefaultAvatar = avatar === "/PHOTO_AGENT.jpg";

  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">
        Step 2: Customize Appearance & Behavior
      </h2>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Agent Name</label>
          <input
            type="text"
            placeholder="Helpful Assistant"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="flex-1 flex flex-col items-center">
          <label className="block text-sm font-medium mb-2">Agent Avatar</label>
          <div
            onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleAvatarUpload(e.dataTransfer.files[0]); }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById("avatarInput")?.click()}
            className="w-32 h-32 border-2 border-dashed rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 transition text-gray-400 hover:text-gray-600"
          >
            {isDefaultAvatar ? (
              <div className="text-center">
                <FontAwesomeIcon icon={faUpload} className="h-6 w-6 mx-auto" />
                <p className="text-xs mt-1">Click to Upload</p>
              </div>
            ) : (
              <img src={avatar} alt="Avatar preview" className="w-28 h-28 rounded-full object-cover border shadow-sm" />
            )}
            <input id="avatarInput" type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleAvatarUpload(e.target.files[0]); }} />
          </div>
          {/* ✅ YOUR REQUESTED TEXT ADDED HERE */}
          <p className="text-xs text-gray-500 mt-2">
            Drag and drop the image.
          </p>
        </div>
        
        <div className="flex-1 flex flex-col items-center">
          <label className="block text-sm font-medium mb-2">Agent Theme Color</label>
          <HexColorPicker color={color} onChange={setColor} />
          <p className="text-sm mt-2 p-1 rounded font-medium" style={{ backgroundColor: color, color: '#fff' }}>
            Selected: {color}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-6">
        <div>
          <label className="block text-sm font-medium mb-2">Initial Welcome Message</label>
          <textarea
            placeholder="Hello! How can I help you today?"
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            className="form-input min-h-[80px]"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Input Placeholder Text</label>
           <textarea
            placeholder="Ask a question..."
            value={placeholderText}
            onChange={(e) => setPlaceholderText(e.target.value)}
            className="form-input min-h-[80px]"
            rows={3}
          />
        </div>
      </div>
    </section>
  );
}