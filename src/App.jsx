import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import confetti from "canvas-confetti";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import heroImage from "./assets/hero.jpg";
import { clickCountRef, onValue, runTransaction } from "./firebase";

// Import team logos
import bears from "./assets/bears.png";
import brown from "./assets/brown.png";
import vt from "./assets/hokies.webp";
import dukes from "./assets/JMU.png";
import nu from "./assets/NU.svg";
import sc from "./assets/SC.png";
import skins from "./assets/skins.png";
import ut from "./assets/UT.png";
import uva from "./assets/UVA.png";
import w from "./assets/W.svg";
import wl from "./assets/WL.png";

// Helper to turn an import.meta.glob result into an array of URLs
const globToArray = (modules) =>
  Object.values(modules)
    .map((m) => (m && typeof m === "object" && "default" in m ? m.default : m))
    .filter(Boolean);

// Main page photo buckets
const mainPhotoBuckets = [
  globToArray(import.meta.glob("./assets/b1/*", { eager: true })),
  globToArray(import.meta.glob("./assets/b2/*", { eager: true })),
  globToArray(import.meta.glob("./assets/b3/*", { eager: true }))
];

// Groomsmen photo buckets
const harryPhotos = globToArray(import.meta.glob("./assets/harry/*", { eager: true }));
const chuckPhotos = globToArray(import.meta.glob("./assets/chuck/*", { eager: true }));
const jackoPhotos = globToArray(import.meta.glob("./assets/jacko/*", { eager: true }));
const colePhotos = globToArray(import.meta.glob("./assets/cole/*", { eager: true }));
const henryPhotos = globToArray(import.meta.glob("./assets/henry/*", { eager: true }));
const oliPhotos = globToArray(import.meta.glob("./assets/oli/*", { eager: true }));
const wyattPhotos = globToArray(import.meta.glob("./assets/wyatt/*", { eager: true }));
const laurenPhotos = globToArray(import.meta.glob("./assets/lauren/*", { eager: true }));
const courtneyPhotos = globToArray(import.meta.glob("./assets/courtney/*", { eager: true }));
const addisonPhotos = globToArray(import.meta.glob("./assets/addison/*", { eager: true }));
const lilyPhotos = globToArray(import.meta.glob("./assets/lily/*", { eager: true }));
const mariaPhotos = globToArray(import.meta.glob("./assets/maria/*", { eager: true }));
const maddiePhotos = globToArray(import.meta.glob("./assets/maddie/*", { eager: true }));

// Toggle RSVP form visibility (set to true when invites are sent)
const RSVP_ENABLED = false;

// COLORS — cream + gold (pairs well with school patterns)
const COLORS = {
  bg: "#FAF8F3",
  cardBg: "#FFFFFF",
  primary: "#E8DDD0",
  secondary: "#D4C5B2",
  accent: "#C5A55A",
  darkText: "#2C2825",
  mediumText: "#6B6360",
  lightText: "#9A9490",
  border: "#E0DBD6",
  groomAccent: "#4A4543",
  brideAccent: "#7A6F68",
  highlight: "#C5A55A",
  cream: "#F5F0EA",
  tennesseeOrange: "#FF8200",
  tennesseeWhite: "#FFFFFF",
  indianaCrimson: "#990000",
  indianaWhite: "#FFFFFF"
};

// FIXED CARD DIMENSIONS
const CARD_HEIGHT_DESKTOP = 380;
const CARD_HEIGHT_MOBILE = 400;
const PHOTO_WIDTH_DESKTOP = 280;
const PHOTO_WIDTH_MOBILE = 120;

// FIXED content width
const CONTENT_WIDTH = 900;

// Hook for mobile detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 960);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
};

// Simple schedule row — clean two-column layout
const ScheduleRow = ({ time, event, detail, isLast, isMobile }) => (
  <div style={{
    display: "flex",
    alignItems: "baseline",
    padding: "0.8rem 0",
    borderBottom: isLast ? "none" : `1px solid ${COLORS.border}`
  }}>
    <div style={{ width: isMobile ? 80 : 100, flexShrink: 0, fontSize: isMobile ? "0.85rem" : "0.95rem", color: COLORS.lightText }}>
      {time}
    </div>
    <div style={{ flex: 1 }}>
      <span style={{ fontSize: isMobile ? "0.9rem" : "1rem", fontWeight: 500, color: COLORS.darkText }}>{event}</span>
      {detail && <span style={{ fontSize: "0.8rem", color: COLORS.lightText, marginLeft: "0.5rem" }}>— {detail}</span>}
    </div>
  </div>
);

// Stat cell component
const StatCell = ({ label, value, color }) => (
  <div
    style={{
      textAlign: "center",
      background: COLORS.cream,
      padding: "0.6rem 0.4rem",
      borderRadius: 10,
      border: `1px solid ${COLORS.border}`
    }}
  >
    <div style={{ fontSize: "0.7rem", color: COLORS.lightText, marginBottom: "0.2rem", textTransform: "uppercase" }}>
      {label}
    </div>
    <div style={{ fontSize: "1rem", fontWeight: 600, color }}>{value}</div>
  </div>
);

// Tennessee Checkerboard Pattern (left side)
const TennesseeCheckerboard = () => (
  <div
    style={{
      position: "fixed",
      left: 0,
      top: 0,
      bottom: 0,
      width: "calc((100vw - 900px) / 2)",
      zIndex: 0,
      opacity: 0.4,
      backgroundImage: `
        linear-gradient(45deg, ${COLORS.tennesseeOrange} 25%, transparent 25%),
        linear-gradient(-45deg, ${COLORS.tennesseeOrange} 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, ${COLORS.tennesseeOrange} 75%),
        linear-gradient(-45deg, transparent 75%, ${COLORS.tennesseeOrange} 75%)
      `,
      backgroundColor: COLORS.tennesseeWhite,
      backgroundSize: "40px 40px",
      backgroundPosition: "0 0, 0 20px, 20px -20px, -20px 0px"
    }}
  />
);

// Indiana Candy Stripe Pattern (right side)
const IndianaCandyStripe = () => (
  <div
    style={{
      position: "fixed",
      right: 0,
      top: 0,
      bottom: 0,
      width: "calc((100vw - 900px) / 2)",
      zIndex: 0,
      opacity: 0.4,
      backgroundImage: `repeating-linear-gradient(
        90deg,
        ${COLORS.indianaCrimson},
        ${COLORS.indianaCrimson} 20px,
        ${COLORS.indianaWhite} 20px,
        ${COLORS.indianaWhite} 40px
      )`
    }}
  />
);

