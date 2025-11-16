"use client";
import { UploadButton } from "@uploadthing/react";
import "@uploadthing/react/styles.css";
import { useState } from "react";

export default function FileUpload({ onUploadComplete }) {
  const [fileUrl, setFileUrl] = useState(null);

  return (
    <div className="flex flex-col items-center">
      <UploadButton
        endpoint="ngoDocsUploader"
        onClientUploadComplete={(res) => {
          const url = res[0].url;
          setFileUrl(url);
          onUploadComplete(url);
          alert("Upload complete!");
        }}
        onUploadError={(error) => {
          alert(`Upload failed: ${error.message}`);
        }}
      />
      {fileUrl && (
        <p className="mt-2 text-sm text-blue-600 break-all">{fileUrl}</p>
      )}
    </div>
  );
}
