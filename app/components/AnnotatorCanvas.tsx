"use client";

import React, { useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Props {
    siteId: string;
    imageUrl: string;
}

export default function AnnotatorCanvas({ siteId, imageUrl }: Props) {
    const imgRef = useRef<HTMLImageElement>(null);
    const [isAdding, setIsAdding] = useState(false);

    const handleImageClick = async (e: React.MouseEvent) => {
        if (!imgRef.current) return;

        // 1. Get the bounding box of the image
        const rect = imgRef.current.getBoundingClientRect();

        // 2. Calculate the click position relative to the image
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 3. Convert to Percentages (This ensures the dot stays put on all screens)
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;

        // 4. For MVP: Prompt for a message (We can add a fancy Modal later)
        const message = prompt("What is the issue here?");
        if (!message) return;

        // 5. Save to Supabase
        const { error } = await supabase.from('issues').insert({
            site_id: siteId,
            x_coords: xPercent,
            y_coords: yPercent,
            message: message,
            status: 'open' // Default to Red (Open)
        });

        if (error) alert("Error saving point: " + error.message);
        else window.location.reload(); // Refresh to show the new dot
    };

    return (
        <div className="relative inline-block w-full h-full cursor-crosshair">
            <img
                ref={imgRef}
                src={imageUrl}
                alt="Blueprint"
                className="max-w-full h-auto block"
                onClick={handleImageClick}
            />

            {/* Logic to render existing dots will go here in the next step */}
        </div>
    );
}