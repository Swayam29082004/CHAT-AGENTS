"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faPlay,
  faCloudUploadAlt,
  faHistory,
  faCog,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "App", icon: faTachometerAlt },
    { href: "/dashboard/playground", label: "Playground", icon: faPlay },
    { href: "/dashboard/deploy", label: "Deploy", icon: faCloudUploadAlt },
    { href: "/dashboard/history", label: "History", icon: faHistory },
    { href: "/dashboard/settings", label: "Settings", icon: faCog },
  ];

  return (
    <aside
      className={`h-screen bg-gray-800 text-white fixed top-0 left-0 transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Toggle button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <span className="text-xl font-bold">{isOpen ? "Dashboard" : " "}</span>
        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300">
          <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
        </button>
      </div>

      {/* Links */}
      <nav className="mt-6 space-y-2">
        {links.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
              pathname === href
                ? "bg-indigo-600 text-white"
                : "hover:bg-gray-700"
            }`}
          >
            <FontAwesomeIcon icon={icon} className="w-5 h-5" />
            {isOpen && <span>{label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
