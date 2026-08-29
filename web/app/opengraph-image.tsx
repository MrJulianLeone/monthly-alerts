import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "MonthlyAlerts — multilingual construction checklists";

// ASCII-only text and explicit flex on every multi-child node: the OG
// renderer (satori) fails the build otherwise.
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
            }}
          >
            <div
              style={{
                width: 34,
                height: 18,
                borderLeft: "7px solid #ffffff",
                borderBottom: "7px solid #ffffff",
                transform: "rotate(-45deg) translateY(-4px)",
              }}
            />
          </div>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 700, letterSpacing: 2 }}>
            <span>Monthly</span>
            <span style={{ color: "#ea580c" }}>Alerts</span>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 44, marginTop: 48, lineHeight: 1.25, maxWidth: 900 }}>
          Construction checklists your whole crew can read
        </div>
        <div style={{ display: "flex", fontSize: 26, marginTop: 24, color: "#a8a29e" }}>
          EN / IT / ES - translated automatically for every member
        </div>
      </div>
    ),
    size
  );
}
