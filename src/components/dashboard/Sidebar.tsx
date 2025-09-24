"use client";

import { useEffect, useState, Dispatch, SetStateAction } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faPlay,
  faCloudUploadAlt,
  faCog,
  faBars,
  faTimes,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed: { username?: string } = JSON.parse(storedUser);
        setUserName(parsed.username || "User");
      } catch {
        setUserName("User");
      }
    }
  }, []);

  const links = [
    { href: "/dashboard/app", label: "App", icon: faTachometerAlt },
    { href: "/dashboard/playground", label: "Playground", icon: faPlay },
    { href: "/dashboard/deploy", label: "Deploy", icon: faCloudUploadAlt },
    { href: "/dashboard/settings", label: "Settings", icon: faCog },
  ];

  return (
    <aside
      className={`flex flex-col justify-between h-screen bg-gray-800 text-white fixed top-0 left-0 transition-all duration-300 z-50 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Header + toggle */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <span className="text-xl font-bold">{isOpen ? "Dashboard" : ""}</span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-300 focus:outline-none"
          >
            <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
          </button>
        </div>

        {/* Navigation */}
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
      </div>

      {/* User section */}
      <div className="p-4 border-t border-gray-700 flex items-center gap-3 group cursor-pointer relative">
        <FontAwesomeIcon
          icon={faUserCircle}
          className="w-8 h-8 text-gray-400 group-hover:text-white transition"
        />
        {isOpen && <span className="font-medium">{userName}</span>}
        {!isOpen && (
          <span className="absolute left-20 bg-gray-900 text-white text-sm rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
            {userName}
          </span>
        )}
      </div>
    </aside>
  );
}
