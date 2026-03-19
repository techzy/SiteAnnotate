import React from 'react'
import Link from 'next/link'
import Navbar from './components/ui/Navbar'

export default function Home() {
  return (
    <>
      <Navbar></Navbar>
      <p>[] Navbar with a type logo and a Login or sign up button</p>
      <p>[] Content with gif showing how the app works - I&apos;ll do this last</p>

      <Link href="/demo">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md" type="button">Demo</button>
      </Link>
    </>
  )
}
