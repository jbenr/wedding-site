import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import confetti from "canvas-confetti";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { FaHeart, FaCamera, FaGift, FaCalendar } from "react-icons/fa";

import heroImage from "./assets/hero.jpg";

// Helper to turn an import.meta.glob result into an array of URLs
const globToArray = (modules) =>
  Object.values(modules)
    .map((m) => (m && typeof m === "object" && "default" in m ? m.default : m))
    .filter(Boolean);

// Main page photo buckets – folders: assets/b1, b2, b3
const mainPhotoBuckets = [
  globToArray(import.meta.glob("./assets/b1/*", { eager: true })),
  globToArray(import.meta.glob("./assets/b2/*", { eager: true })),
  globToArray(import.meta.glob("./assets/b3/*", { eager: true }))
];

// Groomsmen photo buckets – folders: assets/harry, chuck, jacko, cole, henry, oli, wyatt
const harryPhotos = globToArray(import.meta.glob("./assets/harry/*", { eager: true }));
const chuckPhotos = globToArray(import.meta.glob("./assets/chuck/*", { eager: true }));
const jackoPhotos = globToArray(import.meta.glob("./assets/jacko/*", { eager: true }));
const colePhotos = globToArray(import.meta.glob("./assets/cole/*", { eager: true }));
const henryPhotos = globToArray(import.meta.glob("./assets/henry/*", { eager: true }));
const oliPhotos = globToArray(import.meta.glob("./assets/oli/*", { eager: true }));
const wyattPhotos = globToArray(import.meta.glob("./assets/wyatt/*", { eager: true }));

// Bridesmaid example bucket – folder: assets/brides_sarah
const sarahPhotos = globToArray(import.meta.glob("./assets/brides_sarah/*", { eager: true }));

const CARD_HEIGHT = 320;
const MOBILE_CARD_HEIGHT = 260;
const DESKTOP_PHOTO_WIDTH = 260;
const MOBILE_PHOTO_WIDTH = 120;

const StatCell = ({ label, value, color }) => (
  <div style={{ textAlign: "center", background: "#f9f9f9", padding: "0.75rem", borderRadius: 10 }}>
    <div style={{ fontSize: "0.75rem", color: "#999", marginBottom: "0.25rem" }}>{label}</div>
    <div style={{ fontSize: "1.25rem", fontWeight: 700, color }}>{value}</div>
  </div>
);

