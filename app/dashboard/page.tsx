"use client"

import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function Dashboard() {
    const [sites, setSites] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // 1. Fetch the sites when the page loads
        const fetchSites = async () => {
            const { data, error } = await supabase
                .from('sites')
                .select('*')

            if (data) setSites(data)
            setLoading(false)
        }

        fetchSites()
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-4xl">

                {/* Header Section */}
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">Your Job Sites</h1>

                    {/* The "Upload Site" branch of your flowchart */}
                    <button className="rounded-lg bg-black px-4 py-2 font-medium text-white hover:bg-gray-800">
                        + Upload New Blueprint
                    </button>
                </div>

                {/* Existing Sites Grid */}
                {loading ? (
                    <p>Loading sites...</p>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {sites.length === 0 ? (
                            <p className="text-gray-500">No sites found. Upload a blueprint to start!</p>
                        ) : (
                            sites.map((site) => (
                                // The "Annotate Page" branch of your flowchart
                                <Link
                                    href={`/annotate/${site.id}`}
                                    key={site.id}
                                    className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:border-black hover:shadow-md transition"
                                >
                                    <h2 className="text-xl font-semibold text-gray-900">{site.name}</h2>
                                    <p className="mt-2 text-sm text-gray-500">Click to view annotations</p>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}