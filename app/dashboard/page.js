"use client";

import { useState, useEffect } from "react";

export default function Dashboard() {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [theme, setTheme] = useState("light");
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0, total: 0 });
  const [dailyTrend, setDailyTrend] = useState([]);
  const [images, setImages] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [authError, setAuthError] = useState("");
  const [dataError, setDataError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Sync theme with localStorage & document attributes
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      // Default to light mode as requested by the user, ignoring system dark preference
      const initialTheme = "light";
      setTheme(initialTheme);
      document.documentElement.setAttribute("data-theme", initialTheme);
    }

    // Auto-login if passcode is already stored in sessionStorage
    const savedPasscode = sessionStorage.getItem("peepify_admin_passcode");
    if (savedPasscode) {
      verifyPasscode(savedPasscode);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const verifyPasscode = async (codeToVerify) => {
    setIsVerifying(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: codeToVerify }),
      });
      const data = await res.json();

      if (data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem("peepify_admin_passcode", codeToVerify);
        fetchStatsAndGallery(codeToVerify);
      } else {
        setAuthError(data.error || "Incorrect passcode!");
        sessionStorage.removeItem("peepify_admin_passcode");
      }
    } catch (err) {
      console.error("Auth verification failed:", err);
      setAuthError("Failed to communicate with auth server.");
    } finally {
      setIsVerifying(false);
    }
  };

  const fetchStatsAndGallery = async (authCode) => {
    setIsLoadingData(true);
    setDataError("");
    try {
      const res = await fetch("/api/stats", {
        headers: {
          "Authorization": `Bearer ${authCode}`,
        }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setDailyTrend(data.dailyTrend || []);
        setImages(data.images || []);
      } else {
        setDataError(data.error || "Failed to load stats.");
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setDataError("Failed to fetch statistics and images from gallery.");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setAuthError("Please enter a passcode.");
      return;
    }
    verifyPasscode(passcode);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("peepify_admin_passcode");
    setIsAuthenticated(false);
    setPasscode("");
    setStats({ today: 0, week: 0, month: 0, total: 0 });
    setDailyTrend([]);
    setImages([]);
  };

  const handleDelete = async (id) => {
    const activePasscode = sessionStorage.getItem("peepify_admin_passcode") || passcode;
    if (!activePasscode) {
      setDataError("Authorization expired. Please log in again.");
      return;
    }

    if (!confirm("Are you sure you want to permanently delete this original photo and avatar pair from GCS? This cannot be undone!")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch("/api/gallery/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, passcode: activePasscode }),
      });
      const data = await res.json();

      if (data.success) {
        // Filter out deleted image locally to avoid a complete page refresh
        setImages(prev => prev.filter(img => img.id !== id));

        // Recalculate stats dynamically based on deleted count to maintain accuracy
        setStats(prev => {
          const newTotal = Math.max(0, prev.total - 1);
          return {
            ...prev,
            total: newTotal,
            // (Note: For precise local daily/weekly recalculation, a re-fetch is best, but updating total immediately is great UX)
          };
        });

        // Quietly re-fetch stats in the background to ensure all buckets/trends align perfectly
        fetchStatsAndGallery(activePasscode);
      } else {
        alert(data.error || "Failed to delete the image pair.");
      }
    } catch (err) {
      console.error("Failed to delete GCS image pair:", err);
      alert("Error occurred while deleting file.");
    } finally {
      setDeletingId(null);
    }
  };

  // Find max daily count to scale chart heights proportionally
  const maxDailyCount = dailyTrend.length > 0 ? Math.max(...dailyTrend.map(d => d.count)) : 0;

  // PASSCODE LOCK GATE UI
  if (!isAuthenticated) {
    return (
      <div className="sketch-container" style={{ gridTemplateColumns: "1fr", maxWidth: "480px", minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", padding: "16px" }}>
        <div className="sketch-card" style={{ width: "100%", padding: "36px 20px", textAlign: "center", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <span className="sketch-logo-icon">🔒</span>
            <button
              onClick={toggleTheme}
              className="sketch-circle-btn"
              title="Toggle Theme"
              style={{ width: "38px", height: "38px", fontSize: "1.1rem" }}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>

          <h2 style={{ fontFamily: "var(--font-header)", fontSize: "2rem", marginBottom: "8px" }}>Peepify Secure Gate</h2>
          <p style={{ color: "var(--color-ink-variant)", marginBottom: "32px", fontSize: "1.1rem" }}>
            Enter your secret admin ink passcode to view creation activity and moderate image files.
          </p>

          <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ textAlign: "left" }}>
              <label htmlFor="passcode-input" style={{ fontFamily: "var(--font-header)", fontSize: "1.1rem", display: "block", marginBottom: "8px" }}>
                Secret Passcode
              </label>
              <input
                id="passcode-input"
                type="password"
                placeholder="Enter your password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                disabled={isVerifying}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "1.25rem",
                  fontFamily: "var(--font-body)",
                  border: "var(--border-ink)",
                  borderRadius: "12px 18px 14px 20px / 20px 14px 18px 12px",
                  background: "var(--color-bg)",
                  color: "var(--color-ink)",
                  outline: "none",
                  boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.05)",
                  transition: "box-shadow 0.2s ease"
                }}
              />
            </div>

            {authError && (
              <div className="sketch-error-box" style={{ padding: "10px 14px", fontSize: "1.05rem", borderRadius: "8px 12px 8px 12px", marginTop: "4px" }}>
                🚫 {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="sketch-btn sketch-btn-filled"
              style={{ width: "100%", padding: "14px", fontSize: "1.2rem", marginTop: "12px" }}
            >
              {isVerifying ? (
                <>
                  <span className="sketch-spinner" style={{ width: "20px", height: "20px", borderWidth: "2px", marginRight: "8px" }}></span>
                  Unlocking Lockbox...
                </>
              ) : (
                "Unlock Dashboard 🔑"
              )}
            </button>
          </form>

          <div style={{ marginTop: "32px", fontSize: "1rem" }}>
            <a href="/" style={{ color: "var(--color-ink)", textDecoration: "underline", fontFamily: "var(--font-header)" }}>
              ⬅️ Back to Peepify Maker
            </a>
          </div>
        </div>
      </div>
    );
  }

  // MAIN ADMIN DASHBOARD UI
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header Banner */}
      <header className="sketch-header">
        <div className="sketch-logo">
          <span className="sketch-logo-icon">📊</span>
          <div className="sketch-logo-text-container">
            <h1 className="sketch-logo-text">Peepify Dashboard</h1>
            <span style={{ fontSize: "0.9rem", color: "var(--color-ink-variant)", fontFamily: "var(--font-header)" }}>
              Secure Moderation & Metrics
            </span>
          </div>
        </div>
        <div className="sketch-header-nav">
          <button
            onClick={toggleTheme}
            className="sketch-circle-btn"
            title="Toggle Theme"
            style={{ width: "42px", height: "42px" }}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <button
            onClick={handleLogout}
            className="sketch-btn"
            style={{ padding: "8px 16px", fontSize: "1.05rem" }}
          >
            Lock 🔒
          </button>
          <a
            href="/"
            className="sketch-btn sketch-btn-filled"
            style={{ padding: "8px 16px", fontSize: "1.05rem", textDecoration: "none" }}
          >
            Home 🏠
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="sketch-container" style={{ gridTemplateColumns: "1fr", maxWidth: "1200px" }}>

        {/* Error Alert */}
        {dataError && (
          <div className="sketch-error-box" style={{ marginBottom: "24px" }}>
            ⚠️ Error: {dataError}
            <button
              onClick={() => fetchStatsAndGallery(sessionStorage.getItem("peepify_admin_passcode") || passcode)}
              className="sketch-btn"
              style={{ marginLeft: "16px", padding: "4px 12px", fontSize: "0.95rem" }}
            >
              Retry 🔄
            </button>
          </div>
        )}

        {isLoadingData ? (
          /* Loading Sketched Skeleton State */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", gap: "24px" }}>
            <span className="sketch-spinner"></span>
            <h3 style={{ fontFamily: "var(--font-header)" }}>Scraping ink pads and counting doodles...</h3>
          </div>
        ) : (
          <>
            {/* 1. Analytics Stats Cards Grid */}
            <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px", marginBottom: "16px" }}>

              <div className="sketch-card" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ fontSize: "2rem" }}>📅</span>
                <span style={{ fontFamily: "var(--font-header)", color: "var(--color-ink-variant)" }}>Today</span>
                <span style={{ fontSize: "3rem", fontWeight: "bold", fontFamily: "var(--font-header)", lineHeight: 1 }}>
                  {stats.today}
                </span>
                <span style={{ fontSize: "0.85rem", color: "var(--color-ink-variant)" }}>Generations last 24h</span>
              </div>

              <div className="sketch-card" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ fontSize: "2rem" }}>🗓️</span>
                <span style={{ fontFamily: "var(--font-header)", color: "var(--color-ink-variant)" }}>This Week</span>
                <span style={{ fontSize: "3rem", fontWeight: "bold", fontFamily: "var(--font-header)", lineHeight: 1 }}>
                  {stats.week}
                </span>
                <span style={{ fontSize: "0.85rem", color: "var(--color-ink-variant)" }}>Generations last 7d</span>
              </div>

              <div className="sketch-card" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ fontSize: "2rem" }}>📊</span>
                <span style={{ fontFamily: "var(--font-header)", color: "var(--color-ink-variant)" }}>This Month</span>
                <span style={{ fontSize: "3rem", fontWeight: "bold", fontFamily: "var(--font-header)", lineHeight: 1 }}>
                  {stats.month}
                </span>
                <span style={{ fontSize: "0.85rem", color: "var(--color-ink-variant)" }}>Generations last 30d</span>
              </div>

              <div className="sketch-card" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ fontSize: "2rem" }}>👑</span>
                <span style={{ fontFamily: "var(--font-header)" }}>Grand Total</span>
                <span style={{ fontSize: "3rem", fontWeight: "bold", fontFamily: "var(--font-header)", lineHeight: 1 }}>
                  {stats.total}
                </span>
                <span style={{ fontSize: "0.85rem", color: "var(--color-ink-variant)" }}>All-time cataloged items</span>
              </div>

            </section>

            {/* 2. Daily Activity Chart Panel */}
            <section className="sketch-card" style={{ marginBottom: "24px", overflowX: "auto" }}>
              <h3 style={{ fontFamily: "var(--font-header)", fontSize: "1.5rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                📈 Weekly Generation Activity Trend
              </h3>

              {dailyTrend.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--color-ink-variant)" }}>
                  No sketchy chart data available yet. Keep generating!
                </div>
              ) : (
                <div style={{ minWidth: "500px", padding: "16px 8px" }}>
                  {/* Flexible bar container */}
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around", height: "200px", borderBottom: "3px solid var(--color-ink)", paddingBottom: "8px", position: "relative" }}>

                    {/* Sketched grid/guide lines behind */}
                    <div style={{ position: "absolute", left: 0, right: 0, top: "25%", borderTop: "1px dashed rgba(0,0,0,0.1)", zIndex: 0 }}></div>
                    <div style={{ position: "absolute", left: 0, right: 0, top: "50%", borderTop: "1px dashed rgba(0,0,0,0.1)", zIndex: 0 }}></div>
                    <div style={{ position: "absolute", left: 0, right: 0, top: "75%", borderTop: "1px dashed rgba(0,0,0,0.1)", zIndex: 0 }}></div>

                    {dailyTrend.map((day, idx) => {
                      // Proportional height calculations
                      const pct = maxDailyCount > 0 ? (day.count / maxDailyCount) * 100 : 0;
                      // Sketched bars should always have a tiny minimum visual height so they display beautifully
                      const visualHeight = day.count > 0 ? `calc(${pct}% * 0.85 + 15px)` : "8px";

                      return (
                        <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "12%", zIndex: 1, position: "relative" }}>

                          {/* Floating Count Bubbles */}
                          <div style={{ fontFamily: "var(--font-header)", fontSize: "1.1rem", marginBottom: "6px", fontWeight: "bold" }}>
                            {day.count}
                          </div>

                          {/* Sketchy Column Bar */}
                          <div
                            style={{
                              width: "70%",
                              height: visualHeight,
                              background: day.count > 0 ? "var(--color-highlight)" : "transparent",
                              border: "var(--border-ink)",
                              borderRadius: "6px 6px 0 0",
                              boxShadow: day.count > 0 ? "3px 0px 0px var(--color-ink)" : "none",
                              transition: "height 0.5s ease-out, background-color 0.2s",
                              cursor: "pointer",
                              position: "relative",
                              display: "flex",
                              justifyContent: "center"
                            }}
                            className="sketch-wiggle-hover"
                            title={`${day.count} generated on ${day.dateStr}`}
                          />

                          {/* X-Axis labels */}
                          <div style={{ marginTop: "12px", textAlign: "center" }}>
                            <div style={{ fontFamily: "var(--font-header)", fontSize: "1.1rem" }}>{day.label}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--color-ink-variant)" }}>{day.dateStr}</div>
                          </div>

                        </div>
                      );
                    })}

                  </div>
                </div>
              )}
            </section>

            {/* 3. Moderation and Image List Grid */}
            <section>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "20px" }}>
                <h3 style={{ fontFamily: "var(--font-header)", fontSize: "1.6rem", display: "flex", alignItems: "center", gap: "10px" }}>
                  🚨 Photo Moderation Center ({images.length} Pairs)
                </h3>
                <span style={{ fontSize: "1rem", color: "var(--color-ink-variant)", fontFamily: "var(--font-header)" }}>
                  Inspect or delete generated pairs
                </span>
              </div>

              {images.length === 0 ? (
                <div className="sketch-card" style={{ textAlign: "center", padding: "64px", gridColumn: "1 / -1" }}>
                  <span style={{ fontSize: "3rem", display: "block", marginBottom: "16px" }}>🎨</span>
                  <h4 style={{ fontFamily: "var(--font-header)", marginBottom: "8px" }}>Empty Sketch Canvas</h4>
                  <p style={{ color: "var(--color-ink-variant)" }}>
                    No avatars have been uploaded or generated yet. Get sketching on the main page!
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>

                  {images.map((img) => (
                    <div key={img.id} className="sketch-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

                      {/* Image side by side viewer */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

                        {/* Reference Image */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "0.85rem", fontFamily: "var(--font-header)", color: "var(--color-ink-variant)" }}>
                            📸 Original Photo
                          </span>
                          <div style={{ width: "100%", height: "160px", border: "var(--border-ink-thin)", borderRadius: "8px 12px 6px 12px / 12px 6px 12px 8px", overflow: "hidden", background: "#f0f0f0", position: "relative" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`/api/gallery/image/${img.id}?type=ref&passcode=${sessionStorage.getItem("peepify_admin_passcode") || passcode}`}
                              alt="Uploaded reference"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              loading="lazy"
                            />
                          </div>
                        </div>

                        {/* Avatar Image */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "0.85rem", fontFamily: "var(--font-header)", color: "var(--color-ink-variant)" }}>
                            🎨 Open Peep
                          </span>
                          <div style={{ width: "100%", height: "160px", border: "var(--border-ink-thin)", borderRadius: "12px 6px 12px 8px / 8px 12px 6px 12px", overflow: "hidden", background: "#ffffff", position: "relative" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`/api/gallery/image/${img.id}?type=avatar`}
                              alt="Generated Peep avatar"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              loading="lazy"
                            />
                          </div>
                        </div>

                      </div>

                      {/* Card Info and Actions */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1.5px dashed var(--color-ink)", paddingTop: "12px", marginTop: "auto" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "var(--color-ink-variant)" }}>
                            ID: {img.id.slice(0, 12)}...
                          </span>
                          <span style={{ fontSize: "0.85rem", color: "var(--color-ink-variant)" }}>
                            {new Date(img.created).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDelete(img.id)}
                          disabled={deletingId !== null}
                          className="sketch-btn"
                          style={{
                            padding: "8px 12px",
                            fontSize: "0.95rem",
                            boxShadow: "2px 2px 0px var(--color-ink)",
                            borderColor: "var(--color-error)",
                            color: "var(--color-error)",
                          }}
                          title="Permanently delete this generation pair"
                        >
                          {deletingId === img.id ? (
                            <>
                              <span className="sketch-spinner" style={{ width: "14px", height: "14px", borderWidth: "1.5px", marginRight: "4px" }}></span>
                              Dele...
                            </>
                          ) : (
                            "🗑️ Trash"
                          )}
                        </button>
                      </div>

                    </div>
                  ))}

                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Sketched Footer */}
      <footer className="sketch-footer" style={{ marginTop: "40px" }}>
        <p style={{ margin: 0 }}>
          Peepify Admin Dashboard &bull; Handcrafted wireframes with ✏️ and ink &bull; Powered by Google Vertex AI
        </p>
      </footer>
    </div>
  );
}
