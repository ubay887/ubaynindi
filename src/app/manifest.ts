import type { MetadataRoute } from "next";
import { wedding } from "@/config/wedding";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: wedding.meta.title,
    short_name: wedding.couple.displayNames,
    description: wedding.meta.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fbf9f4",
    theme_color: "#1b6554",
    orientation: "portrait",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
