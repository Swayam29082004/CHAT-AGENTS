// src/components/dashboard/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "App" },
    { href: "/dashboard/playground", label: "Playground" },
    { href: "/dashboard/deploy", label: "Deploy" },
    { href: "/dashboard/history", label: "History" },
    { href: "/dashboard/settings", label: "Settings" },
  ];

  return (
    <aside className="w-64 h-screen bg-gray-800 text-white fixed left-0 top-0 p-6">
      <h2 className="text-2xl font-bold mb-8">Dashboard</h2>
      <nav className="space-y-4">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`block px-2 py-1 rounded transition-colors ${
              pathname === href
                ? "bg-indigo-600 text-white"
                : "hover:text-indigo-400"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
