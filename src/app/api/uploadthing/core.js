import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  ngoDocsUploader: f({
    image: { maxFileSize: "4MB" },
    pdf: { maxFileSize: "10MB" },
  }).onUploadComplete(async ({ file }) => {
    console.log("File uploaded:", file.url);
    // You can store file.url in MongoDB here if needed
  }),

  multipleImages: f({
    image: { 
      maxFileSize: "8MB",
      maxFileCount: 10,    // ✔ REAL multi-upload support
    },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.url }; // ✔ for your UploadThing version
  }),
};
