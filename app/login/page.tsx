"use client"

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
// Import Next.js router so we can send them to the next page after login
import { useRouter } from 'next/navigation'; 

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter(); // Initialize router

    // 1. Make the handler itself async
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // 2. Pass your actual state variables into Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        console.log(data)
        // 3. Check the results
        if (error) {
            console.error("Login failed:", error.message);
            alert(error.message); // Show the user what went wrong
        } else {
            console.log("Login successful! Here is the data:", data);
            // 4. Send them to the dashboard/site page!
            router.push('/demo'); 
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
                <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
                    SiteAnnotator
                </h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="mt-2 rounded-lg bg-black py-2 font-medium text-white hover:bg-gray-800">
                        Login
                    </button>
                </form>
            </div>
        </div>
    )
}