export default function App() {
  const [tab, setTab] = useState("main");
  const [buttonCount, setButtonCount] = useState(0);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showPatterns, setShowPatterns] = useState(false);
  const isMobile = useIsMobile();

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  // Countdown timer
  useEffect(() => {
    const weddingDate = new Date("2026-10-24T16:00:00");
    const update = () => {
      const diff = weddingDate - new Date();
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  // Show background patterns only AFTER the hero section
  useEffect(() => {
    const onScroll = () => {
      const heroHeight = window.innerHeight; // hero is minHeight: 100vh
      const y = window.scrollY || 0;
      setShowPatterns(y >= heroHeight - 1);
    };

    onScroll(); // initialize
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  // Sync click count with Firebase (real-time across all devices)
  useEffect(() => {
    const unsubscribe = onValue(clickCountRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null) setButtonCount(val);
    });
    return () => unsubscribe();
  }, []);

  const triggerConfetti = () => {
    const count = 200;
    const defaults = { origin: { y: 0.7 }, zIndex: 9999 };
    const fire = (ratio, opts) =>
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * ratio),
        colors: [COLORS.accent, COLORS.highlight, COLORS.primary, COLORS.secondary]
      });
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  const handleButtonClick = () => {
    runTransaction(clickCountRef, (current) => (current || 0) + 1);
    triggerConfetti();
  };

  const downloadCalendarEvent = () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Ben & Emily Wedding//EN
BEGIN:VEVENT
DTSTART:20261024T170000
DTEND:20261024T230000
SUMMARY:Ben & Emily's Wedding
DESCRIPTION:Ceremony at Christ Episcopal Church, 120 W. High Street. Reception at 241 Rosemont Farm Way.
LOCATION:120 W. High Street, Charlottesville, VA 22902
URL:${window.location.href}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ben-emily-wedding.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setTab(id)}
      style={{
        padding: isMobile ? "0.6rem 0.7rem" : "0.7rem 1.2rem",
        border: "none",
        background: tab === id ? COLORS.primary : "transparent",
        color: tab === id ? COLORS.darkText : COLORS.mediumText,
        fontSize: isMobile ? "0.75rem" : "0.9rem",
        fontWeight: tab === id ? 500 : 400,
        borderRadius: 8,
        cursor: "pointer",
        transition: "all 0.2s ease",
        whiteSpace: "nowrap"
      }}
    >
      {label}
    </button>
  );

  // Render tab content based on current tab
  const renderTabContent = () => {
    switch (tab) {
      case "main":
        return (
          <MainTab
            photoBuckets={mainPhotoBuckets}
            buttonCount={buttonCount}
            handleButtonClick={handleButtonClick}
            downloadCalendarEvent={downloadCalendarEvent}
            isMobile={isMobile}
          />
        );
      case "rsvp":
        return <RSVPTab isMobile={isMobile} />;
      case "info":
        return <InfoTab isMobile={isMobile} />;
      case "party":
        return <WeddingPartyTab isMobile={isMobile} />;
      case "registry":
        return <RegistryTab isMobile={isMobile} />;
      default:
        return null;
    }
  };

  // Centered content wrapper style - THE KEY FIX
  const centeredContentStyle = {
    width: isMobile ? "100%" : CONTENT_WIDTH,
    marginLeft: "auto",
    marginRight: "auto",
    boxSizing: "border-box"
  };

  return (
    <>
      {/* GLOBAL STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Lora:wght@400;500;600&display=swap');

        .press-button {
          transition: transform 0.08s ease, box-shadow 0.08s ease;
        }
        .press-button:active {
          transform: translateY(2px);
          box-shadow: 0 1px 4px rgba(0,0,0,0.08) !important;
        }
        
        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
        }
        
        html {
          overflow-y: scroll;
        }
        
        body {
          background: ${COLORS.bg};
          overflow-x: hidden;
        }
      `}</style>

      {/* BACKGROUND PATTERNS - Only show on desktop AND only after hero */}
      {!isMobile && (
        <>
          <TennesseeCheckerboard />
          <IndianaCandyStripe />
        </>
      )}

      {/* MAIN WRAPPER */}
      <div
        style={{
          fontFamily: "'Lora', Georgia, serif",
          lineHeight: 1.7,
          minHeight: "100vh",
          width: "100%",
          position: "relative",
          zIndex: 1
        }}
      >
        <Analytics />
        <SpeedInsights />

        {/* HERO - Full width */}
        <section
          style={{
            width: "100%",
            minHeight: "100vh",
            position: "relative",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            background: COLORS.bg // <-- masks the patterns
          }}
        >
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${heroImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              y: heroY,
              opacity: heroOpacity
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, rgba(44,36,32,0.35), rgba(44,36,32,0.55))"
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              position: "relative",
              zIndex: 1,
              textAlign: "center",
              padding: "2rem",
              width: "100%",
              maxWidth: 900
            }}
          >
            {/* NAMES - Always on one line, scales with viewport */}
            <motion.h1
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              style={{
                fontSize: "min(14vw, 5.5rem)",
                marginBottom: "1rem",
                fontWeight: 300,
                letterSpacing: "0.08em",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                textShadow: "0 2px 30px rgba(0,0,0,0.25)",
                whiteSpace: "nowrap"
              }}
            >
              Ben & Emily
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.9 }}
              style={{
                fontSize: "min(4vw, 1.5rem)",
                marginBottom: "2rem",
                fontWeight: 300,
                letterSpacing: "0.2em",
                textTransform: "uppercase"
              }}
            >
              October 24, 2026
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.9 }}
              style={{
                fontSize: "min(3vw, 1.2rem)",
                fontWeight: 300,
                marginBottom: "3rem",
                letterSpacing: "0.1em",
                opacity: 0.9
              }}
            >
              Charlottesville, Virginia
            </motion.div>

            {/* COUNTDOWN - Always on one line */}
            <div
              style={{
                display: "flex",
                gap: "min(3vw, 1.2rem)",
                justifyContent: "center",
                marginBottom: "3rem",
                flexWrap: "nowrap"
              }}
            >
              {[
                { v: countdown.days, l: "Days" },
                { v: countdown.hours, l: "Hours" },
                { v: countdown.minutes, l: "Min" },
                { v: countdown.seconds, l: "Sec" }
              ].map((x, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(1px)",
                    padding: "min(2vw, 1rem) min(3vw, 1.4rem)",
                    borderRadius: 12,
                    minWidth: "min(15vw, 75px)",
                    border: "1px solid rgba(255,255,255,0.15)"
                  }}
                >
                  <div style={{ fontSize: "min(5vw, 1.8rem)", fontWeight: 300, fontFamily: "'Cormorant Garamond', serif" }}>
                    {x.v}
                  </div>
                  <div style={{ fontSize: "min(2vw, 0.65rem)", opacity: 0.85, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {x.l}
                  </div>
                </div>
              ))}
            </div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.9 }}
              onClick={() => document.getElementById("content")?.scrollIntoView({ behavior: "smooth" })}
              style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(1px)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "white",
                padding: "0.9rem 2.2rem",
                fontSize: "0.9rem",
                borderRadius: 50,
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontWeight: 400,
                letterSpacing: "0.15em",
                textTransform: "uppercase"
              }}
            >
              Explore
            </motion.button>
          </motion.div>
        </section>

        {/* TAB BAR - Full width background, centered content */}
        <div
          id="content"
          style={{
            width: "100%",
            position: "sticky",
            top: 0,
            background: `rgba(253, 251, 248, 0.97)`,
            backdropFilter: "blur(1px)",
            borderBottom: `1px solid ${COLORS.border}`,
            zIndex: 100
          }}
        >
          <div
            style={{
              ...centeredContentStyle,
              padding: isMobile ? "0.75rem 1rem" : "1rem 2rem"
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "0.3rem",
                background: COLORS.cream,
                padding: "0.4rem",
                borderRadius: 10,
                justifyContent: "center",
                flexWrap: "wrap",
                border: `1px solid ${COLORS.border}`
              }}
            >
              <TabButton id="main" label="Home" />
              <TabButton id="rsvp" label="RSVP" />
              <TabButton id="info" label="Details" />
              <TabButton id="party" label="Wedding Party" />
              <TabButton id="registry" label="Registry" />
            </div>
          </div>
        </div>

        {/* CONTENT AREA - CENTERED with margin auto */}
        <div
          style={{
            ...centeredContentStyle,
            padding: isMobile ? "2rem 1rem" : "3rem 2rem",
            minHeight: "70vh",
            background: COLORS.bg
          }}
        >
          {renderTabContent()}
        </div>

        {/* FOOTER - Full width background */}
        <footer
          style={{
            width: "100%",
            textAlign: "center",
            padding: "4rem 1.5rem",
            background: COLORS.primary,
            color: COLORS.darkText
          }}
        >
          <p style={{ fontSize: "1.2rem", marginBottom: "0.75rem", fontWeight: 300, fontFamily: "'Cormorant Garamond', serif" }}>
            We can't wait to celebrate with you
          </p>
          <p style={{ fontSize: "0.85rem", opacity: 0.6, marginTop: "1.5rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Ben & Emily | October 24, 2026
          </p>
        </footer>
      </div>
    </>
  );
}

