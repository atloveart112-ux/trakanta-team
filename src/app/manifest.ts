import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ตระการตา · ตารางคอนเทนต์ทีม",
    short_name: "ตระการตา",
    description: "ตารางงานคอนเทนต์ของทีม ตระการตาผ้าไทย",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FAF4E8",
    theme_color: "#E07A5F",
    lang: "th",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
