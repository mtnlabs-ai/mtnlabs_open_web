export default function Home() {
  return (
    <main style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
      color: "#e2e8f0",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ textAlign: "center", padding: "2rem", maxWidth: "600px" }}>
        <h1 style={{
          fontSize: "3rem",
          fontWeight: 700,
          marginBottom: "0.5rem",
          background: "linear-gradient(90deg, #22d3ee, #60a5fa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          mtnlabs.ai
        </h1>
        <p style={{ fontSize: "1.25rem", color: "#94a3b8", marginBottom: "2rem" }}>
          AI-powered route planning for Norwegian mountains
        </p>
        <a
          href="https://plan.mtnlabs.ai"
          style={{
            display: "inline-block",
            padding: "0.875rem 2rem",
            background: "linear-gradient(135deg, #22d3ee, #3b82f6)",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "12px",
            fontSize: "1.1rem",
            fontWeight: 600,
            boxShadow: "0 4px 20px rgba(34, 211, 238, 0.3)",
          }}
        >
          Open the planner
        </a>
      </div>
      <div style={{
        position: "absolute",
        bottom: "2rem",
        color: "#475569",
        fontSize: "0.85rem",
      }}>
        mtnlabs 2026
      </div>
    </main>
  );
}