export default function App() {
  const [tab, setTab] = useState("main");
  const [buttonCount, setButtonCount] = useState(0);
  const [guestBookEntries, setGuestBookEntries] = useState([]);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]); // stays in this range

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

  useEffect(() => {
    const savedCount = localStorage.getItem("weddingButtonCount");
    if (savedCount) setButtonCount(parseInt(savedCount, 10));
    const savedGuestBook = localStorage.getItem("guestBookEntries");
    if (savedGuestBook) setGuestBookEntries(JSON.parse(savedGuestBook));
  }, []);

  const triggerConfetti = () => {
    const count = 200;
    const defaults = { origin: { y: 0.7 }, zIndex: 9999 };
    const fire = (ratio, opts) => confetti({ ...defaults, ...opts, particleCount: Math.floor(count * ratio) });
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
LOCATION:The Garden Estate, 123 Vineyard Lane, Charlottesville, VA 22902
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

  const TabButton = ({ id, label, icon }) => (
    <button
      onClick={() => setTab(id)}
      style={{
        flex: 1,
        padding: "0.875rem 1rem",
        border: "none",
        background: tab === id ? "#111" : "transparent",
        color: tab === id ? "white" : "#333",
        fontSize: "0.95rem",
        fontWeight: tab === id ? 600 : 500,
        borderRadius: 12,
        cursor: "pointer",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem"
      }}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", lineHeight: 1.6 }}>
      <Analytics />
      <SpeedInsights />

      {/* HERO */}
      <section
        style={{
          minHeight: "100vh",
          position: "relative",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden"
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
            // static gradient so it doesn't "snap" at end of animation
            background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))"
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "2rem", maxWidth: 900 }}
        >
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            style={{
              fontSize: "clamp(3rem, 10vw, 5rem)",
              marginBottom: "1rem",
              fontWeight: 300,
              letterSpacing: "0.05em",
              fontFamily: "'Playfair Display', Georgia, serif"
            }}
          >
            Ben & Emily
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            style={{
              fontSize: "clamp(1.1rem, 3vw, 1.5rem)",
              marginBottom: "2rem",
              fontWeight: 300,
              letterSpacing: "0.1em"
            }}
          >
            October 24, 2026
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)", fontWeight: 300, marginBottom: "2rem" }}
          >
            Charlottesville, Virginia
          </motion.div>

          {/* Countdown */}
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              justifyContent: "center",
              marginBottom: "2rem",
              flexWrap: "wrap"
            }}
          >
            {[
              { v: countdown.days, l: "Days" },
              { v: countdown.hours, l: "Hours" },
              { v: countdown.minutes, l: "Minutes" },
              { v: countdown.seconds, l: "Seconds" }
            ].map((x, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(1px)",
                  padding: "1rem 1.5rem",
                  borderRadius: 12,
                  minWidth: 80
                }}
              >
                <div style={{ fontSize: "2rem", fontWeight: 600 }}>{x.v}</div>
                <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>{x.l}</div>
              </div>
            ))}
          </div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            onClick={() => document.getElementById("content")?.scrollIntoView({ behavior: "smooth" })}
            style={{
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "white",
              padding: "1rem 2.5rem",
              fontSize: "1rem",
              borderRadius: 50,
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontWeight: 500,
              letterSpacing: "0.05em"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.18)";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Explore ↓
          </motion.button>
        </motion.div>
      </section>

      {/* TAB BAR */}
      <div
        id="content"
        style={{
          position: "sticky",
          top: 0,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #e5e5e5",
          zIndex: 100,
          padding: "1rem"
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "flex",
            gap: "0.5rem",
            background: "#f8f8f8",
            padding: "0.5rem",
            borderRadius: 16,
            flexWrap: "wrap"
          }}
        >
          <TabButton id="main" label="Main" icon={<FaHeart />} />
          <TabButton id="rsvp" label="RSVP" />
          <TabButton id="info" label="Info" />
          <TabButton id="party" label="Wedding Party" />
          <TabButton id="registry" label="Registry" icon={<FaGift />} />
          <TabButton id="guestbook" label="Guest Book" icon={<FaCamera />} />
        </div>
      </div>

      {/* CONTENT TABS */}
      <section style={{ padding: "3rem 1rem", minHeight: "70vh" }}>
        {tab === "main" && (
          <MainTab
            photoBuckets={mainPhotoBuckets}
            buttonCount={buttonCount}
            handleButtonClick={handleButtonClick}
            downloadCalendarEvent={downloadCalendarEvent}
          />
        )}
        {tab === "rsvp" && <RSVPTab />}
        {tab === "info" && <InfoTab />}
        {tab === "party" && <WeddingPartyTab />}
        {tab === "registry" && <RegistryTab />}
        {tab === "guestbook" && (
          <GuestBookTab entries={guestBookEntries} setEntries={setGuestBookEntries} />
        )}
      </section>

      <footer style={{ textAlign: "center", padding: "3rem 1.5rem", background: "#111", color: "#eee" }}>
        <p style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>We can't wait to celebrate with you</p>
        <p style={{ fontSize: "2rem" }}>🤍</p>
        <p style={{ fontSize: "0.9rem", opacity: 0.7, marginTop: "1.5rem" }}>
          Ben & Emily • October 24, 2026
        </p>
      </footer>
    </div>
  );
}

/* MAIN TAB – folder-based photo buckets */

