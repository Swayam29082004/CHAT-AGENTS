// src/components/dashboard/Sidebar.tsx
"use client";

import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-800 text-white fixed left-0 top-0 p-6">
      <h2 className="text-2xl font-bold mb-8">Dashboard</h2>
      <nav className="space-y-4">
        <Link href="/dashboard" className="block hover:text-indigo-400">App</Link>
        <Link href="/dashboard/playground" className="block hover:text-indigo-400">Playground</Link>
        <Link href="/dashboard/deploy" className="block hover:text-indigo-400">Deploy</Link>
        <Link href="/dashboard/history" className="block hover:text-indigo-400">History</Link>
        <Link href="/dashboard/settings" className="block hover:text-indigo-400">Settings</Link>
      </nav>
    </aside>
  );
}
