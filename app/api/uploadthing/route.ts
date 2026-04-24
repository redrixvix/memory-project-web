import { createRouteHandler } from "uploadthing/next";
import { uploadRouter } from "./core";

export const { GET, POST } = createRouteHandler({
  router: uploadRouter,
  config: {
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/uploadthing`,
  },
});
