import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "MonthlyAlerts — multilingual construction checklists";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#1c1917",
          color: "#fafaf9",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 72,
              height: 72,
              background: "#ea580c",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 52,
              fontWeight: 700,
            }}
          >
            ✓
          </div>
          <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: 2 }}>
            Monthly<span style={{ color: "#ea580c" }}>Alerts</span>
          </div>
        </div>
        <div style={{ fontSize: 44, marginTop: 48, lineHeight: 1.25, maxWidth: 900 }}>
          Construction checklists your whole crew can read
        </div>
        <div style={{ fontSize: 26, marginTop: 24, color: "#a8a29e" }}>
          EN ⇄ IT ⇄ ES — translated automatically for every member
        </div>
      </div>
    ),
    size
  );
}
