import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import confetti from "canvas-confetti";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { FaCalendar } from "react-icons/fa";

import heroImage from "./assets/hero.jpg";

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

// Bridesmaid photo buckets
const sarahPhotos = globToArray(import.meta.glob("./assets/brides_sarah/*", { eager: true }));

// COLORS
const COLORS = {
  bg: "#FDFBF8",
  cardBg: "#FFFFFF",
  primary: "#7D5A4F",
  secondary: "#A67B5B",
  accent: "#C9A77C",
  darkText: "#2C2420",
  mediumText: "#5D4E47",
  lightText: "#9A8B84",
  border: "#E5DDD6",
  groomAccent: "#6B5B4F",
  brideAccent: "#9B6B5A",
  highlight: "#D4B896",
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
  const [guestBookEntries, setGuestBookEntries] = useState([]);
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


  // Load saved data
  useEffect(() => {
    const savedCount = localStorage.getItem("weddingButtonCount");
    if (savedCount) setButtonCount(parseInt(savedCount, 10));
    const savedGuestBook = localStorage.getItem("guestBookEntries");
    if (savedGuestBook) setGuestBookEntries(JSON.parse(savedGuestBook));
  }, []);

  const triggerConfetti = () => {
    const count = 200;
    const defaults = { origin: { y: 0.7 }, zIndex: 9999 };
    const fire = (ratio, opts) =>
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * ratio),
        colors: [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.highlight]
      });
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  const handleButtonClick = () => {
    const n = buttonCount + 1;
    setButtonCount(n);
    localStorage.setItem("weddingButtonCount", n.toString());
    triggerConfetti();
  };

  const downloadCalendarEvent = () => {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Ben & Emily Wedding//EN
BEGIN:VEVENT
DTSTART:20261024T160000
DTEND:20261024T220000
SUMMARY:Ben & Emily's Wedding
DESCRIPTION:Join us for our special day in Charlottesville, VA!
LOCATION:241 Rosemont Farm Way, Charlottesville, VA 22903
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
        color: tab === id ? "#FFFFFF" : COLORS.mediumText,
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
      case "guestbook":
        return <GuestBookTab entries={guestBookEntries} setEntries={setGuestBookEntries} isMobile={isMobile} />;
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Lora:wght@400;500;600&display=swap');
        
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
              <TabButton id="guestbook" label="Guest Book" />
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
            background: COLORS.darkText,
            color: COLORS.cream
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
      <h2 style={{ textAlign: "center", fontSize: isMobile ? "2rem" : "2.8rem", marginBottom: "0.5rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: COLORS.darkText }}>
        Our Story
      </h2>
      <p style={{ textAlign: "center", fontSize: "1rem", marginBottom: "2.5rem", color: COLORS.mediumText }}>
        A love story that began on Halloween
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
      <div style={{ background: COLORS.cardBg, padding: isMobile ? "1.5rem" : "2.5rem", borderRadius: 14, marginBottom: "2rem", boxShadow: "0 2px 15px rgba(44,36,32,0.05)", border: `1px solid ${COLORS.border}` }}>
        <p style={{ fontSize: isMobile ? "1rem" : "1.1rem", lineHeight: 1.9, color: COLORS.mediumText, textAlign: "center", marginBottom: "1.2rem" }}>
          Emily and Ben met on a crisp Halloween night in Atlanta — she as Padme, he as Anakin — two characters whose destinies were always intertwined. Since then, they've moved to New York City to build a life together on the Upper East Side.
        </p>
        <p style={{ fontSize: isMobile ? "1rem" : "1.1rem", lineHeight: 1.9, color: COLORS.mediumText, textAlign: "center" }}>
          Through every move, challenge, and adventure, their connection has only deepened. Now, we're ready to celebrate this next chapter with the people who mean the most to us!
        </p>
      </div>

      {/* Save the Date */}
      <div style={{ background: COLORS.cardBg, padding: isMobile ? "1.5rem" : "2.5rem", borderRadius: 14, marginBottom: "2rem", textAlign: "center", borderTop: `4px solid ${COLORS.accent}`, boxShadow: "0 2px 15px rgba(44,36,32,0.05)", border: `1px solid ${COLORS.border}` }}>
        <FaCalendar style={{ fontSize: "2.2rem", color: COLORS.primary, marginBottom: "0.8rem" }} />
        <h3 style={{ fontSize: "1.5rem", marginBottom: "0.6rem", color: COLORS.darkText, fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>
          Save the Date
        </h3>
        <p style={{ marginBottom: "1.2rem", color: COLORS.mediumText, fontSize: "0.95rem" }}>
          Add our wedding to your calendar
        </p>
        <button
          onClick={downloadCalendarEvent}
          style={{
            background: COLORS.primary,
            color: "#FFFFFF",
            border: "none",
            padding: "0.85rem 2rem",
            fontSize: "0.9rem",
            fontWeight: 500,
            borderRadius: 50,
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          Download Calendar Event
        </button>
      </div>

      {/* Excitement Button */}
      <div style={{ textAlign: "center", padding: isMobile ? "1.5rem" : "2.5rem", background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`, borderRadius: 14, color: "white" }}>
        <h3 style={{ fontSize: "1.4rem", marginBottom: "0.8rem", fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>
          How excited are you?
        </h3>
        <p style={{ marginBottom: "1.2rem", opacity: 0.9, fontSize: "0.95rem" }}>Click to show your excitement!</p>
        <button
          onClick={handleButtonClick}
          style={{
            background: "white",
            color: COLORS.primary,
            border: "none",
            padding: "0.9rem 2rem",
            fontSize: "1.05rem",
            fontWeight: 600,
            borderRadius: 50,
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
            marginBottom: "1rem"
          }}
        >
          Can't Wait!
        </button>
        <div style={{ fontSize: "1.1rem", fontWeight: 400 }}>Total clicks: {buttonCount.toLocaleString()}</div>
      </div>
    </>
  );
}

/* ============================================
   RSVP TAB
   ============================================ */

function RSVPTab({ isMobile }) {
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
            background: COLORS.darkText,
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
  return (
    <>
      <h2 style={{ textAlign: "center", fontSize: isMobile ? "2rem" : "2.8rem", marginBottom: "0.5rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: COLORS.darkText }}>
        Wedding Details
      </h2>
      <p style={{ textAlign: "center", fontSize: "1rem", marginBottom: "2.5rem", color: COLORS.mediumText }}>
        Everything you need to know
      </p>

      {/* Schedule */}
      <div style={{ background: COLORS.cardBg, padding: isMobile ? "1.5rem" : "2rem", borderRadius: 14, marginBottom: "1.5rem", boxShadow: "0 2px 15px rgba(44,36,32,0.05)", border: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontSize: "1.4rem", marginBottom: "1.2rem", textAlign: "center", color: COLORS.darkText, fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>
          Schedule
        </h3>
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          {[
            ["4:00 PM", "Ceremony"],
            ["5:00 PM", "Cocktail Hour"],
            ["6:00 PM", "Reception & Dinner"],
            ["10:00 PM", "Send-off"]
          ].map(([time, ev], i) => (
            <div key={time} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.9rem 0", borderBottom: i < 3 ? `1px solid ${COLORS.border}` : "none" }}>
              <span style={{ fontWeight: 600, color: COLORS.primary, fontSize: "0.95rem" }}>{time}</span>
              <span style={{ fontSize: "0.95rem", color: COLORS.mediumText }}>{ev}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Venue */}
      <div style={{ background: COLORS.cardBg, padding: isMobile ? "1.5rem" : "2rem", borderRadius: 14, marginBottom: "1.5rem", boxShadow: "0 2px 15px rgba(44,36,32,0.05)", border: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontSize: "1.4rem", marginBottom: "0.8rem", textAlign: "center", color: COLORS.darkText, fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>
          Venue
        </h3>
        <p style={{ textAlign: "center", fontSize: "1.05rem", color: COLORS.mediumText, lineHeight: 1.8 }}>
          <strong style={{ color: COLORS.darkText }}>241 Rosemont Farm Way</strong>
          <br />
          <strong style={{ color: COLORS.darkText }}>Charlottesville, VA 22903</strong>
        </p>
      </div>

      {/* Travel */}
      <div style={{ background: COLORS.cardBg, padding: isMobile ? "1.5rem" : "2rem", borderRadius: 14, marginBottom: "1.5rem", boxShadow: "0 2px 15px rgba(44,36,32,0.05)", border: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontSize: "1.4rem", marginBottom: "1.2rem", textAlign: "center", color: COLORS.darkText, fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>
          Travel & Stay
        </h3>
        <div style={{ lineHeight: 1.8, color: COLORS.mediumText, fontSize: "0.95rem" }}>
          <p style={{ marginBottom: "0.8rem" }}><strong style={{ color: COLORS.darkText }}>Hotel Recommendations:</strong></p>
          <ul style={{ paddingLeft: "1.5rem", marginBottom: "1.2rem" }}>
            <li style={{ marginBottom: "0.4rem" }}>
              <a href="https://www.reservationcounter.com/hotels/show/5fa6aba/boars-head-resort-charlottesville-virginia/" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.primary, textDecoration: "underline" }}>
                Boars Head Resort
              </a>
            </li>
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

      {/* Dress Code */}
      <div style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`, padding: isMobile ? "1.5rem" : "2rem", borderRadius: 14, color: "white", textAlign: "center" }}>
        <h3 style={{ fontSize: "1.4rem", marginBottom: "0.6rem", fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>
          Dress Code
        </h3>
        <p style={{ fontSize: "1.1rem", lineHeight: 1.7 }}>
          Cocktail Attire<br />
          <span style={{ fontSize: "0.9rem", opacity: 0.9 }}>(The ceremony will be outdoors on grass)</span>
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
    { name: "Amazon", url: "https://amazon.com/wedding/your-registry", icon: "A" },
    { name: "Target", url: "https://target.com/gift-registry", icon: "T" },
    { name: "Honeymoon Fund", url: "#", icon: "H" }
  ];

  return (
    <>
      <h2 style={{ textAlign: "center", fontSize: isMobile ? "2rem" : "2.8rem", marginBottom: "0.5rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: COLORS.darkText }}>
        Registry
      </h2>
      <p style={{ textAlign: "center", fontSize: "1rem", marginBottom: "2.5rem", color: COLORS.mediumText }}>
        Your presence is the greatest gift
      </p>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "1.2rem", marginBottom: "2rem" }}>
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
   GUEST BOOK TAB
   ============================================ */

function GuestBookTab({ entries, setEntries, isMobile }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !message) return;
    const newEntry = { id: Date.now(), name, message, photo: photoPreview, timestamp: new Date().toISOString() };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem("guestBookEntries", JSON.stringify(updated));
    setName("");
    setMessage("");
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.highlight] });
  };

  const inputStyle = {
    width: "100%",
    padding: "0.9rem",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    fontSize: "0.95rem",
    color: COLORS.darkText,
    background: COLORS.cream,
    boxSizing: "border-box"
  };

  return (
    <>
      <h2 style={{ textAlign: "center", fontSize: isMobile ? "2rem" : "2.8rem", marginBottom: "0.5rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: COLORS.darkText }}>
        Guest Book
      </h2>
      <p style={{ textAlign: "center", fontSize: "1rem", marginBottom: "2.5rem", color: COLORS.mediumText }}>
        Leave us a message and snap a selfie!
      </p>

      <div style={{ background: COLORS.cardBg, padding: isMobile ? "1.5rem" : "2rem", borderRadius: 14, marginBottom: "2.5rem", boxShadow: "0 2px 15px rgba(44,36,32,0.05)", border: `1px solid ${COLORS.border}` }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.2rem" }}>
            <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 500, color: COLORS.darkText, fontSize: "0.9rem" }}>Your Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name..." required style={inputStyle} />
          </div>
          <div style={{ marginBottom: "1.2rem" }}>
            <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 500, color: COLORS.darkText, fontSize: "0.9rem" }}>Your Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Share your well wishes..." required rows={4} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div style={{ marginBottom: "1.2rem" }}>
            <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 500, color: COLORS.darkText, fontSize: "0.9rem" }}>Add a Selfie (Optional)</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ ...inputStyle, border: `1px dashed ${COLORS.border}`, cursor: "pointer", padding: "0.7rem" }} />
            {photoPreview && (
              <div style={{ marginTop: "0.8rem", textAlign: "center" }}>
                <img src={photoPreview} alt="Preview" style={{ maxWidth: 150, maxHeight: 150, borderRadius: 10, objectFit: "cover", border: `1px solid ${COLORS.border}` }} />
              </div>
            )}
          </div>
          <button type="submit" style={{ width: "100%", background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`, color: "white", border: "none", padding: "0.9rem", fontSize: "0.95rem", fontWeight: 500, borderRadius: 8, cursor: "pointer" }}>
            Sign Guest Book
          </button>
        </form>
      </div>

      <h3 style={{ fontSize: "1.3rem", marginBottom: "1.5rem", textAlign: "center", color: COLORS.darkText, fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>
        Messages from Our Guests ({entries.length})
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "1.2rem" }}>
        {entries.map((entry) => (
          <div key={entry.id} style={{ background: COLORS.cardBg, padding: "1.2rem", borderRadius: 12, boxShadow: "0 2px 15px rgba(44,36,32,0.05)", border: `1px solid ${COLORS.border}`, transform: `rotate(${Math.random() * 2 - 1}deg)` }}>
            {entry.photo && <img src={entry.photo} alt={entry.name} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8, marginBottom: "0.8rem" }} />}
            <p style={{ fontWeight: 600, marginBottom: "0.4rem", color: COLORS.darkText, fontSize: "0.95rem" }}>{entry.name}</p>
            <p style={{ fontSize: "0.9rem", color: COLORS.mediumText, lineHeight: 1.6, fontStyle: "italic" }}>"{entry.message}"</p>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <p style={{ textAlign: "center", color: COLORS.lightText, fontSize: "1rem", marginTop: "1.5rem", fontStyle: "italic" }}>
          Be the first to sign the guest book!
        </p>
      )}
    </>
  );
}

/* ============================================
   WEDDING PARTY TAB - LADIES FIRST
   ============================================ */

function WeddingPartyTab({ isMobile }) {
  const groomsmen = [
    { name: "Harry", relation: "Brother", photos: harryPhotos, role: "Best Man", maxBench: "175 lbs", fortyYard: "4.95s", handicap: "19.0", relationshipStatus: "Taken", currentCity: "Williamsburg, NY", college: "Northwestern University", collegeLogo: nu, footballTeam: "Cleveland Browns", footballLogo: brown, comment: "Let's hope Harry shows up on time to the ceremony." },
    { name: "Chuck", relation: "Brother", photos: chuckPhotos, role: "Groomsman", maxBench: "135 lbs", fortyYard: "5.4s", handicap: "13.5", relationshipStatus: "Taken", currentCity: "Chicago, IL", college: "University of Wisconsin", collegeLogo: w, footballTeam: "Chicago Bears", footballLogo: bears, comment: "Known for his inconsistency off the tee. Keep your eyes peeled when Chuck hits the dance floor." },
    { name: "Jacko", relation: "Brother", photos: jackoPhotos, role: "Groomsman", maxBench: "185 lbs", fortyYard: "5.8s", handicap: "20.0", relationshipStatus: "Single", currentCity: "Washington DC", college: "University of Virginia", collegeLogo: uva, footballTeam: "The Hokies", footballLogo: vt, comment: "The most controversial character in the lineup. Look for Jacko on stage for the late night." },
    { name: "Cole Dickinson", relation: "Friend", photos: colePhotos, role: "Groomsman", maxBench: "285 lbs", fortyYard: "4.9s", handicap: "9.5", relationshipStatus: "Married", currentCity: "Charleston, SC", college: "University of South Carolina", collegeLogo: sc, footballTeam: "Washington Football Team", footballLogo: skins, comment: "It's too Cole for my Dickinson." },
    { name: "Henry Kreienbaum", relation: "Friend", photos: henryPhotos, role: "Groomsman", maxBench: "265 lbs", fortyYard: "5.3s", handicap: "15.0", relationshipStatus: "Taken", currentCity: "Atlanta, GA", college: "James Madison University", collegeLogo: dukes, footballTeam: "Washington Commanders", footballLogo: skins, comment: "Don't ask this guy about Nascar." },
    { name: "Oliver", relation: "Friend", photos: oliPhotos, role: "Groomsman", maxBench: "255 lbs", fortyYard: "4.6s", handicap: "22.0", relationshipStatus: "Taken", currentCity: "New York, NY", college: "Washington & Lee University", collegeLogo: wl, footballTeam: "Washington Redskins", footballLogo: skins, comment: "Can I get a roll tide." },
    { name: "Wyatt", relation: "Brother-in-law", photos: wyattPhotos, role: "Groomsman", maxBench: "225 lbs", fortyYard: "5.5s", handicap: "8.0", relationshipStatus: "Single", currentCity: "Knoxville, TN", college: "University of Tennessee", collegeLogo: ut, footballTeam: "The Vols", footballLogo: ut, comment: "Fill in description." }
  ];

  const bridesmaids = [
    { name: "Lauren Turnbull", relation: "Friend", photos: laurenPhotos, role: "Bridesmaid", relationshipStatus: "Taken", currentCity: "Nashville, TN", college: "UT | Vanderbilt | Belmont", favoriteDrink: "Pinot Grigio", danceFloorSong: "Valerie by Amy Winehouse", funFact: "Emily and Lauren met in their first class freshman year of college." }
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
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {bridesmaids.map((p) => (
            <BridesmaidCard key={p.name} person={p} isMobile={isMobile} />
          ))}
        </div>
      </div>

      {/* GROOMSMEN SECOND - "Lads" */}
      <div>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", textAlign: "center", color: COLORS.groomAccent, fontWeight: 400, fontFamily: "'Cormorant Garamond', serif" }}>
          Lads
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {groomsmen.map((p) => (
            <GroomCard key={p.name} person={p} isMobile={isMobile} />
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================================
   GROOM CARD - FIXED SIZE WITH PROPER FLIP
   ============================================ */

const GroomCard = React.memo(({ person, isMobile }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const color = COLORS.groomAccent;
  const photos = (person.photos || []).filter(Boolean);

  const cardHeight = isMobile ? CARD_HEIGHT_MOBILE : CARD_HEIGHT_DESKTOP;
  const photoWidth = isMobile ? PHOTO_WIDTH_MOBILE : PHOTO_WIDTH_DESKTOP;

  const nextPhoto = (e) => {
    e.stopPropagation();
    if (photos.length <= 1) return;
    setPhotoIndex((i) => (i + 1) % photos.length);
  };

  // Card container with perspective
  return (
    <div
      style={{
        width: "100%",
        height: cardHeight,
        perspective: 1200,
        cursor: "pointer"
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {/* Inner container that actually rotates */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.6s ease",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
        }}
      >
        {/* FRONT FACE */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: COLORS.cardBg,
            borderRadius: 14,
            boxShadow: "0 4px 20px rgba(44,36,32,0.08)",
            borderTop: `4px solid ${color}`,
            border: `1px solid ${COLORS.border}`,
            overflow: "hidden",
            display: "flex",
            flexDirection: "row"
          }}
        >
          <div
            onClick={nextPhoto}
            style={{
              width: photoWidth,
              height: "100%",
              flexShrink: 0,
              background: photos[photoIndex] ? `url(${photos[photoIndex]}) center/cover` : `linear-gradient(135deg, ${color}, ${color}dd)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.5rem",
              color: "white"
            }}
          >
            {!photos[photoIndex] && "?"}
          </div>
          <div style={{ flex: 1, padding: isMobile ? "0.8rem" : "1.2rem", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden" }}>
            <h3 style={{ fontSize: isMobile ? "1.1rem" : "1.4rem", marginBottom: "0.2rem", color: COLORS.darkText, fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>{person.name}</h3>
            <p style={{ color, fontWeight: 600, marginBottom: "0.2rem", fontSize: isMobile ? "0.85rem" : "0.95rem" }}>{person.role}</p>
            <p style={{ fontSize: isMobile ? "0.8rem" : "0.9rem", color: COLORS.mediumText, marginBottom: "0.8rem" }}>{person.relation}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
              <div>
                <div style={{ fontSize: "0.65rem", color: COLORS.lightText, textTransform: "uppercase" }}>Status</div>
                <div style={{ fontSize: isMobile ? "0.8rem" : "0.9rem", fontWeight: 600, color: COLORS.darkText }}>{person.relationshipStatus}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: COLORS.lightText, textTransform: "uppercase" }}>City</div>
                <div style={{ fontSize: isMobile ? "0.8rem" : "0.9rem", fontWeight: 600, color: COLORS.darkText }}>{person.currentCity}</div>
              </div>
            </div>
            <p style={{ marginTop: "auto", paddingTop: "0.5rem", fontSize: "0.75rem", color: COLORS.lightText, fontStyle: "italic" }}>Tap for stats</p>
          </div>
        </div>

        {/* BACK FACE */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: COLORS.cardBg,
            borderRadius: 14,
            boxShadow: "0 4px 20px rgba(44,36,32,0.08)",
            borderTop: `4px solid ${color}`,
            border: `1px solid ${COLORS.border}`,
            padding: isMobile ? "0.8rem" : "1.2rem",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          <h3 style={{ textAlign: "center", marginBottom: isMobile ? "0.6rem" : "0.8rem", fontSize: isMobile ? "1.1rem" : "1.3rem", color: COLORS.darkText, fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, flexShrink: 0 }}>{person.name}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: isMobile ? "0.3rem" : "0.5rem", marginBottom: isMobile ? "0.6rem" : "0.8rem", flexShrink: 0 }}>
            <StatCell label="Max Bench" value={person.maxBench} color={color} />
            <StatCell label="40-Yard" value={person.fortyYard} color={color} />
            <StatCell label="Handicap" value={person.handicap} color={color} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "0.3rem" : "0.4rem", marginBottom: isMobile ? "0.6rem" : "0.8rem", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.7rem", color: COLORS.lightText }}>College:</span>
              {person.collegeLogo && <img src={person.collegeLogo} alt="" style={{ width: isMobile ? 16 : 20, height: isMobile ? 16 : 20, objectFit: "contain" }} />}
              <span style={{ fontSize: isMobile ? "0.8rem" : "0.9rem", fontWeight: 600, color: COLORS.darkText }}>{person.college}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.7rem", color: COLORS.lightText }}>Team:</span>
              {person.footballLogo && <img src={person.footballLogo} alt="" style={{ width: isMobile ? 16 : 20, height: isMobile ? 16 : 20, objectFit: "contain" }} />}
              <span style={{ fontSize: isMobile ? "0.8rem" : "0.9rem", fontWeight: 600, color: COLORS.darkText }}>{person.footballTeam}</span>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0, padding: isMobile ? "0.6rem" : "0.8rem", background: COLORS.cream, borderRadius: 10, fontSize: isMobile ? "0.75rem" : "0.85rem", color: COLORS.mediumText, fontStyle: "italic", lineHeight: 1.5, border: `1px solid ${COLORS.border}`, overflow: "auto" }}>
            {person.comment}
          </div>
          <p style={{ textAlign: "center", marginTop: "0.4rem", fontSize: "0.7rem", color: COLORS.lightText, flexShrink: 0 }}>Tap to flip back</p>
        </div>
      </div>
    </div>
  );
});