function MainTab({ photoBuckets, buttonCount, handleButtonClick, downloadCalendarEvent }) {
  const [indices, setIndices] = useState(photoBuckets.map(() => 0));
  const cycle = (slot) =>
    setIndices((prev) =>
      prev.map((v, i) =>
        i === slot && photoBuckets[slot].length > 0 ? (v + 1) % photoBuckets[slot].length : v
      )
    );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h2
        style={{
          textAlign: "center",
          fontSize: "clamp(2rem,5vw,2.5rem)",
          marginBottom: "2rem",
          fontFamily: "'Playfair Display',Georgia,serif",
          fontWeight: 400
        }}
      >
        Our Story
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
          gap: "1rem",
          marginBottom: "3rem"
        }}
      >
        {photoBuckets.map((bucket, i) => {
          const hasPhotos = bucket.length > 0;
          const src = hasPhotos ? bucket[indices[i] % bucket.length] : undefined;
          return (
            <motion.div
              key={`${i}-${indices[i]}`}
              onClick={() => hasPhotos && cycle(i)}
              initial={{ opacity: 0.2, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                aspectRatio: "4/5",
                cursor: hasPhotos ? "pointer" : "default",
                background: hasPhotos ? "transparent" : "#eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {src ? (
                <img
                  src={src}
                  alt={`Story ${i + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: i === 2 ? "40% center" : "center"
                  }}
                />
              ) : (
                <span style={{ color: "#aaa" }}>Add photos to assets/b{i + 1}</span>
              )}
            </motion.div>
          );
        })}
      </div>

      <div style={{ background: "#f9f9f9", padding: "2.5rem", borderRadius: 16, marginBottom: "3rem" }}>
        <p
          style={{
            fontSize: "1.15rem",
            lineHeight: 1.8,
            color: "#333",
            textAlign: "center",
            marginBottom: "1.5rem"
          }}
        >
          What started as a chance meeting turned into countless adventures, inside jokes, and a love that grows deeper
          every day. We've laughed through the chaos, supported each other through challenges, and built a life filled
          with joy.
        </p>
        <p style={{ fontSize: "1.15rem", lineHeight: 1.8, color: "#333", textAlign: "center" }}>
          Now, we're ready to celebrate this next chapter with the people who mean the most to us. We can't wait to
          share this special day with you!
        </p>
      </div>

      <div
        style={{
          textAlign: "center",
          padding: "2rem",
          background: "#f0f7ff",
          borderRadius: 16,
          marginBottom: "2rem"
        }}
      >
        <FaCalendar style={{ fontSize: "3rem", color: "#667eea", marginBottom: "1rem" }} />
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#333" }}>Save the Date!</h3>
        <p style={{ marginBottom: "1.5rem", color: "#666" }}>
          Add our wedding to your calendar so you don't forget!
        </p>
        <button
          onClick={downloadCalendarEvent}
          style={{
            background: "#667eea",
            color: "white",
            border: "none",
            padding: "1rem 2.5rem",
            fontSize: "1.1rem",
            fontWeight: 600,
            borderRadius: 50,
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#5568d3";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#667eea";
            e.target.style.transform = "translateY(0)";
          }}
        >
          Download Calendar Event
        </button>
      </div>

      <div
        style={{
          textAlign: "center",
          padding: "2rem",
          background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
          borderRadius: 16,
          color: "white"
        }}
      >
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: 500 }}>How excited are you? 🎉</h3>
        <p style={{ marginBottom: "1.5rem", opacity: 0.9 }}>Click the button to show your excitement!</p>
        <button
          onClick={handleButtonClick}
          style={{
            background: "white",
            color: "#667eea",
            border: "none",
            padding: "1.25rem 3rem",
            fontSize: "1.25rem",
            fontWeight: 600,
            borderRadius: 50,
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            marginBottom: "1.5rem"
          }}
        >
          Can't Wait! 💕
        </button>
        <div style={{ fontSize: "1.25rem", fontWeight: 500 }}>
          Total clicks: {buttonCount.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

/* RSVP, INFO, REGISTRY, GUESTBOOK (unchanged from last version) */

function RSVPTab() {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h2
        style={{
          textAlign: "center",
          fontSize: "clamp(2rem,5vw,2.5rem)",
          marginBottom: "1.5rem",
          fontFamily: "'Playfair Display',Georgia,serif",
          fontWeight: 400
        }}
      >
        RSVP
      </h2>
      <p style={{ textAlign: "center", fontSize: "1.1rem", marginBottom: "2.5rem", color: "#666" }}>
        Please let us know if you can join us by filling out the form below
      </p>
      <div style={{ background: "#f9f9f9", padding: "2rem", borderRadius: 16, textAlign: "center" }}>
        <p style={{ marginBottom: "1.5rem", fontSize: "1.05rem" }}>Click below to open our RSVP form:</p>
        <a
          href="https://forms.gle/9U5nv3R1hasEXZYJA"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            background: "#111",
            color: "white",
            padding: "1.25rem 3rem",
            fontSize: "1.1rem",
            fontWeight: 600,
            borderRadius: 50,
            textDecoration: "none",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#333";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#111";
            e.target.style.transform = "translateY(0)";
          }}
        >
          Open RSVP Form →
        </a>
        <p style={{ marginTop: "1.5rem", fontSize: "0.95rem", color: "#888" }}>
          Please respond by September 1, 2026
        </p>
      </div>
    </div>
  );
}

function InfoTab() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h2
        style={{
          textAlign: "center",
          fontSize: "clamp(2rem,5vw,2.5rem)",
          marginBottom: "3rem",
          fontFamily: "'Playfair Display',Georgia,serif",
          fontWeight: 400
        }}
      >
        Wedding Information
      </h2>
      <div style={{ background: "#f9f9f9", padding: "2rem", borderRadius: 16, marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", textAlign: "center", color: "#333" }}>
          Schedule
        </h3>
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          {[
            ["4:00 PM", "Ceremony"],
            ["5:00 PM", "Cocktail Hour"],
            ["6:00 PM", "Reception & Dinner"],
            ["10:00 PM", "Send-off"]
          ].map(([time, ev], i) => (
            <div
              key={time}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "1rem 0",
                borderBottom: i < 3 ? "1px solid #e0e0e0" : "none",
                color: "#333"
              }}
            >
              <span style={{ fontWeight: 600, color: "#667eea" }}>{time}</span>
              <span>{ev}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "#f9f9f9", padding: "2rem", borderRadius: 16, marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", textAlign: "center", color: "#333" }}>
          Venue
        </h3>
        <p style={{ textAlign: "center", fontSize: "1.1rem", color: "#333" }}>
          <strong>The Garden Estate</strong>
          <br />
          123 Vineyard Lane
          <br />
          Charlottesville, VA 22902
        </p>
      </div>
      <div style={{ background: "#f9f9f9", padding: "2rem", borderRadius: 16, marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", textAlign: "center", color: "#333" }}>
          Travel & Stay
        </h3>
        <div style={{ lineHeight: 1.8, color: "#333" }}>
          <p style={{ marginBottom: "1rem" }}>
            <strong>Hotel Blocks:</strong>
          </p>
          <ul style={{ paddingLeft: "1.5rem", marginBottom: "1.5rem" }}>
            <li>The Charlottesville Inn - Book by Sept 1, 2026</li>
            <li>Downtown Suites - Book by Sept 1, 2026</li>
          </ul>
          <p>
            <strong>Getting There:</strong>
            <br />
            Charlottesville-Albemarle Airport (CHO) is 15 minutes from downtown. Rideshare and rental cars are readily
            available.
          </p>
        </div>
      </div>
      <div
        style={{
          background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
          padding: "2rem",
          borderRadius: 16,
          color: "white",
          textAlign: "center"
        }}
      >
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Dress Code</h3>
        <p style={{ fontSize: "1.1rem" }}>
          Cocktail Attire
          <br />
          <span style={{ fontSize: "0.95rem", opacity: 0.9 }}>(The ceremony will be outdoors on grass)</span>
        </p>
      </div>
    </div>
  );
}

function RegistryTab() {
  const registries = [
    { name: "Amazon", url: "https://amazon.com/wedding/your-registry", color: "#FF9900", icon: "🛍️" },
    { name: "Target", url: "https://target.com/gift-registry", color: "#CC0000", icon: "🎯" },
    { name: "Zola", url: "https://zola.com/registry", color: "#FF6B6B", icon: "💝" },
    { name: "Honeymoon Fund", url: "#", color: "#4ECDC4", icon: "✈️" }
  ];
  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h2
        style={{
          textAlign: "center",
          fontSize: "clamp(2rem,5vw,2.5rem)",
          marginBottom: "1.5rem",
          fontFamily: "'Playfair Display',Georgia,serif",
          fontWeight: 400
        }}
      >
        Registry
      </h2>
      <p style={{ textAlign: "center", fontSize: "1.1rem", marginBottom: "3rem", color: "#666" }}>
        Your presence is the best gift, but if you'd like to contribute to our future together, we've registered at
        these locations:
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
          gap: "1.5rem"
        }}
      >
        {registries.map((r) => (
          <a
            key={r.name}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#f9f9f9",
              padding: "2.5rem",
              borderRadius: 16,
              textAlign: "center",
              textDecoration: "none",
              color: "#333",
              border: "2px solid transparent",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = r.color;
              e.currentTarget.style.background = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.background = "#f9f9f9";
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>{r.icon}</div>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{r.name}</h3>
            <p style={{ fontSize: "0.9rem", color: "#888" }}>Click to view registry →</p>
          </a>
        ))}
      </div>
      <div style={{ marginTop: "3rem", padding: "2rem", background: "#fff9e6", borderRadius: 16, textAlign: "center" }}>
        <p style={{ fontSize: "1.05rem", color: "#666", lineHeight: 1.8 }}>
          <strong>💛 A Note from Us:</strong>
          <br />
          The most important gift is your presence on our special day. If you'd still like to give something, we'd be
          grateful for contributions toward our honeymoon adventure or home together!
        </p>
      </div>
    </div>
  );
}

function GuestBookTab({ entries, setEntries }) {
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
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2
        style={{
          textAlign: "center",
          fontSize: "clamp(2rem,5vw,2.5rem)",
          marginBottom: "1.5rem",
          fontFamily: "'Playfair Display',Georgia,serif",
          fontWeight: 400
        }}
      >
        Guest Book
      </h2>
      <p style={{ textAlign: "center", fontSize: "1.1rem", marginBottom: "3rem", color: "#666" }}>
        Leave us a message and snap a selfie! 📸
      </p>
      <form
        onSubmit={handleSubmit}
        style={{ background: "#f9f9f9", padding: "2.5rem", borderRadius: 16, marginBottom: "3rem" }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, color: "#333" }}>
            Your Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            required
            style={{
              width: "100%",
              padding: "1rem",
              border: "2px solid #e0e0e0",
              borderRadius: 12,
              fontSize: "1rem",
              fontFamily: "inherit"
            }}
          />
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, color: "#333" }}>
            Your Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your well wishes..."
            required
            rows={4}
            style={{
              width: "100%",
              padding: "1rem",
              border: "2px solid #e0e0e0",
              borderRadius: 12,
              fontSize: "1rem",
              fontFamily: "inherit",
              resize: "vertical"
            }}
          />
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, color: "#333" }}>
            Add a Selfie (Optional)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{
              width: "100%",
              padding: "1rem",
              border: "2px dashed #e0e0e0",
              borderRadius: 12,
              cursor: "pointer"
            }}
          />
          {photoPreview && (
            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <img
                src={photoPreview}
                alt="Preview"
                style={{ maxWidth: 200, maxHeight: 200, borderRadius: 12, objectFit: "cover" }}
              />
            </div>
          )}
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
            color: "white",
            border: "none",
            padding: "1.25rem",
            fontSize: "1.1rem",
            fontWeight: 600,
            borderRadius: 12,
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 8px 20px rgba(102,126,234,0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}
        >
          Sign Guest Book 💕
        </button>
      </form>
      <div>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "2rem", textAlign: "center", color: "#333" }}>
          Messages from Our Guests ({entries.length})
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
            gap: "1.5rem"
          }}
        >
          {entries.map((entry) => (
            <div
              key={entry.id}
              style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                transform: `rotate(${Math.random() * 4 - 2}deg)`
              }}
            >
              {entry.photo && (
                <img
                  src={entry.photo}
                  alt={entry.name}
                  style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 8, marginBottom: "1rem" }}
                />
              )}
              <p style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#333" }}>{entry.name}</p>
              <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: 1.6 }}>"{entry.message}"</p>
            </div>
          ))}
        </div>
        {entries.length === 0 && (
          <p style={{ textAlign: "center", color: "#999", fontSize: "1.1rem", marginTop: "1.5rem" }}>
            Be the first to sign the guest book! ✨
          </p>
        )}
      </div>
    </div>
  );
}

/* WEDDING PARTY TAB + CARDS (with folder-based photos and clean layout) */

import bears from "./assets/bears.png"
import brown from "./assets/brown.png"
import vt from "./assets/hokies.webp"
import dukes from "./assets/JMU.png"
import nu from "./assets/NU.png"
import sc from "./assets/SC.png"
import skins from "./assets/skins.png"
import ut from "./assets/UT.png"
import uva from "./assets/UVA.png"
import w from "./assets/W.png"
import wl from "./assets/WL.png"

function WeddingPartyTab() {
  const groomsmen = [
    {
      name: "Harry",
      relation: "Brother",
      photos: harryPhotos,
      role: "Best Man",
      maxBench: "135 lbs",
      fortyYard: "4.95s",
      handicap: "20.0",
      relationshipStatus: "Taken",
      currentCity: "Williamsburg, NY",
      college: "Northwestern University",
      collegeLogo: nu,
      footballTeam: "Cleveland Browns",
      footballLogo: brown,
      comment:
        "Let's hope Harry shows up on time to the ceremony."
    },
    {
      name: "Chuck",
      relation: "Brother",
      photos: chuckPhotos,
      role: "Groomsman",
      maxBench: "105 lbs",
      fortyYard: "5.2s",
      handicap: "20.0",
      relationshipStatus: "Taken",
      currentCity: "Chicago, IL",
      college: "University of Wisconsin",
      collegeLogo: w,
      footballTeam: "Chicago Bears",
      footballLogo: bears,
      comment:
        "Known for his inconsistency off the tee and homer betting style, make sure your eyes are peeled for when Chuck hits the dance floor."
    },
    {
      name: "Jacko",
      relation: "Brother",
      photos: jackoPhotos,
      role: "Groomsman",
      maxBench: "185 lbs",
      fortyYard: "5.8s",
      handicap: "20.0",
      relationshipStatus: "Single",
      currentCity: "Washington DC",
      college: "University of Virginia",
      collegeLogo: uva,
      footballTeam: "The Hokies",
      footballLogo: vt,
      comment:
        "Probably the most controversial character in the lineup, look for Jacko to get up on stage for the late night."
    },
    {
      name: "Cole Dickinson",
      relation: "Friend",
      photos: colePhotos,
      role: "Groomsman",
      maxBench: "285 lbs",
      fortyYard: "4.8s",
      handicap: "9.5",
      relationshipStatus: "Married",
      currentCity: "Charleston, SC",
      college: "University of South Carolina",
      collegeLogo: sc,
      footballTeam: "Washington Football Team",
      footballLogo: skins,
      comment:
        "It's too Cole for my Dickinson."
    },
    {
      name: "Henry Kreienbaum",
      relation: "Friend",
      photos: henryPhotos,
      role: "Groomsman",
      maxBench: "265 lbs",
      fortyYard: "5.3s",
      handicap: "15.0",
      relationshipStatus: "Taken",
      currentCity: "Atlanta, GA",
      college: "James Madison University",
      collegeLogo: dukes,
      footballTeam: "Washington Commanders",
      footballLogo: skins,
      comment:
        "Don't ask this guy about Nascar."
    },
    {
      name: "Oliver",
      relation: "Friend",
      photos: oliPhotos,
      role: "Groomsman",
      maxBench: "255 lbs",
      fortyYard: "4.6s",
      handicap: "22.0",
      relationshipStatus: "Taken",
      currentCity: "New York, NY",
      college: "Washington & Lee University",
      collegeLogo: wl,
      footballTeam: "Washington Redskins",
      footballLogo: skins,
      comment:
        "Can I get a roll tide."
    },
    {
      name: "Wyatt",
      relation: "Brother in law",
      photos: wyattPhotos,
      role: "Groomsman",
      maxBench: "225 lbs",
      fortyYard: "4.8s",
      handicap: "16.0",
      relationshipStatus: "Single",
      currentCity: "Knoxville, TN",
      college: "University of Tennessee",
      collegeLogo: ut,
      footballTeam: "The Vols",
      footballLogo: ut,
      comment:
        "Fill in description."
    }
  ];

  const bridesmaids = [
    {
      name: "Sarah Johnson",
      relation: "Sister",
      photos: sarahPhotos,
      role: "Maid of Honor",
      relationshipStatus: "Taken",
      currentCity: "Boston, MA",
      college: "Boston College",
      sorority: "Kappa Kappa Gamma",
      comment: "Can recite every line from The Office. Yes, all 9 seasons. It's both impressive and concerning."
    }
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2
        style={{
          textAlign: "center",
          fontSize: "clamp(2rem,5vw,2.5rem)",
          marginBottom: "1.5rem",
          fontFamily: "'Playfair Display',Georgia,serif",
          fontWeight: 400
        }}
      >
        Our Wedding Party
      </h2>
      <p style={{ textAlign: "center", fontSize: "1.1rem", marginBottom: "4rem", color: "#666" }}>
        Meet the amazing people standing by our side!
        <br />
        <span style={{ fontSize: "0.95rem", fontStyle: "italic" }}>(Tap the cards to see more!)</span>
      </p>
      <div style={{ marginBottom: "4rem" }}>
        <h3 style={{ fontSize: "1.8rem", marginBottom: "2rem", textAlign: "center", color: "#667eea" }}>
          Groom's Side 🤵
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {groomsmen.map((p) => (
            <GroomCard key={p.name} person={p} />
          ))}
        </div>
      </div>
      <div>
        <h3 style={{ fontSize: "1.8rem", marginBottom: "2rem", textAlign: "center", color: "#764ba2" }}>
          Bride's Side 👰
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {bridesmaids.map((p) => (
            <BridesmaidCard key={p.name} person={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

const GroomCard = React.memo(({ person }) => {
  const [showBack, setShowBack] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const color = "#667eea";
  const photos = (person.photos || []).filter(Boolean);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const cardHeight = isMobile ? MOBILE_CARD_HEIGHT : CARD_HEIGHT;
  const photoWidth = isMobile ? MOBILE_PHOTO_WIDTH : DESKTOP_PHOTO_WIDTH;

  const nextPhoto = (e) => {
    e.stopPropagation();
    if (photos.length <= 1) return;
    setPhotoIndex((i) => (i + 1) % photos.length);
  };

  return (
    <div style={{ width: "100%", perspective: 1000 }}>
      <AnimatePresence mode="wait">
        {!showBack ? (
          <motion.div
            key="front"
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: 90 }}
            transition={{ duration: 0.25 }}
            onClick={() => setShowBack(true)}
            style={{
              background: "white",
              borderRadius: 16,
              boxShadow: "0 3px 16px rgba(0,0,0,0.1)",
              borderTop: `6px solid ${color}`,
              cursor: "pointer",
              overflow: "hidden",
              height: cardHeight,
              display: "flex",
              flexDirection: "row"
            }}
          >
            <motion.div
              onClick={nextPhoto}
              key={photoIndex}
              initial={{ opacity: 0.2 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                width: photoWidth,
                height: "100%",
                background: photos[photoIndex]
                  ? `url(${photos[photoIndex]})`
                  : `linear-gradient(135deg,${color},${color}dd)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "4rem",
                flexShrink: 0
              }}
            >
              {!photos[photoIndex] && "👤"}
            </motion.div>
            <div style={{ flex: 1, padding: "1.5rem", overflow: "hidden" }}>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "0.25rem", color: "#333" }}>{person.name}</h3>
              <p style={{ color, fontWeight: 600, marginBottom: "0.25rem", fontSize: "1rem" }}>{person.role}</p>
              <p style={{ fontSize: "0.95rem", color: "#666", marginBottom: "1rem" }}>
                <strong>Relation:</strong> {person.relation}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "0.5rem" }}>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "#999" }}>Status</div>
                  <div style={{ fontSize: "0.95rem", color: "#333", fontWeight: 600 }}>
                    {person.relationshipStatus}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "#999" }}>City</div>
                  <div style={{ fontSize: "0.95rem", color: "#333", fontWeight: 600 }}>{person.currentCity}</div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: -90 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: 90 }}
            transition={{ duration: 0.25 }}
            onClick={() => setShowBack(false)}
            style={{
              background: "white",
              borderRadius: 16,
              boxShadow: "0 3px 16px rgba(0,0,0,0.1)",
              borderTop: `6px solid ${color}`,
              padding: "1.5rem",
              height: cardHeight,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              cursor: "pointer"
            }}
          >
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem", marginBottom: "1rem" }}>
                <StatCell label="Max Bench" value={person.maxBench} color={color} />
                <StatCell label="40-Yard" value={person.fortyYard} color={color} />
                <StatCell label="GHIN Index" value={person.handicap} color={color} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    flexWrap: "wrap"
                  }}
                >
                  <span style={{ fontSize: "0.85rem", color: "#999" }}>College:</span>
                  {person.collegeLogo && (
                    <img
                      src={person.collegeLogo}
                      alt="College Logo"
                      style={{ width: 24, height: 24, objectFit: "contain" }}
                    />
                  )}
                  <span style={{ fontSize: "1rem", fontWeight: 600, color: "#333" }}>{person.college}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    flexWrap: "wrap"
                  }}
                >
                  <span style={{ fontSize: "0.85rem", color: "#999" }}>Football Team:</span>
                  {person.footballLogo && (
                    <img
                      src={person.footballLogo}
                      alt="Team Logo"
                      style={{ width: 24, height: 24, objectFit: "contain" }}
                    />
                  )}
                  <span style={{ fontSize: "1rem", fontWeight: 600, color: "#333" }}>
                    {person.footballTeam}
                  </span>
                </div>
              </div>
              <div
                style={{
                  padding: "1rem",
                  background: "#f0f7ff",
                  borderRadius: 12,
                  fontSize: "0.9rem",
                  color: "#555",
                  fontStyle: "italic",
                  lineHeight: 1.5
                }}
              >
                💬 {person.comment}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const BridesmaidCard = React.memo(({ person }) => {
  const [showBack, setShowBack] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const color = "#764ba2";
  const photos = (person.photos || []).filter(Boolean);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const cardHeight = isMobile ? MOBILE_CARD_HEIGHT : CARD_HEIGHT;
  const photoWidth = isMobile ? MOBILE_PHOTO_WIDTH : DESKTOP_PHOTO_WIDTH;

  const nextPhoto = (e) => {
    e.stopPropagation();
    if (photos.length <= 1) return;
    setPhotoIndex((i) => (i + 1) % photos.length);
  };

  return (
    <div style={{ width: "100%", perspective: 1000 }}>
      <AnimatePresence mode="wait">
        {!showBack ? (
          <motion.div
            key="front"
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: 90 }}
            transition={{ duration: 0.25 }}
            onClick={() => setShowBack(true)}
            style={{
              background: "white",
              borderRadius: 16,
              overflow: "hidden",
              borderTop: `6px solid ${color}`,
              boxShadow: "0 3px 16px rgba(0,0,0,0.1)",
              cursor: "pointer",
              height: cardHeight,
              display: "flex",
              flexDirection: "row"
            }}
          >
            <motion.div
              onClick={nextPhoto}
              key={photoIndex}
              initial={{ opacity: 0.2 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                width: photoWidth,
                height: "100%",
                background: photos[photoIndex]
                  ? `url(${photos[photoIndex]})`
                  : `linear-gradient(135deg,${color},${color}dd)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                fontSize: "4rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {!photos[photoIndex] && "👤"}
            </motion.div>
            <div style={{ flex: 1, padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "0.25rem", color: "#333" }}>{person.name}</h3>
              <p style={{ color, fontWeight: 600, marginBottom: "0.25rem", fontSize: "1rem" }}>{person.role}</p>
              <p style={{ color: "#666", fontSize: "0.95rem", marginBottom: "1rem" }}>
                <strong>Relation:</strong> {person.relation}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "0.5rem" }}>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "#999" }}>Status</div>
                  <div style={{ fontSize: "0.95rem", color: "#333", fontWeight: 600 }}>
                    {person.relationshipStatus}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "#999" }}>City</div>
                  <div style={{ fontSize: "0.95rem", color: "#333", fontWeight: 600 }}>
                    {person.currentCity}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: -90 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: 90 }}
            transition={{ duration: 0.25 }}
            onClick={() => setShowBack(false)}
            style={{
              background: "white",
              borderRadius: 16,
              height: cardHeight,
              boxShadow: "0 3px 16px rgba(0,0,0,0.1)",
              borderTop: `6px solid ${color}`,
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              cursor: "pointer"
            }}
          >
            <div>
              <h3 style={{ textAlign: "center", marginBottom: "1rem", fontSize: "1.5rem", color: "#333" }}>
                More About {person.name} ✨
              </h3>
              <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.8rem", color: "#999" }}>College</div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "#333" }}>{person.college}</div>
              </div>
              <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.8rem", color: "#999" }}>Sorority</div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color }}>{person.sorority}</div>
              </div>
              <div
                style={{
                  padding: "1rem",
                  background: "#fff0f7",
                  borderRadius: 12,
                  fontSize: "0.9rem",
                  color: "#555",
                  fontStyle: "italic",
                  lineHeight: 1.5
                }}
              >
                💬 {person.comment}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
