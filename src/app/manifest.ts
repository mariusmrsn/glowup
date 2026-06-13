import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GlowUp — Level Up Your Life",
    short_name: "GlowUp",
    description: "Mache das echte Leben zum RPG. Verbesser dich täglich und leve auf.",
    start_url: "/",
    display: "standalone",
    background_color: "#111118",
    theme_color: "#111118",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
