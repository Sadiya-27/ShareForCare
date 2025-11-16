"use client";

import { UploadButton } from "@uploadthing/react";

export default function AddImageButton({ onUploadComplete }) {
  return (
    <UploadButton
      endpoint="multipleImages"
      onClientUploadComplete={(res) => {
        if (!res) return;

        const urls = res.map((f) => f.url);
        onUploadComplete(urls); // append new URLs
      }}
      onUploadError={(error) => alert(`Upload failed: ${error.message}`)}
      className="mt-2"
    />
  );
}
