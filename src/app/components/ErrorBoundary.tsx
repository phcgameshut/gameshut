"use client";
import React from "react";
interface State { hasError: boolean; }
export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(): State { return { hasError: true }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { console.error("ErrorBoundary caught:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", textAlign: "center", gap: "16px" }}>
          <div style={{ fontSize: "3rem" }}>😅</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Something went wrong</h2>
          <p style={{ color: "#64748b", maxWidth: "360px" }}>Your score is safe. Please reload the page to continue.</p>
          <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }} style={{ padding: "12px 28px", background: "var(--color-brand)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
