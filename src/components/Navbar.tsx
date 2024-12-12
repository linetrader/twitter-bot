"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const path = usePathname();

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <ul className="flex justify-center space-x-6 p-4">
        <li>
          <Link
            href="/"
            className={`px-4 py-2 rounded-md font-medium transition ${
              path === "/"
                ? "bg-white text-blue-600"
                : "hover:bg-blue-700 hover:text-gray-100"
            }`}
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            href="/set-sheet-comment"
            className={`px-4 py-2 rounded-md font-medium transition ${
              path === "/set-sheet-comment"
                ? "bg-white text-blue-600"
                : "hover:bg-blue-700 hover:text-gray-100"
            }`}
          >
            comment
          </Link>
        </li>
        <li>
          <Link
            href="/set-sheet-user"
            className={`px-4 py-2 rounded-md font-medium transition ${
              path === "/set-sheet-user"
                ? "bg-white text-blue-600"
                : "hover:bg-blue-700 hover:text-gray-100"
            }`}
          >
            user
          </Link>
        </li>
      </ul>
    </nav>
  );
}
