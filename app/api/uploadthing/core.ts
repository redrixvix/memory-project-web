import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getUserFromSession } from "@/lib/auth";
import { ensureDatabaseReady } from "@/lib/db";

const f = createUploadthing();

export const uploadRouter = {
  // Images — up to 10 files, 4MB each
  imageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 10 },
  })
    .middleware(async ({ req }) => {
      await ensureDatabaseReady();
      const user = await getUserFromSession(req);
      if (!user) {
        throw new Error("Unauthorized");
      }
      return { userId: user.id.toString() };
    })
    .onUploadComplete(({ file }) => {
      return { url: file.ufsUrl, key: file.key, fileName: file.name };
    }),

  // Audio — up to 16MB
  audioUploader: f({
    audio: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      await ensureDatabaseReady();
      const user = await getUserFromSession(req);
      if (!user) {
        throw new Error("Unauthorized");
      }
      return { userId: user.id.toString() };
    })
    .onUploadComplete(({ file }) => {
      return { url: file.ufsUrl, key: file.key, fileName: file.name };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
