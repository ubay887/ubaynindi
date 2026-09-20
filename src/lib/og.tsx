import { ImageResponse } from "next/og";
import { wedding, getPrimaryEvent } from "@/config/wedding";
import type { InviteSide } from "@/types/wedding";

export const ogSize = { width: 1200, height: 630 };

/** Compact card: large names, short date — readable in WhatsApp thumbnail. */
export function createOgImage(opts?: {
  guestName?: string;
  side?: InviteSide;
}) {
  const side = opts?.side ?? "wanita";
  const guestName = opts?.guestName?.slice(0, 48);
  const primary = getPrimaryEvent(side);
  const [first, second] = wedding.couple.displayNames.split(" & ");
  const showGuest = Boolean(guestName && guestName !== "Tamu Undangan");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fbf9f4",
          fontFamily: "Georgia, Times New Roman, serif",
        }}
      >
        <div
          style={{
            width: 1144,
            height: 574,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #c29b4e",
            borderRadius: 18,
            background: "#fffcf7",
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#c29b4e",
              fontSize: 32,
              fontStyle: "italic",
              marginBottom: 8,
            }}
          >
            The Wedding Of
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#1a1815",
              fontSize: 68,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            <span>{first}</span>
            <span
              style={{
                color: "#c29b4e",
                fontSize: 44,
                fontStyle: "italic",
                fontWeight: 400,
                letterSpacing: 0,
                textTransform: "none",
                marginLeft: 14,
                marginRight: 14,
              }}
            >
              &
            </span>
            <span>{second}</span>
          </div>
          <div
            style={{
              display: "flex",
              width: 88,
              height: 2,
              background: "#c29b4e",
              marginTop: 18,
              marginBottom: 16,
            }}
          />
          <div
            style={{
              display: "flex",
              color: "#1b6554",
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            {primary.dateLabel}
          </div>
          <div
            style={{
              display: "flex",
              color: "#5a554c",
              fontSize: 20,
              marginTop: 6,
            }}
          >
            {primary.title}
          </div>
          {showGuest ? (
            <div
              style={{
                display: "flex",
                color: "#1a1815",
                fontSize: 24,
                fontWeight: 700,
                marginTop: 16,
              }}
            >
              {`Untuk ${guestName}`}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
