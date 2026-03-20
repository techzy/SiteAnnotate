"use client";

import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import imageCompression from 'browser-image-compression';

interface Props {
    siteId: string;
    imageUrl: string;
}

type IssueRow = {
    id: string;
    site_id: string;
    x_coords: number;
    y_coords: number;
    message: string | null;
    status: string | null;
    file_name: string | null;
};

export default function AnnotatorCanvas({ siteId, imageUrl }: Props) {
    const imgRef = useRef<HTMLImageElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [pendingIssue, setPendingIssue] = useState<{
        x_coords: number;
        y_coords: number;
        message: string;
    } | null>(null);
    const [issues, setIssues] = useState<IssueRow[]>([]);
    const [selectedIssue, setSelectedIssue] = useState<IssueRow | null>(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [statusSaving, setStatusSaving] = useState(false);

    const loadIssuesForSite = async () => {
        const { data, error } = await supabase
            .from('issues')
            .select('id, site_id, x_coords, y_coords, message, status, file_name')
            .eq('site_id', siteId);

        if (error) {
            console.error('Failed to load issues:', error);
            return;
        }

        // Supabase returns data as unknown; assert into our app shape.
        setIssues((data ?? []) as IssueRow[]);
    };

    const fetchSignedIssueImage = async (issue: IssueRow) => {
        if (!issue.file_name) {
            setSelectedImageUrl(null);
            return;
        }

        setImageLoading(true);
        try {
            const { data, error } = await supabase.storage
                .from('issues')
                .createSignedUrl(issue.file_name, 3600);

            if (error) {
                console.error('Failed to create signed URL:', error);
                setSelectedImageUrl(null);
                return;
            }

            setSelectedImageUrl(data.signedUrl ?? null);
        } finally {
            setImageLoading(false);
        }
    };

    useEffect(() => {
        loadIssuesForSite();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siteId]);

    const handleImageClick = async (e: React.MouseEvent) => {
        if (isAdding || pendingIssue) return;
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

        // 5. Ask for an image upload next
        setPendingIssue({ x_coords: xPercent, y_coords: yPercent, message });
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawFile = e.target.files?.[0];
        if (!pendingIssue) return;

        // If user cancels, clear pending state and stop.
        if (!rawFile) {
            setPendingIssue(null);
            return;
        }

        setIsAdding(true);
        try {
            // 1) Insert the issue row first so we get the new `id`.
            const { data: inserted, error: insertError } = await supabase
                .from('issues')
                .insert({
                    site_id: siteId,
                    x_coords: pendingIssue.x_coords,
                    y_coords: pendingIssue.y_coords,
                    message: pendingIssue.message,
                    status: 'open'
                })
                .select('id')
                .single();

            if (insertError || !inserted) {
                alert("Error saving point: " + (insertError?.message || "Unknown error"));
                return;
            }

            const issueId = inserted.id as string;
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true
            }

            //Compressing File 
            const file = await imageCompression(rawFile, options);

            // 2) Upload the photo to Supabase Storage.
            // Store the object path into `issues.file_name`.
            const objectPath = `issues/${issueId}/${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('issues')
                .upload(objectPath, file);

            if (uploadError) {
                alert("Error uploading image: " + uploadError.message);
                return;
            }

            // 3) Update the issue row with the storage object path.
            const { error: updateError } = await supabase
                .from('issues')
                .update({ file_name: objectPath })
                .eq('id', issueId);

            if (updateError) {
                alert("Error saving image filename: " + updateError.message);
                return;
            }

            await loadIssuesForSite();
        } catch (err) {
            console.log(err);
            alert("Unexpected error while saving the issue.");
        } finally {
            setIsAdding(false);
            setPendingIssue(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSelectIssue = async (issue: IssueRow) => {
        // If user is in the middle of creating/uploading a new issue, ignore marker clicks.
        if (isAdding || pendingIssue) return;

        setSelectedIssue(issue);
        setSelectedImageUrl(null);
        await fetchSignedIssueImage(issue);
    };

    const handleToggleDone = async (nextDone: boolean) => {
        if (!selectedIssue || statusSaving) return;
        setStatusSaving(true);
        const nextStatus = nextDone ? 'done' : 'open';

        try {
            const { error } = await supabase
                .from('issues')
                .update({ status: nextStatus })
                .eq('id', selectedIssue.id);

            if (error) {
                alert('Could not update issue status: ' + error.message);
                return;
            }

            // Optimistic update so marker turns green immediately.
            setIssues((prev) =>
                prev.map((it) => (it.id === selectedIssue.id ? { ...it, status: nextStatus } : it))
            );
            setSelectedIssue((prev) => (prev ? { ...prev, status: nextStatus } : prev));
        } finally {
            setStatusSaving(false);
        }
    };

    return (
        <div className="relative w-full h-full cursor-crosshair">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />
            <img
                ref={imgRef}
                src={imageUrl}
                alt="Blueprint"
                className="w-full h-auto block"
                onClick={handleImageClick}
                aria-busy={isAdding}
            />

            {/* Logic to render existing dots will go here in the next step */}
            {issues.map((issue) => (
                <button
                    key={issue.id}
                    className={
                        "absolute w-4 h-4 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 " +
                        (issue.status === 'open' ? 'bg-red-500' : 'bg-green-500')
                    }
                    style={{ left: `${issue.x_coords}%`, top: `${issue.y_coords}%` }}
                    aria-label={issue.message ? `Issue: ${issue.message}` : 'Issue'}
                    title={issue.message ?? undefined}
                    type="button"
                    onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        await handleSelectIssue(issue);
                    }}
                />
            ))}

            {selectedIssue && (
                <div
                    className="fixed inset-0 z-50 bg-black/60"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setSelectedIssue(null)}
                >
                    <div
                        className="h-full w-full bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-gray-900">
                                    {selectedIssue.message ?? 'Issue'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Status: {selectedIssue.status ?? 'open'}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="rounded-lg px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setSelectedIssue(null)}
                                    disabled={statusSaving}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="rounded-lg p-2 text-sm text-gray-600 hover:bg-gray-100"
                                    onClick={() => setSelectedIssue(null)}
                                    aria-label="Close"
                                    disabled={statusSaving}
                                >
                                    X
                                </button>
                            </div>
                        </div>

                        <div className="flex h-full flex-col">
                            <div className="flex-1 min-h-0 bg-gray-100">
                                <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
                                    {imageLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-black" />
                                        </div>
                                    ) : selectedImageUrl ? (
                                        <img
                                            src={selectedImageUrl}
                                            alt="Issue"
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm text-gray-500">
                                            No issue photo uploaded.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t p-4">
                                <div className="flex flex-col gap-3">
                                    <button
                                        type="button"
                                        className={
                                            "w-full rounded-xl py-3 font-bold transition " +
                                            (selectedIssue.status === 'open'
                                                ? "bg-black text-white active:opacity-90"
                                                : "bg-green-600 text-white active:opacity-90")
                                        }
                                        onClick={() => handleToggleDone(selectedIssue.status === 'open')}
                                        disabled={statusSaving}
                                    >
                                        {selectedIssue.status === 'open' ? 'Mark as Done' : 'Mark as Open'}
                                    </button>

                                    <div className="flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900">Status</p>
                                            <p className="text-xs text-gray-500">
                                                Toggle turns the marker green.
                                            </p>
                                        </div>

                                        <label className="flex cursor-pointer items-center gap-3">
                                            <span
                                                className={
                                                    "text-xs font-semibold " +
                                                    (selectedIssue.status === 'open' ? 'text-red-600' : 'text-green-600')
                                                }
                                            >
                                                {selectedIssue.status === 'open' ? 'Open' : 'Done'}
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={selectedIssue.status !== 'open'}
                                                onChange={(e) => handleToggleDone(e.target.checked)}
                                                disabled={statusSaving}
                                                className="h-5 w-5"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}