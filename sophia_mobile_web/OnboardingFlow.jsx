const OnboardingFlow = ({ onComplete }) => (
  <div style={{ padding: 24, color: "#fff", background: "#0a0a0a", minHeight: "100vh", fontFamily: "monospace", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>SOPHIA</div>
    <div style={{ color: "#888", marginBottom: 24 }}>Your personal operating system</div>
    <button onClick={onComplete} style={{ background: "#00d4ff", color: "#000", border: "none", borderRadius: 8, padding: "12px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
      Enter Sophia
    </button>
  </div>
);
export default OnboardingFlow;