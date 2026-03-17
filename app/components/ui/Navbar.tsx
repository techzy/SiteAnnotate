"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        {/* Brand */}
        <Link href="/" className="text-xl font-bold text-gray-900">
          SiteAnnotator
        </Link>

        {/* Right side buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-gray-700 hover:text-gray-900 font-medium"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800 font-medium"
          >
            Signup
          </Link>
        </div>

      </div>
    </nav>
  );
}