import { ImageResponse } from "next/og";
import { wedding, getPrimaryEvent } from "@/config/wedding";
import { sideLabel } from "@/lib/utils";
import type { InviteSide } from "@/types/wedding";

export const ogSize = { width: 1200, height: 630 };

/** Shared luxury OG card for social previews (WhatsApp, Telegram, Twitter, FB). */
export function createOgImage(opts?: {
  guestName?: string;
  side?: InviteSide;
}) {
  const side = opts?.side ?? "wanita";
  const guestName = opts?.guestName?.slice(0, 80);
  const primary = getPrimaryEvent(side);
  const [first, second] = wedding.couple.displayNames.split(" & ");
  const showGuest = Boolean(guestName && guestName !== "Tamu Undangan");
  const eventLine = `${primary.dateLabel} · ${primary.venue}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fbf9f4 0%, #f4ece1 50%, #eae0cf 100%)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          position: "relative",
          padding: 24,
        }}
      >
        {/* Outer Gold Frame */}
        <div
          style={{
            position: "absolute",
            inset: 16,
            border: "2px solid rgba(194, 155, 78, 0.45)",
            borderRadius: 24,
            display: "flex",
          }}
        />

        {/* Corner Accents */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            width: 32,
            height: 32,
            borderTop: "3px solid #c29b4e",
            borderLeft: "3px solid #c29b4e",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            width: 32,
            height: 32,
            borderTop: "3px solid #c29b4e",
            borderRight: "3px solid #c29b4e",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: 24,
            width: 32,
            height: 32,
            borderBottom: "3px solid #c29b4e",
            borderLeft: "3px solid #c29b4e",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            width: 32,
            height: 32,
            borderBottom: "3px solid #c29b4e",
            borderRight: "3px solid #c29b4e",
            display: "flex",
          }}
        />

        {/* Inner Card Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 1100,
            height: 540,
            borderRadius: 20,
            background: "rgba(255, 255, 255, 0.85)",
            border: "1px solid rgba(194, 155, 78, 0.35)",
            boxShadow: "0 20px 50px rgba(15, 61, 52, 0.12)",
            padding: "28px 40px",
            position: "relative",
          }}
        >
          {/* Top Seal / Monogram */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 58,
              height: 58,
              borderRadius: 999,
              background: "linear-gradient(135deg, #1b6554, #0f3d34)",
              border: "2px solid #dfbe7e",
              boxShadow: "0 6px 16px rgba(15, 61, 52, 0.3)",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                color: "#dfbe7e",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              UN
            </span>
          </div>

          {/* Side / Event Badge */}
          <div
            style={{
              fontSize: 13,
              color: "#1b6554",
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {sideLabel(side)}
          </div>

          {/* The Wedding Of */}
          <div
            style={{
              fontSize: 26,
              color: "#c29b4e",
              fontStyle: "italic",
              marginBottom: 8,
              letterSpacing: 1,
            }}
          >
            The Wedding Of
          </div>

          {/* Couple Names */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0f3d34",
              fontSize: 54,
              fontWeight: 700,
              letterSpacing: 6,
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            <span>{first}</span>
            <span
              style={{
                fontSize: 38,
                color: "#c29b4e",
                fontStyle: "italic",
                marginLeft: 16,
                marginRight: 16,
                fontWeight: 400,
              }}
            >
              &amp;
            </span>
            <span>{second}</span>
          </div>

          {/* Golden Divider Line */}
          <div
            style={{
              marginTop: 14,
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 240,
              height: 2,
              background: "linear-gradient(90deg, transparent, #c29b4e, transparent)",
            }}
          />

          {/* Date and Venue */}
          <div
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: "#5a554c",
              letterSpacing: 2,
              textTransform: "uppercase",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            {eventLine}
          </div>

          {/* Guest Plate or Digital Invite Banner */}
          {showGuest ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "8px 36px",
                borderRadius: 14,
                background: "linear-gradient(135deg, rgba(27, 101, 84, 0.08), rgba(194, 155, 78, 0.12))",
                border: "1px solid rgba(194, 155, 78, 0.5)",
                maxWidth: 700,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#5a554c",
                  fontWeight: 700,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  marginBottom: 2,
                }}
              >
                Kepada Yth. Bapak/Ibu/Saudara/i
              </div>
              <div
                style={{
                  fontSize: 26,
                  color: "#0f3d34",
                  fontWeight: 700,
                  textAlign: "center",
                  letterSpacing: 1,
                }}
              >
                {guestName}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 24px",
                borderRadius: 999,
                background: "rgba(27, 101, 84, 0.08)",
                border: "1px solid rgba(27, 101, 84, 0.2)",
                fontSize: 13,
                fontWeight: 700,
                color: "#1b6554",
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              Undangan Pernikahan Digital
            </div>
          )}
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
