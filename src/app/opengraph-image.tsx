import { createOgImage } from "@/lib/og";
import { wedding } from "@/config/wedding";

export const alt = wedding.meta.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default OG (wanita, no guest) */
export default function OpenGraphImage() {
  return createOgImage({ side: "wanita" });
}
