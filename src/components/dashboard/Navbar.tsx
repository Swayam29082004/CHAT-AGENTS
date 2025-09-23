"use client";

import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("user");
    // ✅ Use a route, not a file path
    router.push("/login"); // or router.push("/") for homepage
  };

  return (
    <header className="h-16 bg-white shadow flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Logo + Title */}
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={faComments} className="text-indigo-600 w-6 h-6" />
        <h1 className="text-xl font-semibold"> Contenstack Chat Agent </h1>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
      >
        <FontAwesomeIcon icon={faRightFromBracket} />
        Logout
      </button>
    </header>
  );
}
