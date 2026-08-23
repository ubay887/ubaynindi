import { ImageResponse } from "next/og";
import { wedding, getPrimaryEvent } from "@/config/wedding";
import { sideLabel } from "@/lib/utils";
import type { InviteSide } from "@/types/wedding";

export const ogSize = { width: 1200, height: 630 };

/** Shared OG card for social previews (optional guest name + side). */
export function createOgImage(opts?: {
  guestName?: string;
  side?: InviteSide;
}) {
  const side = opts?.side ?? "wanita";
  const guestName = opts?.guestName;
  const primary = getPrimaryEvent(side);
  const [first, second] = wedding.couple.displayNames.split(" & ");
  const showGuest = Boolean(guestName && guestName !== "Tamu Undangan");
  const eventLine = `${primary.title} · ${primary.dateLabel}`;

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
          background:
            "linear-gradient(160deg, #eef3eb 0%, #f7f6f2 45%, #e2ebe0 100%)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            left: -60,
            width: 420,
            height: 420,
            borderRadius: 999,
            background: "rgba(79, 109, 76, 0.12)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            right: -40,
            width: 480,
            height: 480,
            borderRadius: 999,
            background: "rgba(184, 154, 106, 0.14)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 980,
            height: 500,
            borderRadius: 32,
            background: "rgba(255, 255, 255, 0.72)",
            border: "1px solid rgba(46, 63, 44, 0.1)",
            boxShadow: "0 24px 60px rgba(46, 63, 44, 0.12)",
            padding: "40px 48px",
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: "#4f6d4c",
              letterSpacing: 3,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            {sideLabel(side)}
          </div>

          <div
            style={{
              fontSize: 34,
              color: "#4f6d4c",
              fontStyle: "italic",
              marginBottom: 14,
              letterSpacing: 1,
            }}
          >
            The Wedding Of
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "#2e3f2c",
              fontSize: 68,
              fontWeight: 600,
              letterSpacing: 10,
              textTransform: "uppercase",
              lineHeight: 1.05,
            }}
          >
            <span>{first}</span>
            <span
              style={{
                fontSize: 40,
                color: "#8f7348",
                letterSpacing: 0,
                marginTop: 4,
                marginBottom: 4,
                fontWeight: 500,
              }}
            >
              &
            </span>
            <span>{second}</span>
          </div>

          <div
            style={{
              marginTop: 22,
              width: 80,
              height: 2,
              background:
                "linear-gradient(90deg, transparent, #b89a6a, transparent)",
            }}
          />

          <div
            style={{
              marginTop: 18,
              fontSize: 24,
              color: "#556058",
              letterSpacing: 1,
              textAlign: "center",
            }}
          >
            {eventLine}
          </div>

          {showGuest ? (
            <div
              style={{
                marginTop: 28,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "14px 36px",
                borderRadius: 16,
                background: "rgba(46, 63, 44, 0.06)",
                border: "1px solid rgba(46, 63, 44, 0.1)",
                maxWidth: 720,
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  color: "#6b736e",
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Kepada Yth.
              </div>
              <div
                style={{
                  fontSize: 32,
                  color: "#2e3f2c",
                  fontWeight: 600,
                  textAlign: "center",
                  lineHeight: 1.25,
                }}
              >
                {guestName}
              </div>
            </div>
          ) : (
            <div
              style={{
                marginTop: 16,
                fontSize: 22,
                color: "#6b736e",
              }}
            >
              Undangan Digital
            </div>
          )}
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