/* ============================================
   BRIDESMAID CARD - FIXED SIZE WITH PROPER FLIP
   ============================================ */

const BridesmaidCard = React.memo(({ person, isMobile }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const color = COLORS.brideAccent;
  const photos = (person.photos || []).filter(Boolean);

  const cardHeight = isMobile ? CARD_HEIGHT_MOBILE : CARD_HEIGHT_DESKTOP;
  const photoWidth = isMobile ? PHOTO_WIDTH_MOBILE : PHOTO_WIDTH_DESKTOP;

  const nextPhoto = (e) => {
    e.stopPropagation();
    if (photos.length <= 1) return;
    setPhotoIndex((i) => (i + 1) % photos.length);
  };

  return (
    <div
      style={{
        width: "100%",
        height: cardHeight,
        perspective: 1200,
        cursor: "pointer"
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {/* Inner container that actually rotates */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.6s ease",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
        }}
      >
        {/* FRONT FACE */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: COLORS.cardBg,
            borderRadius: 14,
            boxShadow: "0 4px 20px rgba(44,36,32,0.08)",
            borderTop: `4px solid ${color}`,
            border: `1px solid ${COLORS.border}`,
            overflow: "hidden",
            display: "flex",
            flexDirection: "row"
          }}
        >
          <div
            onClick={nextPhoto}
            style={{
              width: photoWidth,
              height: "100%",
              flexShrink: 0,
              background: photos[photoIndex] ? `url(${photos[photoIndex]}) center/cover` : `linear-gradient(135deg, ${color}, ${color}dd)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.5rem",
              color: "white"
            }}
          >
            {!photos[photoIndex] && "?"}
          </div>
          <div style={{ flex: 1, padding: isMobile ? "0.8rem" : "1.2rem", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden" }}>
            <h3 style={{ fontSize: isMobile ? "1.1rem" : "1.4rem", marginBottom: "0.2rem", color: COLORS.darkText, fontFamily: "'Cormorant Garamond', serif", fontWeight: 500 }}>{person.name}</h3>
            <p style={{ color, fontWeight: 600, marginBottom: "0.2rem", fontSize: isMobile ? "0.85rem" : "0.95rem" }}>{person.role}</p>
            <p style={{ fontSize: isMobile ? "0.8rem" : "0.9rem", color: COLORS.mediumText, marginBottom: "0.8rem" }}>{person.relation}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
              <div>
                <div style={{ fontSize: "0.65rem", color: COLORS.lightText, textTransform: "uppercase" }}>Status</div>
                <div style={{ fontSize: isMobile ? "0.8rem" : "0.9rem", fontWeight: 600, color: COLORS.darkText }}>{person.relationshipStatus}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.65rem", color: COLORS.lightText, textTransform: "uppercase" }}>City</div>
                <div style={{ fontSize: isMobile ? "0.8rem" : "0.9rem", fontWeight: 600, color: COLORS.darkText }}>{person.currentCity}</div>
              </div>
            </div>
            <p style={{ marginTop: "auto", paddingTop: "0.5rem", fontSize: "0.75rem", color: COLORS.lightText, fontStyle: "italic" }}>Tap for more</p>
          </div>
        </div>

        {/* BACK FACE */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: COLORS.cardBg,
            borderRadius: 14,
            boxShadow: "0 4px 20px rgba(44,36,32,0.08)",
            borderTop: `4px solid ${color}`,
            border: `1px solid ${COLORS.border}`,
            padding: isMobile ? "0.8rem" : "1.2rem",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          <h3 style={{ textAlign: "center", marginBottom: isMobile ? "0.6rem" : "0.8rem", fontSize: isMobile ? "1.1rem" : "1.3rem", color: COLORS.darkText, fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, flexShrink: 0 }}>{person.name}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "0.4rem" : "0.6rem", marginBottom: isMobile ? "0.6rem" : "0.8rem", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.7rem", color: COLORS.lightText }}>College:</span>
              <span style={{ fontSize: isMobile ? "0.8rem" : "0.9rem", fontWeight: 600, color: COLORS.darkText, textAlign: "center" }}>{person.college}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.7rem", color: COLORS.lightText }}>Favorite Drink:</span>
              <span style={{ fontSize: isMobile ? "0.8rem" : "0.9rem", fontWeight: 600, color }}>{person.favoriteDrink || "TBD"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.7rem", color: COLORS.lightText }}>Dance Floor Anthem:</span>
              <span style={{ fontSize: isMobile ? "0.8rem" : "0.9rem", fontWeight: 600, color: COLORS.darkText, textAlign: "center" }}>{person.danceFloorSong || "TBD"}</span>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0, padding: isMobile ? "0.6rem" : "0.8rem", background: COLORS.cream, borderRadius: 10, fontSize: isMobile ? "0.75rem" : "0.85rem", color: COLORS.mediumText, fontStyle: "italic", lineHeight: 1.5, border: `1px solid ${COLORS.border}`, overflow: "auto" }}>
            <strong>Fun Fact:</strong> {person.funFact || person.comment}
          </div>
          <p style={{ textAlign: "center", marginTop: "0.4rem", fontSize: "0.7rem", color: COLORS.lightText, flexShrink: 0 }}>Tap to flip back</p>
        </div>
      </div>
    </div>
  );
});