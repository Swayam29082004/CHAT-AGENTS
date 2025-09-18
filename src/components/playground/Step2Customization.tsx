"use client";

import { HexColorPicker } from "react-colorful";

type Props = {
  agentName: string;
  setAgentName: (val: string) => void;
  avatar: string;
  setAvatar: (val: string) => void;
  color: string;
  setColor: (val: string) => void;
};

export default function Step2Customization({
  agentName,
  setAgentName,
  avatar,
  setAvatar,
  color,
  setColor,
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
        setAvatar(data.url); // Cloudinary URL
      } else {
        alert("Upload failed ❌");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="bg-white shadow rounded-lg p-6">
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
              src={avatar}
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
            Drag & Drop or click to upload.
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
  );
}
