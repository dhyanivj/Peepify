"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [referenceImage, setReferenceImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Painting pixels...");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("light");
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [isSavingToGallery, setIsSavingToGallery] = useState(false);
  const [isSavedToGallery, setIsSavedToGallery] = useState(false);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState(null);
  const [generatedId, setGeneratedId] = useState("");

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Playful hand-drawn loading phrases
  const loadingPhrases = [
    "Reading facial outlines...",
    "Scanning sketchy hair...",
    "Doodling eyes and nose...",
    "Applying Pablo Stanley lines...",
    "Shaking the ink pen...",
    "Blowing on wet paint...",
    "Finishing final outline..."
  ];

  // Set theme preference
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
  }, []);

  const toggleTheme = () => {
    const finalTheme = theme === "light" ? "dark" : "light";
    setTheme(finalTheme);
    document.documentElement.setAttribute("data-theme", finalTheme);
    localStorage.setItem("theme", finalTheme);
  };

  // Rotate loading phrases while generating
  useEffect(() => {
    let intervalId;
    if (loading) {
      let index = 0;
      setLoadingMessage(loadingPhrases[0]);
      intervalId = setInterval(() => {
        index = (index + 1) % loadingPhrases.length;
        setLoadingMessage(loadingPhrases[index]);
      }, 2000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [loading]);

  // Clean up webcam stream if active
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const fetchGallery = async () => {
    try {
      setGalleryLoading(true);
      const response = await fetch("/api/gallery");
      const data = await response.json();
      if (data.success) {
        setGallery(data.avatars || []);
      }
    } catch (err) {
      console.error("Failed to load gallery:", err);
    } finally {
      setGalleryLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const startCamera = async () => {
    setError("");
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      setError("Failed to access camera. Please check camera permissions.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg");
        setReferenceImage(base64);
        stopCamera();
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Please upload a valid image file.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("Image must be smaller than 4MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setReferenceImage(event.target.result);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleImageUpload({ target: { files: e.dataTransfer.files } });
    }
  };

  const removeReferenceImage = () => {
    setReferenceImage(null);
    setIsSavedToGallery(false);
    setIsSavingToGallery(false);
    setGeneratedId("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!referenceImage) {
      setError("A reference image is required for the Open Peeps style conversion.");
      return;
    }

    setLoading(true);
    setError("");
    setImageUrl("");
    setIsSavedToGallery(false);
    setIsSavingToGallery(false);
    setGeneratedId("");

    // Smooth scroll down to the drawing canvas on mobile screens with custom top spacing
    setTimeout(() => {
      if (canvasRef.current) {
        const yOffset = -20; // 20px custom padding offset from viewport top
        const y = canvasRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 120);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          referenceImage: referenceImage, // Base64 string
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate image. Please try again.");
      }

      setImageUrl(data.imageUrl);
      setGeneratedId(data.id);
    } catch (err) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during image generation.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `peepify-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveToGallery = async () => {
    if (!generatedId || isSavingToGallery || isSavedToGallery) return;

    setIsSavingToGallery(true);
    setError("");

    try {
      const response = await fetch("/api/gallery/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: generatedId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save to gallery. Please try again.");
      }

      setIsSavedToGallery(true);
      fetchGallery(); // Refresh polaroids instantly!
    } catch (err) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while saving to gallery.");
    } finally {
      setIsSavingToGallery(false);
    }
  };

  return (
    <>
      <header className="sketch-header">
        <div className="sketch-logo">
          <div className="sketch-logo-icon">Pf</div>
          <div className="sketch-logo-text-container">
            <h1 className="sketch-logo-text" style={{ marginBottom: "0px", lineHeight: "1" }}>Peepify</h1>
            <small style={{ fontSize: "0.85rem", color: "var(--color-ink-variant)", fontFamily: "var(--font-body)", marginTop: "2px", fontWeight: "normal" }}>by Vijay Dhyani</small>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className="sketch-circle-btn"
          aria-label="Toggle light or dark theme"
          title="Toggle Theme"
        >
          {theme === "light" ? (
            // Custom sketchy crescent moon SVG
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            // Custom sketchy sun SVG
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          )}
        </button>
      </header>

      {/* Main Grid Sketch Container */}
      <main className="sketch-container">

        {/* Left Column: Hand-drawn Input Card */}
        <section className="sketch-card" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "8px", borderBottom: "2px solid var(--color-ink)", paddingBottom: "6px" }}>Create Your Sketchy Caricature</h2>
            {/* <p style={{ fontSize: "1.1rem", color: "var(--color-ink-variant)", marginTop: "10px" }}>
              Upload a reference photo. Our system will analyze your facial traits using Gemini 2.5 Flash and draw a beautiful B&W Open Peeps character using Imagen 3!
            </p> */}
          </div>

          <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Image Upload Area */}
            <div>
              <label style={{ fontSize: "1.2rem", fontWeight: "bold", display: "block", marginBottom: "10px", fontFamily: "var(--font-header)" }}>
                Upload / capture your Photo
              </label>

              {isCameraActive ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
                  <div style={{
                    width: "100%",
                    border: "var(--border-ink)",
                    borderRadius: "12px 18px 12px 18px/18px 12px 18px 12px",
                    overflow: "hidden",
                    boxShadow: "var(--shadow-solid)",
                    backgroundColor: "#000",
                    position: "relative",
                    aspectRatio: "4/3"
                  }}>
                    <video
                      ref={videoRef}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transform: "scaleX(-1)", // Mirror camera
                        display: "block"
                      }}
                      playsInline
                      muted
                    />
                  </div>
                  <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="sketch-btn sketch-btn-filled"
                      style={{ flex: 1, height: "46px" }}
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      Take Photo
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="sketch-btn"
                      style={{ height: "46px", padding: "0 16px" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : !referenceImage ? (
                <div
                  className={`sketch-upload-zone ${isDragging ? 'drag-active' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {/* Custom sketchy upload paper plane / cloud icon */}
                  <svg viewBox="0 0 24 24" width="44" height="44" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <p style={{ fontWeight: "bold", fontSize: "1.1rem", margin: "4px 0" }}>Drag & Drop photo here</p>
                  <p style={{ fontSize: "0.95rem", color: "var(--color-ink-variant)", margin: "0" }}>— or —</p>
                  <div style={{ display: "flex", gap: "12px", width: "100%", justifyContent: "center", marginTop: "8px" }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="sketch-btn"
                      style={{ padding: "6px 14px", fontSize: "1rem" }}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      File
                    </button>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="sketch-btn"
                      style={{ padding: "6px 14px", fontSize: "1rem" }}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                        <circle cx="12" cy="13" r="4"></circle>
                      </svg>
                      Camera
                    </button>
                  </div>
                </div>
              ) : (
                <div className="sketch-upload-preview-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={referenceImage} alt="Reference" className="sketch-upload-preview" />
                  <button
                    type="button"
                    onClick={removeReferenceImage}
                    className="sketch-circle-btn"
                    style={{ position: "absolute", top: "12px", right: "12px", border: "2px solid #000", background: "#fff", color: "#000" }}
                    title="Remove Photo"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: "none" }}
              />
            </div>

            {/* Action button */}
            <button
              type="submit"
              disabled={loading || !referenceImage}
              className="sketch-btn sketch-btn-filled"
              style={{ width: "100%", height: "54px" }}
            >
              {loading ? (
                <>
                  <span className="sketch-spinner" style={{ width: "24px", height: "24px", borderWidth: "2.5px" }}></span>
                  Generating Doodle...
                </>
              ) : (
                <>
                  {/* Sketch pencil icon */}
                  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                  Draw My Avatar!
                </>
              )}
            </button>
          </form>

        </section>

        {/* Right Column: Sketch Canvas Picture Frame */}
        <section ref={canvasRef} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          <div className="sketch-canvas-frame">

            {/* Default State: No image, not loading */}
            {!loading && !imageUrl && !error && (
              <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
                <div style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50% 48% 52% 46% / 46% 52% 48% 50%",
                  border: "2.5px solid var(--color-ink)",
                  backgroundColor: "var(--color-paper)",
                  color: "var(--color-ink)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "3px 3px 0px var(--color-ink)"
                }}>
                  {/* Sketchy painting icon */}
                  <svg viewBox="0 0 24 24" width="44" height="44" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: "1.45rem", marginBottom: "8px", fontFamily: "var(--font-header)" }}>Your Canvas</h3>
                  <p style={{ fontSize: "1.1rem", color: "var(--color-ink-variant)", maxWidth: "340px", margin: "0 auto" }}>
                    Once you upload a reference photo and hit generate, your sketchy caricature doodle will display here!
                  </p>
                </div>
              </div>
            )}

            {/* Loading State with Hand-drawn Spinner and shimmer container */}
            {loading && (
              <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
                <div style={{ position: "relative", width: "72px", height: "72px" }}>
                  <span className="sketch-spinner" style={{ width: "72px", height: "72px" }}></span>
                  <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    fontSize: "1.85rem",
                    animation: "sketch-pencil-draw 2s infinite ease-in-out"
                  }}>
                    ✏️
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <h3 style={{ fontSize: "1.45rem", color: "var(--color-ink)" }} className="sketch-wiggle-hover">
                    Doodling Avatar
                  </h3>
                  <p style={{ fontSize: "1.1rem", color: "var(--color-ink-variant)", minWidth: "260px" }}>
                    {loadingMessage}
                  </p>
                </div>
                {/* Themed Open Peeps hand-sketched animated SVG silhouette */}
                <div className="sketch-shimmer-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--color-bg)" }}>
                  <svg viewBox="0 0 100 100" className="sketch-loader-peep">
                    {/* Sketched head & torso outline */}
                    <path d="M 50,22 C 38,22 34,28 34,38 C 34,44 38,48 38,52 C 35,55 30,58 20,68 C 15,73 12,82 12,88 L 88,88 C 88,82 85,73 80,68 C 70,58 65,55 62,52 C 62,48 66,44 66,38 C 66,28 62,22 50,22 Z" />
                    {/* Sketchy hair outline detail */}
                    <path d="M 36,32 C 40,26 48,25 54,25 C 60,25 63,28 65,33" />
                    {/* Dot-and-line Peep features */}
                    <circle cx="44" cy="40" r="2.5" fill="currentColor" />
                    <circle cx="56" cy="40" r="2.5" fill="currentColor" />
                    <path d="M 46,47 C 48,49 52,49 54,47" />
                  </svg>
                </div>
              </div>
            )}

            {/* Error State: Hand-drawn error box */}
            {!loading && error && (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
                <div className="sketch-error-box">
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    border: "2.5px solid var(--color-error)",
                    backgroundColor: "transparent",
                    color: "var(--color-error)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "12px"
                  }}>
                    <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </div>
                  <h3 style={{ fontSize: "1.35rem", color: "var(--color-error)", marginBottom: "8px", fontFamily: "var(--font-header)" }}>
                    Drawing Error!
                  </h3>
                  <p style={{ fontSize: "1.05rem", lineHeight: "1.4" }}>
                    {error}
                  </p>
                </div>
                <button
                  onClick={() => setError("")}
                  className="sketch-btn"
                  style={{ padding: "6px 16px" }}
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Generated Image State in a Picture Frame */}
            {!loading && imageUrl && (
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px"
              }}>
                <div style={{
                  position: "relative",
                  width: "100%",
                  height: "calc(100% - 64px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Open Peeps Avatar Doodle"
                    className="sketch-avatar-display"
                  />
                </div>

                {/* Bottom Canvas Toolbar */}
                <div className="sketch-canvas-toolbar">
                  <div className="sketch-canvas-toolbar-text-container" style={{ display: "flex", flexDirection: "column" }}>
                    <span className="sketch-canvas-toolbar-text">
                      Hope you like it :)
                    </span>
                  </div>

                  <div className="sketch-canvas-toolbar-actions">
                    <button
                      onClick={handleDownload}
                      className="sketch-btn"
                      title="Download Avatar"
                      style={{ padding: "6px 16px", fontSize: "1rem" }}
                    >
                      {/* Download sketchy icon */}
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Download
                    </button>

                    <button
                      onClick={handleSaveToGallery}
                      disabled={isSavingToGallery || isSavedToGallery}
                      className={`sketch-btn ${isSavedToGallery ? '' : 'sketch-btn-filled'}`}
                      title={isSavedToGallery ? "Saved to Gallery" : "Save to Peep Gallery"}
                      style={{
                        padding: "6px 16px",
                        fontSize: "1rem",
                        color: isSavedToGallery ? "var(--color-ink-variant)" : ""
                      }}
                    >
                      {isSavingToGallery ? (
                        <>
                          <span className="sketch-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px", marginRight: "6px", verticalAlign: "middle" }}></span>
                          Saving...
                        </>
                      ) : isSavedToGallery ? (
                        "Saved! ✓"
                      ) : (
                        <>
                          {/* Save sketchy diskette icon */}
                          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                          </svg>
                          Save to Peep Gallery
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Peep Gallery Polaroid Grid */}
        <section className="sketch-card" style={{ gridColumn: "1 / -1", marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "1.8rem", borderBottom: "2px solid var(--color-ink)", paddingBottom: "6px", fontFamily: "var(--font-header)", display: "flex", alignItems: "center", gap: "10px" }}>
              📖 The Peep Gallery
            </h2>
            <p style={{ fontSize: "1.05rem", color: "var(--color-ink-variant)", marginTop: "6px" }}>
              Here are the latest quirky characters generated by our community. Click on any Polaroid photo to view it in detail and download your favorite doodles!
            </p>
          </div>

          {galleryLoading && gallery.length === 0 ? (
            <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center", padding: "30px" }}>
              <span className="sketch-spinner" style={{ width: "24px", height: "24px", borderWidth: "2.5px" }}></span>
              <span style={{ fontSize: "1.1rem" }}>Opening the sketching folders...</span>
            </div>
          ) : gallery.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--color-ink-variant)", fontSize: "1.15rem", border: "2px dashed var(--color-ink)", borderRadius: "8px" }}>
              The archives are empty! Upload or capture a photo to draw the first Peep character and start the collection.
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
              gap: "24px",
              padding: "10px 0"
            }}>
              {gallery.map((item, idx) => {
                // Alternating tiny rotations to create a realistic hand-laid polaroid scatter!
                const rot = (idx % 3 === 0) ? "-2.5deg" : (idx % 3 === 1) ? "2deg" : "-1deg";
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedGalleryItem(item);
                    }}
                    className="sketch-wiggle-hover"
                    style={{
                      border: "var(--border-ink-thin)",
                      borderRadius: "4px",
                      padding: "10px 10px 12px 10px",
                      backgroundColor: "#ffffff", // Pure white photo card paper
                      boxShadow: "3px 3px 0px var(--color-ink)",
                      cursor: "pointer",
                      transition: "transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      transform: `rotate(${rot})`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "10px"
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/gallery/image/${item.id}?type=avatar`}
                      alt="Gallery Avatar"
                      loading="lazy"
                      style={{
                        width: "100%",
                        aspectRatio: "1/1",
                        objectFit: "contain",
                        border: "1.5px solid var(--color-ink)",
                        borderRadius: "2px",
                        backgroundColor: "#fafaf6",
                      }}
                    />
                    <span style={{
                      fontFamily: "var(--font-header)",
                      fontSize: "0.95rem",
                      color: "#000",
                      textAlign: "center",
                      display: "block",
                      letterSpacing: "-0.3px",
                      fontWeight: "bold",
                      width: "100%",
                      wordBreak: "break-word",
                      lineHeight: "1.2"
                    }}>
                      {item.funnyName}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <footer className="sketch-footer">
        <p>Handcrafted using Next.js and Vertex Imagen  by <b>Vijay Dhyani</b> <br /> <small>Inspired by Open Peeps Caricature Style by Pablo Stanley</small></p>
      </footer>

      {/* Hand-Drawn Sketchy Gallery Modal Popup */}
      {selectedGalleryItem && (
        <div
          onClick={() => setSelectedGalleryItem(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.4)", // Translucent dark overlay (felt-tip marker shadow tone)
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
          }}
        >
          {/* Modal Container */}
          <div
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking card itself
            className="sketch-card"
            style={{
              maxWidth: "460px",
              width: "100%",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              animation: "var(--motion-wiggle)", // Soft sketchy entry wiggle
              backgroundColor: "var(--color-paper)"
            }}
          >
            {/* Close Button Top Right */}
            <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px dashed var(--color-ink)", paddingBottom: "10px" }}>
              <h3 style={{ fontSize: "1.45rem", fontFamily: "var(--font-header)" }}>📖 {selectedGalleryItem.funnyName}</h3>
              <button
                onClick={() => setSelectedGalleryItem(null)}
                className="sketch-circle-btn"
                style={{ width: "32px", height: "32px", fontSize: "0.95rem" }}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Polaroid Display inside Modal */}
            <div style={{
              width: "100%",
              border: "var(--border-ink)",
              borderRadius: "12px 6px 12px 8px / 8px 12px 6px 12px",
              overflow: "hidden",
              background: "#ffffff",
              padding: "16px 16px 36px 16px",
              boxShadow: "var(--shadow-solid-hover)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative"
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/gallery/image/${selectedGalleryItem.id}?type=avatar`}
                alt="Peep avatar full view"
                style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  objectFit: "contain",
                  border: "1.5px solid var(--color-ink)",
                  borderRadius: "2px",
                  backgroundColor: "#fafaf6"
                }}
              />
              <span style={{
                fontFamily: "var(--font-header)",
                fontSize: "0.95rem",
                color: "#000",
                position: "absolute",
                bottom: "8px",
                textAlign: "center",
                display: "block",
                fontWeight: "bold"
              }}>
                Sketched on {new Date(selectedGalleryItem.updated).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* Bottom Modal Actions */}
            <div style={{ display: "flex", gap: "12px", width: "100%", justifyContent: "flex-end", marginTop: "4px" }}>
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = `/api/gallery/image/${selectedGalleryItem.id}?type=avatar`;
                  link.download = `peepify-avatar-${selectedGalleryItem.id}.jpg`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="sketch-btn sketch-btn-filled"
                style={{ flex: 1, padding: "8px 16px", fontSize: "1.05rem" }}
              >
                {/* Download icon */}
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px", verticalAlign: "middle" }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download
              </button>
              <button
                onClick={() => setSelectedGalleryItem(null)}
                className="sketch-btn"
                style={{ padding: "8px 16px", fontSize: "1.05rem" }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
