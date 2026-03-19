"use client";
import { supabase } from '../../lib/supabase'
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import AnnotatorCanvas from '../../components/AnnotatorCanvas'
import imageCompression from 'browser-image-compression';

type Site = {
  id: string;
  name?: string | null;
  file_name: string | null;
  imageUrl?: string | null;
};

export default function AnnotatePage() {
  const { siteId } = useParams();
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!siteId) return;
    async function loadData() {
      // 1. Fetch Site Data
      const { data: siteData } = await supabase
        .from("sites")
        .select("id, name, file_name")
        .eq("id", siteId)
        .single();

      if (!siteData) {
        setSite(null);
        setLoading(false);
        return;
      }

      if (siteData.file_name == null) {
        setSite({
          id: siteData.id,
          name: siteData.name ?? null,
          file_name: siteData.file_name,
          imageUrl: null,
        });
        setLoading(false);
        return;
      }

      // `file_name` is stored as the object path in the `blueprints` storage bucket.
      const { data: signedUrlData } = await supabase.storage
        .from("blueprints")
        .createSignedUrl(siteData.file_name, 3600);

      setSite({
        id: siteData.id,
        name: siteData.name ?? null,
        file_name: siteData.file_name,
        imageUrl: signedUrlData?.signedUrl ?? null,
      });
      setLoading(false)
    }
    loadData();

  }, [siteId]);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgFile = e.target.files?.[0]
    if (!imgFile) return;
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    }
    try {
      setLoading(true)

      //Compressing File 
      const compFile = await imageCompression(imgFile, options);
      console.log(compFile.size)

      // Uploading to Supabase storage
      const fileName = `${siteId}-${Date.now()}.jpg`;
      const { data: uploadData, error: uploadErr } = await supabase.storage.from('blueprints').upload(fileName, compFile)
      if (uploadErr) throw uploadErr
      // Updating the database

      await supabase.from('sites').update({ file_name: fileName }).eq('id', siteId);

      window.location.reload()
    }
    catch (err) {
      console.log(err)
    }
    finally {
      setLoading(false)
    }


  }

  if (loading) return <p className="p-8">Loading...</p>;

  if (!site?.file_name) {
    return (
      <div className="flex w-full items-center justify-center p-4">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept="image/*"
          name=""
          id=""
        />
        <button
          type="submit"
          className="w-full max-w-xs rounded-xl bg-black py-4 h-50 px-6 text-center font-bold text-white 
       transition-transform active:scale-95 hover:bg-gray-800 
       shadow-lg shadow-black/10 sm:w-auto"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload Blueprint
        </button>
      </div>
    );
  }

  if (!site.imageUrl) return <p className="p-8">Unable to load blueprint image.</p>;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-white p-4 shadow-md flex justify-between items-center">
        <h1 className="font-bold text-lg">Site: {site?.name || 'Annotator'}</h1>
        <span className="text-sm text-gray-500">Tap anywhere to add a red dot</span>
      </header>

      <main className="flex-1 relative overflow-auto p-4 flex justify-center">
        <div className="relative bg-white shadow-2xl h-fit">
          <AnnotatorCanvas siteId={siteId as string} imageUrl={site.imageUrl} />
        </div>
      </main>
    </div>
  );
}