/* ============================================
   MAIN TAB
   ============================================ */

function MainTab({ photoBuckets, buttonCount, handleButtonClick, downloadCalendarEvent, isMobile }) {
  const [indices, setIndices] = useState(photoBuckets.map(() => 0));

  const cycle = (slot) =>
    setIndices((prev) =>
      prev.map((v, i) => (i === slot && photoBuckets[slot].length > 0 ? (v + 1) % photoBuckets[slot].length : v))
    );

  return (
    <>
      {/* Page Title */}
      <h2 style={{
        textAlign: "center",
        fontSize: "min(10vw, 3.5rem)",
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontWeight: 300,
        fontStyle: "italic",
        color: COLORS.darkText,
        marginBottom: "0.3rem",
        letterSpacing: "0.02em"
      }}>
        Ben & Emily
      </h2>
      <p style={{
        textAlign: "center",
        fontSize: "min(3vw, 0.8rem)",
        color: COLORS.lightText,
        textTransform: "uppercase",
        letterSpacing: "0.2em",
        marginBottom: "2rem"
      }}>
        October 24, 2026 &nbsp;&middot;&nbsp; Charlottesville, VA
      </p>

      {/* Photo Grid */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "1.2rem", marginBottom: "2.5rem" }}>
        {photoBuckets.map((bucket, i) => {
          const hasPhotos = bucket.length > 0;
          const src = hasPhotos ? bucket[indices[i] % bucket.length] : undefined;
          return (
            <motion.div
              key={`${i}-${indices[i]}`}
              onClick={() => hasPhotos && cycle(i)}
              initial={{ opacity: 0.2 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                borderRadius: 14,
                overflow: "hidden",
                aspectRatio: "4/5",
                cursor: hasPhotos ? "pointer" : "default",
                background: hasPhotos ? "transparent" : COLORS.cream,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 20px rgba(44,36,32,0.08)",
                border: `1px solid ${COLORS.border}`
              }}
            >
              {src ? (
                <img src={src} alt={`Story ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: i === 2 ? "40% center" : "center" }} />
              ) : (
                <span style={{ color: COLORS.lightText, fontSize: "0.85rem", fontStyle: "italic" }}>Add photos to assets/b{i + 1}</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Story Text */}
      <div style={{ padding: isMobile ? "1rem 0.5rem" : "1.5rem 2rem", marginBottom: "2rem" }}>
        <p style={{ fontSize: isMobile ? "0.85rem" : "0.9rem", lineHeight: 1.8, color: COLORS.mediumText, textAlign: "center", marginBottom: "0.8rem" }}>
          Emily and Ben met on a crisp Halloween night in Atlanta — she as Padme, he as Anakin — two characters whose destinies were always intertwined. Since then, they've moved to New York City to build a life together on the Upper East Side.
        </p>
        <p style={{ fontSize: isMobile ? "0.85rem" : "0.9rem", lineHeight: 1.8, color: COLORS.mediumText, textAlign: "center" }}>
          Through every move, challenge, and adventure, their connection has only deepened. Now, we're ready to celebrate this next chapter with the people who mean the most to us!
        </p>
      </div>

      {/* Save the Date */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <button
          className="press-button"
          onClick={downloadCalendarEvent}
          style={{
            background: COLORS.accent,
            color: "#FFFFFF",
            border: "none",
            padding: "0.75rem 1.8rem",
            fontSize: "0.85rem",
            fontWeight: 500,
            borderRadius: 50,
            cursor: "pointer",
            boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
            letterSpacing: "0.05em"
          }}
        >
          Add to Calendar
        </button>
      </div>

      {/* Excitement Button */}
      <div style={{ textAlign: "center", padding: isMobile ? "1.5rem" : "2rem" }}>
        <button
          className="press-button"
          onClick={handleButtonClick}
          style={{
            background: COLORS.accent,
            color: "#FFFFFF",
            border: "none",
            padding: "0.75rem 1.8rem",
            fontSize: "0.95rem",
            fontWeight: 500,
            borderRadius: 50,
            cursor: "pointer",
            boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
            marginBottom: "0.6rem",
            letterSpacing: "0.05em"
          }}
        >
          Can't Wait!
        </button>
        <div style={{ fontSize: "0.8rem", color: COLORS.lightText }}>{buttonCount.toLocaleString()} clicks</div>
      </div>
    </>
  );
}

/* ============================================
   RSVP TAB
   ============================================ */

function RSVPTab({ isMobile }) {
  if (!RSVP_ENABLED) {
    return (
      <>
        <h2 style={{ textAlign: "center", fontSize: isMobile ? "2rem" : "2.8rem", marginBottom: "0.5rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: COLORS.darkText }}>
          RSVP
        </h2>
        <div style={{ background: COLORS.cardBg, padding: isMobile ? "2rem" : "3rem", borderRadius: 14, textAlign: "center", boxShadow: "0 2px 15px rgba(44,36,32,0.05)", border: `1px solid ${COLORS.border}`, marginTop: "2rem" }}>
          <p style={{ fontSize: "1.3rem", color: COLORS.mediumText, fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}>
            Coming Soon
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 style={{ textAlign: "center", fontSize: isMobile ? "2rem" : "2.8rem", marginBottom: "0.5rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: COLORS.darkText }}>
        RSVP
      </h2>
      <p style={{ textAlign: "center", fontSize: "1rem", marginBottom: "2.5rem", color: COLORS.mediumText }}>
        Please let us know if you can join us
      </p>

      <div style={{ background: COLORS.cardBg, padding: isMobile ? "1.5rem" : "2.5rem", borderRadius: 14, textAlign: "center", boxShadow: "0 2px 15px rgba(44,36,32,0.05)", border: `1px solid ${COLORS.border}` }}>
        <p style={{ marginBottom: "1.5rem", fontSize: "1rem", color: COLORS.mediumText }}>
          Click below to open our RSVP form:
        </p>
        <a
          href="https://forms.gle/9U5nv3R1hasEXZYJA"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            background: COLORS.accent,
            color: "white",
            padding: "0.9rem 2.5rem",
            fontSize: "0.95rem",
            fontWeight: 500,
            borderRadius: 50,
            textDecoration: "none",
            transition: "all 0.3s ease"
          }}
        >
          Open RSVP Form
        </a>
        <p style={{ marginTop: "1.5rem", fontSize: "0.9rem", color: COLORS.lightText }}>
          Please respond by September 1, 2026
        </p>
      </div>
    </>
  );
}

/* ============================================
   INFO TAB
   ============================================ */

function InfoTab({ isMobile }) {
  const cardStyle = { background: COLORS.cardBg, padding: isMobile ? "1.5rem" : "2rem", borderRadius: 14, marginBottom: "1.5rem", boxShadow: "0 2px 15px rgba(44,36,32,0.05)", border: `1px solid ${COLORS.border}` };
  const sectionTitle = (text) => (
    <h3 style={{ fontSize: "1.4rem", marginBottom: "1.2rem", textAlign: "center", color: COLORS.darkText, fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>
      {text}
    </h3>
  );

  return (
    <>
      <h2 style={{ textAlign: "center", fontSize: isMobile ? "2rem" : "2.8rem", marginBottom: "0.5rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: COLORS.darkText }}>
        Wedding Details
      </h2>
      <p style={{ textAlign: "center", fontSize: "1rem", marginBottom: "2.5rem", color: COLORS.mediumText }}>
        Everything you need to know
      </p>

      {/* Weekend Schedule */}
      <div style={cardStyle}>
        <h3 style={{
          fontSize: isMobile ? "1.8rem" : "2.2rem",
          fontWeight: 300,
          color: COLORS.darkText,
          fontFamily: "'Cormorant Garamond', serif",
          textAlign: "center",
          fontStyle: "italic",
          marginBottom: "0.3rem"
        }}>
          Weekend Schedule
        </h3>
        <div style={{ width: 50, height: 1, background: COLORS.accent, margin: "0 auto 2rem" }} />

        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          {/* Friday */}
          <h4 style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: COLORS.accent,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            marginBottom: "0.5rem"
          }}>
            Friday, October 23
          </h4>

          <ScheduleRow time="9:00 PM" event="Welcome Party" detail="Farmington Country Club" isLast isMobile={isMobile} />

          <div style={{ margin: "1.5rem 0", height: 1, background: COLORS.border }} />

          {/* Saturday */}
          <h4 style={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: COLORS.accent,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            marginBottom: "0.5rem"
          }}>
            Saturday, October 24
          </h4>

          <ScheduleRow time="5:00 PM" event="Ceremony" detail="Christ Episcopal Church" isMobile={isMobile} />
          <ScheduleRow time="6:30 PM" event="Cocktail Hour" isMobile={isMobile} />
          <ScheduleRow time="7:30 PM" event="Reception & Dinner" isMobile={isMobile} />
          <ScheduleRow time="11:00 PM" event="Late Night" isLast isMobile={isMobile} />
        </div>
      </div>

      {/* Shuttle Information */}
      <div style={cardStyle}>
        {sectionTitle("Shuttle Information")}
        <p style={{ textAlign: "center", fontSize: "1.1rem", color: COLORS.mediumText, fontFamily: "'Cormorant Garamond', serif" }}>
          Coming Soon
        </p>
      </div>

      {/* Travel & Hotels */}
      <div style={cardStyle}>
        {sectionTitle("Travel & Stay")}
        <div style={{ lineHeight: 1.8, color: COLORS.mediumText, fontSize: "0.95rem" }}>
          <p style={{ marginBottom: "0.8rem" }}><strong style={{ color: COLORS.darkText }}>Hotels with Room Blocks:</strong></p>
          <ul style={{ paddingLeft: "1.5rem", marginBottom: "1.2rem" }}>
            <li style={{ marginBottom: "0.4rem" }}>
              <a href="https://www.reservationcounter.com/hotels/show/5fa6aba/boars-head-resort-charlottesville-virginia/" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.primary, textDecoration: "underline" }}>
                <strong>Boars Head Resort</strong>
              </a> — More details to follow.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              <strong>The Draftsman</strong> — Courtesy block available (10 rooms). More details to follow.
            </li>
            <li>
              <strong>English Inn</strong> — Rooms available, details coming soon.
            </li>
          </ul>

          <p style={{ marginBottom: "0.8rem" }}><strong style={{ color: COLORS.darkText }}>Other Hotel Options:</strong></p>
          <p style={{ fontSize: "0.85rem", color: COLORS.lightText, marginBottom: "0.8rem", fontStyle: "italic" }}>
            Please note: we do not have a wedding block at these hotels. Book directly at general rates.
          </p>
          <ul style={{ paddingLeft: "1.5rem", marginBottom: "1.2rem" }}>
            <li>
              <a href="https://www.hilton.com/en/hotels/chogcgu-graduate-charlottesville/" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.primary, textDecoration: "underline" }}>
                The Graduate
              </a>
            </li>
          </ul>

          <p>
            <strong style={{ color: COLORS.darkText }}>Getting There:</strong><br />
            Charlottesville-Albemarle Airport (CHO) is 20 minutes from downtown.
          </p>
        </div>
      </div>

      {/* Things to Do */}
      <div style={cardStyle}>
        {sectionTitle("Things to Do in Charlottesville")}
        <p style={{ textAlign: "center", fontSize: "0.95rem", color: COLORS.mediumText, marginBottom: "1.5rem" }}>
          Make a weekend of it! Here are some of our favorite spots.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem" }}>
          {/* Dining */}
          <div style={{ background: COLORS.cream, borderRadius: 12, padding: "1.2rem", border: `1px solid ${COLORS.border}` }}>
            <h4 style={{ fontSize: "1rem", fontWeight: 600, color: COLORS.darkText, marginBottom: "0.6rem" }}>Dining</h4>
            <ul style={{ paddingLeft: "1.2rem", fontSize: "0.9rem", color: COLORS.mediumText, lineHeight: 1.9 }}>
              <li>The Ivy Inn</li>
              <li>Fleurie</li>
              <li>The Alley Light</li>
              <li>Brasserie Saison</li>
              <li>MarieBette Cafe & Bakery</li>
              <li>Public Fish & Oyster</li>
            </ul>
          </div>

          {/* Drinks */}
          <div style={{ background: COLORS.cream, borderRadius: 12, padding: "1.2rem", border: `1px solid ${COLORS.border}` }}>
            <h4 style={{ fontSize: "1rem", fontWeight: 600, color: COLORS.darkText, marginBottom: "0.6rem" }}>Drinks & Wine</h4>
            <ul style={{ paddingLeft: "1.2rem", fontSize: "0.9rem", color: COLORS.mediumText, lineHeight: 1.9 }}>
              <li>King Family Vineyards</li>
              <li>Pippin Hill Farm & Vineyards</li>
              <li>Early Mountain Vineyards</li>
              <li>The Whiskey Jar</li>
              <li>Three Notch'd Brewing</li>
            </ul>
          </div>

          {/* Shopping */}
          <div style={{ background: COLORS.cream, borderRadius: 12, padding: "1.2rem", border: `1px solid ${COLORS.border}` }}>
            <h4 style={{ fontSize: "1rem", fontWeight: 600, color: COLORS.darkText, marginBottom: "0.6rem" }}>Shopping</h4>
            <ul style={{ paddingLeft: "1.2rem", fontSize: "0.9rem", color: COLORS.mediumText, lineHeight: 1.9 }}>
              <li>Downtown Mall (pedestrian mall)</li>
              <li>Barracks Road Shopping Center</li>
              <li>Darling Boutique</li>
              <li>Caspari</li>
            </ul>
          </div>

          {/* Sightseeing */}
          <div style={{ background: COLORS.cream, borderRadius: 12, padding: "1.2rem", border: `1px solid ${COLORS.border}` }}>
            <h4 style={{ fontSize: "1rem", fontWeight: 600, color: COLORS.darkText, marginBottom: "0.6rem" }}>Things to See</h4>
            <ul style={{ paddingLeft: "1.2rem", fontSize: "0.9rem", color: COLORS.mediumText, lineHeight: 1.9 }}>
              <li>UVA Campus & The Rotunda</li>
              <li>Monticello</li>
              <li>Carter Mountain Orchard</li>
              <li>Shenandoah National Park</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dress Code */}
      <div style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`, padding: isMobile ? "1.5rem" : "2rem", borderRadius: 14, textAlign: "center", border: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontSize: "1.4rem", marginBottom: "0.6rem", fontWeight: 400, fontFamily: "'Cormorant Garamond', serif", color: COLORS.darkText }}>
          Dress Code
        </h3>
        <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: COLORS.darkText }}>
          Black Tie Optional<br />
          <span style={{ fontSize: "0.9rem", color: COLORS.mediumText }}>The reception will be outdoors in a field on grass — please plan footwear accordingly!</span>
        </p>
      </div>
    </>
  );
}

/* ============================================
   REGISTRY TAB
   ============================================ */

function RegistryTab({ isMobile }) {
  const registries = [
    { name: "Crate & Barrel", url: "https://www.crateandbarrel.com/gift-registry/emily-collins/r7479049", icon: "C" }
  ];

  return (
    <>
      <h2 style={{ textAlign: "center", fontSize: isMobile ? "2rem" : "2.8rem", marginBottom: "0.5rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: COLORS.darkText }}>
        Registry
      </h2>
      <p style={{ textAlign: "center", fontSize: "1rem", marginBottom: "2.5rem", color: COLORS.mediumText }}>
        Your presence is the greatest gift
      </p>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "1.2rem", marginBottom: "2rem" }}>
        {registries.map((r) => (
          <a
            key={r.name}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              background: COLORS.cardBg,
              padding: "1.5rem 1rem",
              borderRadius: 14,
              textAlign: "center",
              textDecoration: "none",
              color: COLORS.darkText,
              border: `1px solid ${COLORS.border}`,
              transition: "all 0.3s ease",
              boxShadow: "0 2px 15px rgba(44,36,32,0.05)"
            }}
          >
            <div style={{ 
              fontSize: "2rem", 
              marginBottom: "0.8rem", 
              width: 60, 
              height: 60, 
              borderRadius: "50%", 
              background: COLORS.cream, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              margin: "0 auto 0.8rem",
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              color: COLORS.primary
            }}>
              {r.icon}
            </div>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "0.4rem", fontWeight: 500, fontFamily: "'Cormorant Garamond', serif" }}>{r.name}</h3>
            <p style={{ fontSize: "0.85rem", color: COLORS.lightText }}>Click to view</p>
          </a>
        ))}
      </div>

      <div style={{ background: COLORS.cardBg, padding: isMobile ? "1.5rem" : "2rem", borderRadius: 14, textAlign: "center", borderTop: `4px solid ${COLORS.accent}`, boxShadow: "0 2px 15px rgba(44,36,32,0.05)", border: `1px solid ${COLORS.border}` }}>
        <p style={{ fontSize: "1rem", color: COLORS.mediumText, lineHeight: 1.8 }}>
          <strong style={{ color: COLORS.primary, fontSize: "1.1rem" }}>A Note from Us</strong><br /><br />
          The most important gift is your presence on our special day. If you'd still like to give something, we'd be grateful for contributions toward our honeymoon adventure!
        </p>
      </div>
    </>
  );
}


