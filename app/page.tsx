import React from 'react'
import Link from 'next/link'
import Navbar from './components/ui/Navbar'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
        <section className="text-center">
          <h1 className="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Site inspection, made simple
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
            Upload a floor plan, tap issues on the blueprint, and attach photos. Everything stays tied to the correct site.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-6 py-3 font-semibold text-white shadow-sm "
            >
              Login
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
