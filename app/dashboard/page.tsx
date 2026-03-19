"use client"

import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function Dashboard() {
    type SiteSummary = {
        id: string;
        name?: string | null;
        file_name?: string | null;
    }

    const [sites, setSites] = useState<SiteSummary[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSites = async () => {
            const { data } = await supabase
                .from('sites')
                .select('*')
                .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
                .order('created_at', { ascending: false }) // Newest sites at the top for easy access

            if (data) setSites(data)
            setLoading(false)
            console.log(data)
        }

        fetchSites()
    }, [])

    return (
        // Added 'safe-area' padding for mobile notches/bottom bars
        <div className="min-h-screen bg-gray-50 px-4 py-6 pb-20 sm:p-8">
            <div className="mx-auto max-w-md sm:max-w-4xl">

                {/* Header Section - Centered for mobile */}
                <div className="mb-8 text-center sm:text-left border-b border-gray-200 pb-4">
                    <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                        Job Sites
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Select a site to start annotating</p>
                </div>

                {/* Existing Sites List/Grid */}
                {loading ? (
                    <div className="flex justify-center pt-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    </div>
                ) : (
                    // On mobile: 1 column (List style). On desktop: 3 columns (Grid style)
                    <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
                        {sites.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-500">No sites available.</p>
                            </div>
                        ) : (
                            sites.map((site) => (
                                <Link
                                    href={`/annotate/${site.id}`}
                                    key={site.id}
                                    // Increased padding (p-5) and active:scale for a "button" feel on touch
                                    className="group relative block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all active:scale-[0.98] hover:border-black sm:hover:shadow-md"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900 group-hover:text-black">
                                                {site.name || "Unnamed Site"}
                                            </h2>
                                            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-400">
                                                {site.file_name == null ? 'missing blueprint' : 'Blueprint uploaded'}
                                            </p>
                                        </div>
                                        {/* Mobile-friendly chevron icon */}
                                        <div className="text-gray-300 group-hover:text-black">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}