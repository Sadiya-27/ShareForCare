"use client";

import { UploadButton } from "@uploadthing/react";
import "@uploadthing/react/styles.css";

export default function FileUpload({ onUploadComplete, multiple = false }) {
  return (
    <div>
      <UploadButton
        endpoint={multiple ? "multipleImages" : "singleImage"}
        onClientUploadComplete={(res) => {
          if (!res) return;

          // IMPORTANT FIX: use ufsUrl instead of deprecated url
          const urls = res.map((file) => file.ufsUrl);

          // pass all the URLs to parent
          onUploadComplete(multiple ? urls : urls[0]);
        }}
        onUploadError={(err) => alert("Upload failed: " + err.message)}
      />
    </div>
  );
}