/* ============================================
   WEDDING PARTY TAB - FULLY PROPORTIONAL SCALING
   Photo maintains 4:5 aspect ratio at all sizes
   ============================================ */

function WeddingPartyTab({ isMobile }) {
  const groomsmen = [
    { frontName: "Harry", backName: "Harry", relation: "Brother", photos: harryPhotos, role: "Best Man", maxBench: "175 lbs", fortyYard: "4.95s", handicap: "19.0", relationshipStatus: "Taken", currentCity: "Williamsburg, NY", college: "Northwestern University", collegeLogo: nu, footballTeam: "Cleveland Browns", footballLogo: brown, comment: "Let's hope Harry shows up on time to the ceremony." },
    { frontName: "Chuck", backName: "Chuck", relation: "Brother", photos: chuckPhotos, role: "Groomsman", maxBench: "135 lbs", fortyYard: "5.4s", handicap: "13.5", relationshipStatus: "Taken", currentCity: "Chicago, IL", college: "University of Wisconsin", collegeLogo: w, footballTeam: "Chicago Bears", footballLogo: bears, comment: "Known for his inconsistency off the tee. Keep your eyes peeled when Chuck hits the dance floor." },
    { frontName: "Jacko", backName: "Jacko", relation: "Brother", photos: jackoPhotos, role: "Groomsman", maxBench: "185 lbs", fortyYard: "5.8s", handicap: "20.0", relationshipStatus: "Single", currentCity: "Washington DC", college: "University of Virginia", collegeLogo: uva, footballTeam: "The Hokies", footballLogo: vt, comment: "The most controversial character in the lineup. Look for Jacko on stage for the late night." },
    { frontName: "Cole Dickinson", backName: "Cole", relation: "Friend", photos: colePhotos, role: "Groomsman", maxBench: "285 lbs", fortyYard: "4.9s", handicap: "9.5", relationshipStatus: "Married", currentCity: "Charleston, SC", college: "University of South Carolina", collegeLogo: sc, footballTeam: "Washington Football Team", footballLogo: skins, comment: "It's too Cole for my Dickinson." },
    { frontName: "Henry Kreienbaum", backName: "Henry", relation: "Friend", photos: henryPhotos, role: "Groomsman", maxBench: "265 lbs", fortyYard: "5.3s", handicap: "15.0", relationshipStatus: "Taken", currentCity: "Atlanta, GA", college: "James Madison University", collegeLogo: dukes, footballTeam: "Washington Commanders", footballLogo: skins, comment: "Don't ask this guy about Nascar." },
    { frontName: "Oliver", backName: "Oliver", relation: "Friend", photos: oliPhotos, role: "Groomsman", maxBench: "255 lbs", fortyYard: "4.6s", handicap: "22.0", relationshipStatus: "Taken", currentCity: "New York, NY", college: "Washington & Lee University", collegeLogo: wl, footballTeam: "Washington Redskins", footballLogo: skins, comment: "Can I get a roll tide." },
    { frontName: "Wyatt", backName: "Wyatt", relation: "Brother-in-law", photos: wyattPhotos, role: "Groomsman", maxBench: "225 lbs", fortyYard: "5.5s", handicap: "8.0", relationshipStatus: "Single", currentCity: "Knoxville, TN", college: "University of Tennessee", collegeLogo: ut, footballTeam: "The Vols", footballLogo: ut, comment: "Fill in description." }
  ];

  const bridesmaids = [
    { frontName: "Addison Collins", backName: "Addison", relation: "Cousin", photos: addisonPhotos, role: "Maid of Honor", currentCity: "Atlanta, GA",
        college: "Wake Forest University", favoriteDrink: "Gin & Tonic", danceFloorSong: "Don't Stop Me Now by Queen",
        funFact: "Emily and Addison made a pact that they would be each others MOHs when they were 12" },
    { frontName: "Lauren Turnbull", backName: "Lauren", relation: "Friend", photos: laurenPhotos, role: "Bridesmaid", currentCity: "Nashville, TN",
        college: "University of Tennessee | Vanderbilt | Belmont College of Medicine", favoriteDrink: "Pinot Grigio", danceFloorSong: "Valerie by Amy Winehouse",
        funFact: "Emily and Lauren met in their first class freshman year of college." },
    { frontName: "Madeline Brookshire", backName: "Maddie", relation: "Friend", photos: maddiePhotos, role: "Bridesmaid", currentCity: "Washington DC",
        college: "University of Tennessee | Lincoln Memorial University - Duncan School of Law", favoriteDrink: "Prosecco", danceFloorSong: "It's Not Living If It's Not Without You by the 1975",
        funFact: "Emily and Maddie met in 8th grade on a field trip in DC" },
    { frontName: "Courtney Yarbrough", backName: "Courtney", relation: "Friend", photos: courtneyPhotos, role: "Bridesmaid", currentCity: "Pella, IA",
        college: "University of Tennessee | UT Chattanooga", favoriteDrink: "Spicy Margarita", danceFloorSong: "Boogie Shoes by KC & the Sunshine Band",
        funFact: "Emily and Courtney were random roommates in South Carrick, but they quickly became the closest of friends that year!" },
    { frontName: "Maria Urias Thompson", backName: "Maria", relation: "Friend", photos: mariaPhotos, role: "Bridesmaid", currentCity: "Nashville, TN",
        college: "University of Tennessee | Vanderbilt", favoriteDrink: "Aperol Spritz", danceFloorSong: "Believe by Cher",
        funFact: "Emily and Maria met in third grade and became true friends in high school when they worked at the YMCA together" },
    { frontName: "Lilly Parker", backName: "Lilly", relation: "Friend", photos: lilyPhotos, role: "Bridesmaid", currentCity: "Chapel Hill, NC",
        college: "Wake Forest University | University of North Carolina", favoriteDrink: "Mojito", danceFloorSong: "UCLA",
        funFact: "Emily and I were roommates in ATL, taught at the same school, and were foster moms to 4 animals together (one being a 15 year old cat named Baby Girl)!" }
  ];

  return (
    <>
      <h2 style={{ textAlign: "center", fontSize: isMobile ? "2rem" : "2.8rem", marginBottom: "0.5rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: COLORS.darkText }}>
        Our Wedding Party
      </h2>
      <p style={{ textAlign: "center", fontSize: "1rem", marginBottom: "2.5rem", color: COLORS.mediumText }}>
        Meet the amazing people standing by our side. Tap cards to see more.
      </p>

      {/* BRIDESMAIDS FIRST - "Ladies" */}
      <div style={{ marginBottom: "3rem" }}>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", textAlign: "center", color: COLORS.brideAccent, fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>
          Ladies
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(0.8rem, 2vw, 1.2rem)" }}>
          {bridesmaids.map((p) => (
            <BridesmaidCard key={p.frontName} person={p} />
          ))}
        </div>
      </div>

      {/* GROOMSMEN SECOND - "Lads" */}
      <div>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", textAlign: "center", color: COLORS.groomAccent, fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>
          Lads
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(0.8rem, 2vw, 1.2rem)" }}>
          {groomsmen.map((p) => (
            <GroomCard key={p.frontName} person={p} />
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================================
   GROOM CARD - PHOTO MAINTAINS 4:5 ASPECT RATIO
   ============================================ */

const GroomCard = React.memo(({ person }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const color = COLORS.groomAccent;
  const photos = (person.photos || []).filter(Boolean);

  const nextPhoto = (e) => {
    e.stopPropagation();
    if (photos.length <= 1) return;
    setPhotoIndex((i) => (i + 1) % photos.length);
  };

  return (
    <div
      style={{
        width: "100%",
        perspective: 1200,
        cursor: "pointer"
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.6s ease",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
        }}
      >
        {/* FRONT FACE */}
        <div
          style={{
            width: "100%",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: COLORS.cardBg,
            borderRadius: "clamp(10px, 1.5vw, 14px)",
            boxShadow: "0 4px 20px rgba(44,36,32,0.08)",
            borderTop: `4px solid ${color}`,
            border: `1px solid ${COLORS.border}`,
            overflow: "hidden",
            display: "flex",
            flexDirection: "row"
          }}
        >
          {/* Photo container - uses aspect-ratio to maintain 4:5 */}
          <div
            onClick={nextPhoto}
            style={{
              width: "clamp(140px, 28%, 260px)",
              aspectRatio: "4 / 5",
              flexShrink: 0,
              background: photos[photoIndex] ? `url(${photos[photoIndex]}) center/cover` : `linear-gradient(135deg, ${color}, ${color}dd)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
              color: "white"
            }}
          >
            {!photos[photoIndex] && "?"}
          </div>

          {/* Info section */}
          <div style={{
            flex: 1,
            padding: "clamp(0.6rem, 1.5vw, 1.2rem)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            overflow: "hidden",
            minWidth: 0
          }}>
            <h3 style={{
              fontSize: "clamp(0.95rem, 2.2vw, 1.4rem)",
              marginBottom: "clamp(0.1rem, 0.3vw, 0.2rem)",
              color: COLORS.darkText,
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              lineHeight: 1.2
            }}>
              {person.frontName}
            </h3>
            <p style={{
              color,
              fontWeight: 600,
              marginBottom: "clamp(0.1rem, 0.3vw, 0.2rem)",
              fontSize: "clamp(0.7rem, 1.4vw, 0.95rem)"
            }}>
              {person.role}
            </p>
            <p style={{
              fontSize: "clamp(0.65rem, 1.2vw, 0.9rem)",
              color: COLORS.mediumText,
              marginBottom: "clamp(0.4rem, 1vw, 0.8rem)"
            }}>
              {person.relation}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(0.2rem, 0.5vw, 0.4rem)" }}>
              <div>
                <div style={{ fontSize: "clamp(0.5rem, 0.9vw, 0.65rem)", color: COLORS.lightText, textTransform: "uppercase" }}>Status</div>
                <div style={{ fontSize: "clamp(0.65rem, 1.2vw, 0.85rem)", fontWeight: 600, color: COLORS.darkText }}>{person.relationshipStatus}</div>
              </div>
              <div>
                <div style={{ fontSize: "clamp(0.5rem, 0.9vw, 0.65rem)", color: COLORS.lightText, textTransform: "uppercase" }}>City</div>
                <div style={{ fontSize: "clamp(0.65rem, 1.2vw, 0.85rem)", fontWeight: 600, color: COLORS.darkText }}>{person.currentCity}</div>
              </div>
            </div>
            <p style={{ marginTop: "auto", paddingTop: "clamp(0.3rem, 0.6vw, 0.5rem)", fontSize: "clamp(0.55rem, 1vw, 0.7rem)", color: COLORS.lightText, fontStyle: "italic" }}>Tap for stats</p>
          </div>
        </div>

        {/* BACK FACE - matches front height automatically via absolute positioning trick */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: COLORS.cardBg,
            borderRadius: "clamp(10px, 1.5vw, 14px)",
            boxShadow: "0 4px 20px rgba(44,36,32,0.08)",
            borderTop: `4px solid ${color}`,
            border: `1px solid ${COLORS.border}`,
            padding: "clamp(0.6rem, 1.5vw, 1.2rem)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          <h3 style={{
            textAlign: "center",
            marginBottom: "clamp(0.4rem, 1vw, 0.8rem)",
            fontSize: "clamp(0.95rem, 2vw, 1.3rem)",
            color: COLORS.darkText,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            flexShrink: 0
          }}>
            {person.backName}
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "clamp(0.2rem, 0.6vw, 0.5rem)",
            marginBottom: "clamp(0.4rem, 1vw, 0.8rem)",
            flexShrink: 0
          }}>
            <StatCellScaled label="Max Bench" value={person.maxBench} color={color} />
            <StatCellScaled label="40-Yard" value={person.fortyYard} color={color} />
            <StatCellScaled label="Handicap" value={person.handicap} color={color} />
          </div>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "clamp(0.15rem, 0.4vw, 0.3rem)",
            marginBottom: "clamp(0.4rem, 1vw, 0.8rem)",
            flexShrink: 0
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(3px, 0.5vw, 5px)", flexWrap: "wrap" }}>
              <span style={{ fontSize: "clamp(0.5rem, 0.9vw, 0.65rem)", color: COLORS.lightText }}>College:</span>
              {person.collegeLogo && <img src={person.collegeLogo} alt="" style={{ width: "clamp(14px, 2vw, 20px)", height: "clamp(14px, 2vw, 20px)", objectFit: "contain" }} />}
              <span style={{ fontSize: "clamp(0.6rem, 1.1vw, 0.85rem)", fontWeight: 600, color: COLORS.darkText }}>{person.college}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(3px, 0.5vw, 5px)", flexWrap: "wrap" }}>
              <span style={{ fontSize: "clamp(0.5rem, 0.9vw, 0.65rem)", color: COLORS.lightText }}>Team:</span>
              {person.footballLogo && <img src={person.footballLogo} alt="" style={{ width: "clamp(14px, 2vw, 20px)", height: "clamp(14px, 2vw, 20px)", objectFit: "contain" }} />}
              <span style={{ fontSize: "clamp(0.6rem, 1.1vw, 0.85rem)", fontWeight: 600, color: COLORS.darkText }}>{person.footballTeam}</span>
            </div>
          </div>
          <div style={{
            flex: 1,
            minHeight: 0,
            padding: "clamp(0.4rem, 1vw, 0.8rem)",
            background: COLORS.cream,
            borderRadius: "clamp(6px, 1vw, 10px)",
            fontSize: "clamp(0.6rem, 1.1vw, 0.85rem)",
            color: COLORS.mediumText,
            fontStyle: "italic",
            lineHeight: 1.5,
            border: `1px solid ${COLORS.border}`,
            overflow: "auto"
          }}>
            {person.comment}
          </div>
          <p style={{ textAlign: "center", marginTop: "clamp(0.2rem, 0.4vw, 0.3rem)", fontSize: "clamp(0.5rem, 0.8vw, 0.65rem)", color: COLORS.lightText, flexShrink: 0 }}>Tap to flip back</p>
        </div>
      </div>
    </div>
  );
});

/* ============================================
   BRIDESMAID CARD - PHOTO MAINTAINS 4:5 ASPECT RATIO
   ============================================ */

const BridesmaidCard = React.memo(({ person }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const color = COLORS.brideAccent;
  const photos = (person.photos || []).filter(Boolean);

  const nextPhoto = (e) => {
    e.stopPropagation();
    if (photos.length <= 1) return;
    setPhotoIndex((i) => (i + 1) % photos.length);
  };

  return (
    <div
      style={{
        width: "100%",
        perspective: 1200,
        cursor: "pointer"
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.6s ease",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
        }}
      >
        {/* FRONT FACE */}
        <div
          style={{
            width: "100%",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: COLORS.cardBg,
            borderRadius: "clamp(10px, 1.5vw, 14px)",
            boxShadow: "0 4px 20px rgba(44,36,32,0.08)",
            borderTop: `4px solid ${color}`,
            border: `1px solid ${COLORS.border}`,
            overflow: "hidden",
            display: "flex",
            flexDirection: "row"
          }}
        >
          {/* Photo container - uses aspect-ratio to maintain 4:5 */}
          <div
            onClick={nextPhoto}
            style={{
              width: "clamp(140px, 28%, 260px)",
              aspectRatio: "4 / 5",
              flexShrink: 0,
              background: photos[photoIndex] ? `url(${photos[photoIndex]}) center/cover` : `linear-gradient(135deg, ${color}, ${color}dd)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
              color: "white"
            }}
          >
            {!photos[photoIndex] && "?"}
          </div>

          {/* Info section */}
          <div style={{
            flex: 1,
            padding: "clamp(0.6rem, 1.5vw, 1.2rem)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            overflow: "hidden",
            minWidth: 0
          }}>
            <h3 style={{
              fontSize: "clamp(0.95rem, 2.2vw, 1.4rem)",
              marginBottom: "clamp(0.1rem, 0.3vw, 0.2rem)",
              color: COLORS.darkText,
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              lineHeight: 1.2
            }}>
              {person.frontName}
            </h3>
            <p style={{
              color,
              fontWeight: 600,
              marginBottom: "clamp(0.1rem, 0.3vw, 0.2rem)",
              fontSize: "clamp(0.7rem, 1.4vw, 0.95rem)"
            }}>
              {person.role}
            </p>
            <p style={{
              fontSize: "clamp(0.65rem, 1.2vw, 0.9rem)",
              color: COLORS.mediumText,
              marginBottom: "clamp(0.4rem, 1vw, 0.8rem)"
            }}>
              {person.relation}
            </p>
            <div>
              <div style={{ fontSize: "clamp(0.5rem, 0.9vw, 0.65rem)", color: COLORS.lightText, textTransform: "uppercase" }}>City</div>
              <div style={{ fontSize: "clamp(0.65rem, 1.2vw, 0.85rem)", fontWeight: 600, color: COLORS.darkText }}>{person.currentCity}</div>
            </div>
            <p style={{ marginTop: "auto", paddingTop: "clamp(0.3rem, 0.6vw, 0.5rem)", fontSize: "clamp(0.55rem, 1vw, 0.7rem)", color: COLORS.lightText, fontStyle: "italic" }}>Tap for more</p>
          </div>
        </div>

        {/* BACK FACE */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: COLORS.cardBg,
            borderRadius: "clamp(10px, 1.5vw, 14px)",
            boxShadow: "0 4px 20px rgba(44,36,32,0.08)",
            borderTop: `4px solid ${color}`,
            border: `1px solid ${COLORS.border}`,
            padding: "clamp(0.6rem, 1.5vw, 1.2rem)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          <h3 style={{
            textAlign: "center",
            marginBottom: "clamp(0.4rem, 1vw, 0.8rem)",
            fontSize: "clamp(0.95rem, 2vw, 1.3rem)",
            color: COLORS.darkText,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            flexShrink: 0
          }}>
            {person.backName}
          </h3>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "clamp(0.25rem, 0.6vw, 0.5rem)",
            marginBottom: "clamp(0.4rem, 1vw, 0.8rem)",
            flexShrink: 0
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(3px, 0.5vw, 5px)", flexWrap: "wrap" }}>
              <span style={{ fontSize: "clamp(0.5rem, 0.9vw, 0.65rem)", color: COLORS.lightText }}>College:</span>
              <span style={{ fontSize: "clamp(0.6rem, 1.1vw, 0.85rem)", fontWeight: 600, color: COLORS.darkText, textAlign: "center" }}>{person.college}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(3px, 0.5vw, 5px)", flexWrap: "wrap" }}>
              <span style={{ fontSize: "clamp(0.5rem, 0.9vw, 0.65rem)", color: COLORS.lightText }}>Favorite Drink:</span>
              <span style={{ fontSize: "clamp(0.6rem, 1.1vw, 0.85rem)", fontWeight: 600, color }}>{person.favoriteDrink || "TBD"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(3px, 0.5vw, 5px)", flexWrap: "wrap" }}>
              <span style={{ fontSize: "clamp(0.5rem, 0.9vw, 0.65rem)", color: COLORS.lightText }}>Dance Floor Anthem:</span>
              <span style={{ fontSize: "clamp(0.6rem, 1.1vw, 0.85rem)", fontWeight: 600, color: COLORS.darkText, textAlign: "center" }}>{person.danceFloorSong || "TBD"}</span>
            </div>
          </div>
          <div style={{
            flex: 1,
            minHeight: 0,
            padding: "clamp(0.4rem, 1vw, 0.8rem)",
            background: COLORS.cream,
            borderRadius: "clamp(6px, 1vw, 10px)",
            fontSize: "clamp(0.6rem, 1.1vw, 0.85rem)",
            color: COLORS.mediumText,
            fontStyle: "italic",
            lineHeight: 1.5,
            border: `1px solid ${COLORS.border}`,
            overflow: "auto"
          }}>
            <strong>Fun Fact:</strong> {person.funFact || person.comment}
          </div>
          <p style={{ textAlign: "center", marginTop: "clamp(0.2rem, 0.4vw, 0.3rem)", fontSize: "clamp(0.5rem, 0.8vw, 0.65rem)", color: COLORS.lightText, flexShrink: 0 }}>Tap to flip back</p>
        </div>
      </div>
    </div>
  );
});

/* ============================================
   SCALED STAT CELL FOR BACK OF GROOM CARDS
   ============================================ */

const StatCellScaled = ({ label, value, color }) => (
  <div
    style={{
      textAlign: "center",
      background: COLORS.cream,
      padding: "clamp(0.3rem, 0.8vw, 0.6rem) clamp(0.2rem, 0.5vw, 0.4rem)",
      borderRadius: "clamp(6px, 1vw, 10px)",
      border: `1px solid ${COLORS.border}`
    }}
  >
    <div style={{
      fontSize: "clamp(0.45rem, 0.8vw, 0.65rem)",
      color: COLORS.lightText,
      marginBottom: "clamp(0.1rem, 0.2vw, 0.2rem)",
      textTransform: "uppercase"
    }}>
      {label}
    </div>
    <div style={{
      fontSize: "clamp(0.65rem, 1.2vw, 1rem)",
      fontWeight: 600,
      color
    }}>
      {value}
    </div>
  </div>
);