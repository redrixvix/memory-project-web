import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "@uploadthing/shared";

const f = createUploadthing();

export const uploadRouter = {
  // Images — up to 10 files, 4MB each
  imageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 10 },
  })
    .middleware(() => {
      // TODO: add auth check
      return { userId: "anonymous" };
    })
    .onUploadComplete(({ file }) => {
      return { url: file.url, fileName: file.name };
    }),

  // Audio — up to 16MB
  audioUploader: f({
    audio: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(() => {
      return { userId: "anonymous" };
    })
    .onUploadComplete(({ file }) => {
      return { url: file.url, fileName: file.name };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
