"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-gray-300 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Brand */}
        <Link href="/" className="text-xl font-bold text-gray-900">
          SiteAnnotator
        </Link>

        {/* Right side buttons */}
        <div className="flex items-center gap-4">

          <Link
            href="/demo"
            className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white active:bg-blue-800 px-4 py-2 "
          >
            Demo
          </Link>


          <Link
            href="https://forms.gle/9kiJELpFALVUWgQp8"
            className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-black-700 font-medium"
          >
            Signup
          </Link>
        </div>

      </div>
    </nav>
  );
}