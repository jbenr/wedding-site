import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import heroImage from "./assets/hero.jpg";
import scrollImage from "./assets/scroll2.png";
import { clickCountRef, hoosierCountRef, onValue, runTransaction } from "./firebase";

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

const PARTY_CARD_THEMES = {
  groom: {
    accent: "#5D7FA5",
    border: "#D6E1EC"
  },
  bride: {
    accent: "#8E6DA6",
    border: "#E6DCEF"
  }
};

const IU_LOGO_IMAGE =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Indiana_Hoosiers_logo.svg";
const CIGNETTI_IMAGE =
  "https://commons.wikimedia.org/wiki/Special:FilePath/2026-0117_Curt_Cignetti.jpeg";
const MENDOZA_IMAGE =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Fernando_Mendoza.jpg";
const HOOSIERS_TROPHY_IMAGE =
  "https://commons.wikimedia.org/wiki/Special:FilePath/2023-0109-CFPtitlegame-Stetson_Bennett_Trophy.jpg";
const GOLF_FORM_URL = "";
const CARD_FLIP_DURATION_MS = 650;

const INDIANA_CANDY_STRIPE = `repeating-linear-gradient(
  90deg,
  ${COLORS.indianaCrimson},
  ${COLORS.indianaCrimson} 20px,
  ${COLORS.indianaWhite} 20px,
  ${COLORS.indianaWhite} 40px
)`;

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
const ScheduleRow = ({ time, event, location, attire, note, noteHref, isLast, isMobile }) => (
  <div style={{
    padding: "0.8rem 0",
    borderBottom: isLast ? "none" : `1px solid ${COLORS.border}`
  }}>
    <div style={{ display: "flex", alignItems: "flex-start", gap: isMobile ? "0.5rem" : "0.75rem" }}>
      <div style={{ width: isMobile ? 62 : 100, flexShrink: 0, fontSize: isMobile ? "0.76rem" : "0.95rem", color: COLORS.lightText, whiteSpace: "nowrap", paddingTop: "0.05rem" }}>
        {time}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: isMobile ? "0.8rem" : "1rem", fontWeight: 500, color: COLORS.darkText, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{event}</div>
        {location && (
          <div style={{ marginTop: "0.15rem", fontSize: isMobile ? "0.68rem" : "0.82rem", color: COLORS.lightText, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {location}
          </div>
        )}
        {attire && (
          <div style={{ marginTop: "0.15rem", fontSize: isMobile ? "0.68rem" : "0.8rem", color: COLORS.mediumText, fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {attire}
          </div>
        )}
        {note && (
          <div style={{ marginTop: "0.15rem", fontSize: isMobile ? "0.66rem" : "0.76rem", color: COLORS.mediumText, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {noteHref ? (
              <a href={noteHref} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.darkText, textDecoration: "underline" }}>
                {note}
              </a>
            ) : (
              note
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

const getTabTitleStyle = (isMobile) => ({
  textAlign: "center",
  fontSize: isMobile ? "1.95rem" : "3rem",
  marginBottom: "0.5rem",
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 400,
  color: COLORS.darkText,
  fontStyle: "italic"
});

const getTabSubtitleStyle = (isMobile) => ({
  textAlign: "center",
  fontSize: isMobile ? "0.92rem" : "1rem",
  marginBottom: isMobile ? "2rem" : "2.5rem",
  color: COLORS.mediumText
});

const getSectionCardStyle = (isMobile) => ({
  background: COLORS.cardBg,
  padding: isMobile ? "1.3rem" : "2rem",
  borderRadius: 14,
  marginBottom: "1.5rem",
  boxShadow: "0 2px 15px rgba(44,36,32,0.05)",
  border: `1px solid ${COLORS.border}`
});

const getSectionTitleStyle = (isMobile) => ({
  fontSize: isMobile ? "1.25rem" : "1.4rem",
  marginBottom: "1.2rem",
  textAlign: "center",
  color: COLORS.darkText,
  fontWeight: 400,
  fontFamily: "'Cormorant Garamond', serif"
});

const getTabPanelMotion = (reducedMotion) => ({
  initial: reducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 },
  animate: reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
  exit: reducedMotion ? { opacity: 1 } : { opacity: 0, y: -12, position: "absolute", inset: 0, width: "100%" },
  transition: reducedMotion ? { duration: 0 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
});

const getStaggerContainerVariants = (reducedMotion) => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: reducedMotion ? { duration: 0 } : { staggerChildren: 0.08, delayChildren: 0.04 }
  }
});

const getStaggerItemVariants = (reducedMotion) => ({
  hidden: reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 },
  show: reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }
});

function TabButton({ id, label, tab, setTab, isMobile, shouldReduceMotion }) {
  return (
    <motion.button
      onClick={() => setTab(id)}
      whileHover={shouldReduceMotion ? undefined : { y: -1 }}
      whileTap={shouldReduceMotion ? undefined : { y: 1, scale: 0.99 }}
      style={{
        position: "relative",
        padding: isMobile ? "0.6rem 0.7rem" : "0.7rem 1.2rem",
        border: "none",
        background: "transparent",
        color: tab === id ? COLORS.darkText : COLORS.mediumText,
        fontSize: isMobile ? "0.72rem" : "0.9rem",
        fontWeight: tab === id ? 500 : 400,
        borderRadius: 8,
        cursor: "pointer",
        transition: "all 0.2s ease",
        whiteSpace: "nowrap",
        overflow: "hidden"
      }}
    >
      {tab === id && (
        <motion.span
          layoutId="active-tab-pill"
          transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 8,
            background: COLORS.primary,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)"
          }}
        />
      )}
      <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
    </motion.button>
  );
}

// Stat cell component
const StatCell = ({ label, value, color, background = COLORS.cream, borderColor = COLORS.border, labelColor = COLORS.lightText }) => (
  <div
    style={{
      textAlign: "center",
      background,
      padding: "0.6rem 0.4rem",
      borderRadius: 10,
      border: `1px solid ${borderColor}`
    }}
  >
    <div style={{ fontSize: "0.7rem", color: labelColor, marginBottom: "0.2rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
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
      backgroundImage: INDIANA_CANDY_STRIPE
    }}
  />
);

const getPeelGeometry = (progress, isMobile, peelOffset = { x: 0, y: 0 }) => {
  const handleSize = isMobile ? 70 : 84;
  const restFoldX = isMobile ? 18 : 22;
  const restFoldY = isMobile ? 16 : 20;
  const restRevealX = restFoldX + (isMobile ? 8 : 10);
  const restRevealY = restFoldY + (isMobile ? 7 : 9);
  const maxCornerX = isMobile ? 120 : 170;
  const maxCornerY = isMobile ? 100 : 145;
  const cornerX = Math.min(peelOffset.x, maxCornerX);
  const cornerY = Math.min(peelOffset.y, maxCornerY);
  const activeCornerX = progress > 0 ? cornerX : 0;
  const activeCornerY = progress > 0 ? cornerY : 0;
  const foldX = Math.min(
    isMobile ? 176 : 250,
    restFoldX + activeCornerX * 1.08 + (progress > 0 ? (isMobile ? 18 : 22) : 0)
  );
  const foldY = Math.min(
    isMobile ? 154 : 220,
    restFoldY + activeCornerY * 1.06 + (progress > 0 ? (isMobile ? 16 : 20) : 0)
  );

  return {
    handleSize,
    revealClipPath:
      progress <= 0
        ? `polygon(100% calc(100% - ${restRevealY}px), 100% 100%, calc(100% - ${restRevealX}px) 100%)`
        : `polygon(100% calc(100% - ${foldY}px), 100% 100%, calc(100% - ${foldX}px) 100%, calc(100% - ${activeCornerX}px) calc(100% - ${activeCornerY}px))`,
    flapClipPath:
      progress <= 0
        ? `polygon(100% calc(100% - ${foldY}px), 100% 100%, calc(100% - ${foldX}px) 100%)`
        : `polygon(100% calc(100% - ${foldY}px), calc(100% - ${activeCornerX}px) calc(100% - ${activeCornerY}px), calc(100% - ${foldX}px) 100%)`,
    shadowClipPath:
      progress <= 0
        ? `polygon(100% calc(100% - ${foldY + 2}px), 100% 100%, calc(100% - ${foldX + 2}px) 100%)`
        : `polygon(100% calc(100% - ${foldY + 2}px), calc(100% - ${Math.max(0, activeCornerX - 2)}px) calc(100% - ${Math.max(0, activeCornerY - 2)}px), calc(100% - ${foldX + 2}px) 100%)`
  };
};

function PeelOverlay({ isVisible, progress, peelOffset, isCommitting, isMobile, reducedMotion, onPointerDown }) {
  if (!isVisible) return null;

  const { handleSize, revealClipPath, flapClipPath, shadowClipPath } = getPeelGeometry(progress, isMobile, peelOffset);
  const revealVisible = isVisible;
  const foldIntensity = Math.min(1, progress * 1.2);
  const flapLift = reducedMotion ? 0 : Math.min(10, peelOffset.x * 0.022 + peelOffset.y * 0.02);
  const flapTilt = reducedMotion ? 0 : Math.min(4.5, peelOffset.x * 0.014 + peelOffset.y * 0.012);
  const paperOpacity = progress > 0 ? 0.98 : 0.94;
  const revealOpacity = 0.4 + progress * 0.38;

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.85 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      exit={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        pointerEvents: "none"
      }}
    >
      {revealVisible && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: revealClipPath,
              backgroundImage: INDIANA_CANDY_STRIPE,
              backgroundPosition: isMobile ? "0 0" : "right top",
              backgroundSize: "40px 100%",
              opacity: revealOpacity
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: revealClipPath,
              background:
                "linear-gradient(225deg, rgba(153, 0, 0, 0) 22%, rgba(153, 0, 0, 0.06) 58%, rgba(153, 0, 0, 0.15) 100%)"
              ,
              opacity: 0.7 + progress * 0.18
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: revealClipPath,
              background:
                "linear-gradient(235deg, rgba(255,255,255,0) 42%, rgba(255,255,255,0.14) 72%, rgba(255,255,255,0.26) 100%)"
              ,
              opacity: 0.5 + progress * 0.25
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: revealClipPath,
              background:
                "radial-gradient(circle at bottom right, rgba(255,255,255,0.28), rgba(255,255,255,0) 72%)",
              opacity: 0.25 + progress * 0.45
            }}
          />
        </>
      )}
      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: handleSize,
          height: handleSize,
          pointerEvents: "auto",
          cursor: isCommitting ? "default" : "grab",
          touchAction: "none"
        }}
        onPointerDown={onPointerDown}
      />
      <motion.div
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        exit={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: shadowClipPath,
            background: "linear-gradient(225deg, rgba(44,36,32,0), rgba(44,36,32,0.16))",
            filter: "blur(8px)",
            opacity: reducedMotion ? 0.14 : 0.12 + foldIntensity * 0.18,
            transform: `translate(${-flapLift * 0.16}px, ${-flapLift * 0.16}px)`
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: flapClipPath,
            background: `linear-gradient(145deg, rgba(255,255,255,${paperOpacity}) 0%, rgba(250, 246, 241, ${paperOpacity}) 36%, rgba(238, 228, 217, ${paperOpacity}) 68%, rgba(214, 198, 182, ${paperOpacity}) 100%)`,
            filter: "drop-shadow(-10px -10px 18px rgba(44,36,32,0.16))",
            transformOrigin: "bottom right",
            transform: reducedMotion
              ? "none"
              : `perspective(900px) rotateX(${foldIntensity * 9}deg) rotateY(${-foldIntensity * 6}deg) translate3d(${-flapLift * 0.22}px, ${-flapLift * 0.22}px, 0) rotate(${-flapTilt}deg)`
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: flapClipPath,
              backgroundImage: INDIANA_CANDY_STRIPE,
              backgroundPosition: "right bottom",
              backgroundSize: "40px 100%",
              opacity: 0.08
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: flapClipPath,
              background:
                "linear-gradient(225deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.18) 36%, rgba(153,0,0,0.06) 100%)"
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: flapClipPath,
              background:
                "linear-gradient(315deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 62%, rgba(120, 36, 36, 0.16) 82%, rgba(94, 18, 18, 0.28) 100%)"
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: flapClipPath,
              background:
                "linear-gradient(315deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 28%, rgba(44,36,32,0.14) 100%)",
              mixBlendMode: "multiply"
            }}
          />scr
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: flapClipPath,
              boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.7), inset -1px -1px 0 rgba(160, 138, 122, 0.2)"
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: flapClipPath,
              background:
                "linear-gradient(215deg, rgba(255,255,255,0) 52%, rgba(255,255,255,0.66) 70%, rgba(255,255,255,0.06) 100%)",
              opacity: 0.45
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

function HoosiersOverlay({ isVisible, isMobile, reducedMotion, hoosierCount, onClose, onGoHoosiers }) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1 }}
      exit={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 170,
        overflowY: "auto",
        background: `linear-gradient(180deg, rgba(249, 245, 240, 0.82), rgba(255, 255, 255, 0.9)), ${INDIANA_CANDY_STRIPE}`,
        backgroundSize: "100% 100%, 40px 100%"
      }}
    >
      <motion.div
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: 28 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        exit={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98, y: 18 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        style={{
          minHeight: "100%",
          padding: isMobile ? "5.5rem 1.25rem 2rem" : "6rem 2rem 3rem",
          position: "relative"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle at top left, rgba(153, 0, 0, 0.16), transparent 32%), radial-gradient(circle at bottom right, rgba(153, 0, 0, 0.22), transparent 30%), linear-gradient(135deg, rgba(255,255,255,0.52), rgba(255,255,255,0.18))`,
            pointerEvents: "none"
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backdropFilter: "blur(4px)",
            background: "rgba(250, 246, 241, 0.28)",
            pointerEvents: "none"
          }}
        />
        <button
          onClick={onClose}
          style={{
            position: "fixed",
            top: isMobile ? 16 : 22,
            right: isMobile ? 16 : 22,
            zIndex: 2,
            border: "1px solid rgba(153, 0, 0, 0.18)",
            background: "rgba(255,255,255,0.85)",
            color: COLORS.indianaCrimson,
            padding: "0.7rem 1rem",
            borderRadius: 999,
            cursor: "pointer",
            fontSize: "0.8rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 600,
            backdropFilter: "blur(10px)"
          }}
        >
          Back to Wedding Site
        </button>
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1.05fr) minmax(420px, 0.95fr)",
            gap: isMobile ? "2rem" : "2.5rem",
            alignItems: "center"
          }}
        >
          <div>
            <div
              style={{
                display: "inline-block",
                marginBottom: "1rem",
                padding: "0.4rem 0.7rem",
                borderRadius: 999,
                background: "rgba(153, 0, 0, 0.08)",
                color: COLORS.indianaCrimson,
                fontSize: "0.75rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 600
              }}
            >
              National Champions
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "1.25rem"
              }}
            >
              <div
                style={{
                  width: isMobile ? 74 : 96,
                  height: isMobile ? 92 : 118,
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.74)",
                  border: "1px solid rgba(153, 0, 0, 0.14)",
                  boxShadow: "0 16px 34px rgba(44,36,32,0.12)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0
                }}
              >
                <img
                  src={IU_LOGO_IMAGE}
                  alt="Indiana Hoosiers logo"
                  style={{
                    width: "64%",
                    height: "64%",
                    objectFit: "contain"
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: isMobile ? "0.82rem" : "0.88rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: COLORS.indianaCrimson,
                  fontWeight: 600
                }}
              >
                Indiana Football
              </div>
            </div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: isMobile ? "3.5rem" : "6.2rem",
                lineHeight: 0.92,
                color: COLORS.indianaCrimson,
                marginBottom: "1rem",
                fontStyle: "italic",
                fontWeight: 600
              }}
            >
              Go Hoosiers
            </h2>
            <div
              style={{
                fontSize: isMobile ? "1rem" : "1.15rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: COLORS.indianaCrimson,
                fontWeight: 700,
                marginBottom: "1rem"
              }}
            >
              National Champions
            </div>
            <p
              style={{
                fontSize: isMobile ? "1rem" : "1.15rem",
                lineHeight: 1.8,
                color: COLORS.darkText,
                maxWidth: 520,
                marginBottom: "1.5rem"
              }}
            >
              The hidden page opens into a full Indiana celebration: candy stripes, the IU monogram, Curt Cignetti, Fernando Mendoza, and the championship trophy.
            </p>
            <button
              className="press-button"
              onClick={onGoHoosiers}
              style={{
                background: COLORS.indianaCrimson,
                color: "#FFFFFF",
                border: "none",
                padding: isMobile ? "0.9rem 1.8rem" : "1rem 2.3rem",
                fontSize: isMobile ? "0.95rem" : "1rem",
                fontWeight: 600,
                borderRadius: 999,
                cursor: "pointer",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "0.75rem"
              }}
            >
              Go Hoosiers
            </button>
            <div style={{ fontSize: "0.9rem", color: COLORS.mediumText }}>
              {hoosierCount.toLocaleString()} Hoosier cheers counted
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gridTemplateRows: isMobile ? "repeat(4, auto)" : "auto auto",
              gap: "1rem"
            }}
          >
            <div
              style={{
                gridColumn: isMobile ? "auto" : "1 / span 2",
                background: "rgba(255,255,255,0.74)",
                borderRadius: 26,
                border: "1px solid rgba(153, 0, 0, 0.12)",
                padding: isMobile ? "1.1rem" : "1.3rem",
                boxShadow: "0 22px 46px rgba(44,36,32,0.12)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  marginBottom: "1rem"
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: COLORS.indianaCrimson,
                      fontWeight: 600,
                      marginBottom: "0.35rem"
                    }}
                  >
                    2026 Season
                  </div>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: isMobile ? "2rem" : "2.5rem",
                      fontStyle: "italic",
                      color: COLORS.darkText
                    }}
                  >
                    Indiana National Champions
                  </div>
                </div>
                <img
                  src={IU_LOGO_IMAGE}
                  alt="Indiana Hoosiers logo"
                  style={{
                    width: isMobile ? 52 : 66,
                    height: isMobile ? 64 : 82,
                    objectFit: "contain",
                    opacity: 0.95
                  }}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                  gap: "0.9rem"
                }}
              >
                {[
                  { src: CIGNETTI_IMAGE, label: "Curt Cignetti" },
                  { src: MENDOZA_IMAGE, label: "Fernando Mendoza" },
                  { src: HOOSIERS_TROPHY_IMAGE, label: "CFP Trophy" }
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: "#fff",
                      borderRadius: 18,
                      overflow: "hidden",
                      border: "1px solid rgba(153, 0, 0, 0.1)"
                    }}
                  >
                    <img
                      src={item.src}
                      alt={item.label}
                      style={{
                        display: "block",
                        width: "100%",
                        aspectRatio: "1 / 1",
                        objectFit: "cover"
                      }}
                    />
                    <div
                      style={{
                        padding: "0.85rem 0.9rem",
                        fontSize: "0.82rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: COLORS.indianaCrimson,
                        fontWeight: 600,
                        textAlign: "center"
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.74)",
                borderRadius: 22,
                border: "1px solid rgba(153, 0, 0, 0.12)",
                padding: isMobile ? "1rem" : "1.15rem",
                boxShadow: "0 18px 36px rgba(44,36,32,0.1)"
              }}
            >
              <div
                style={{
                  fontSize: "0.78rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: COLORS.indianaCrimson,
                  fontWeight: 600,
                  marginBottom: "0.5rem"
                }}
              >
                Stripe Status
              </div>
              <div style={{ color: COLORS.darkText, lineHeight: 1.7 }}>
                Candy stripes all the way out. Full reveal, full crimson, full championship energy.
              </div>
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.74)",
                borderRadius: 22,
                border: "1px solid rgba(153, 0, 0, 0.12)",
                padding: isMobile ? "1rem" : "1.15rem",
                boxShadow: "0 18px 36px rgba(44,36,32,0.1)"
              }}
            >
              <div
                style={{
                  fontSize: "0.78rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: COLORS.indianaCrimson,
                  fontWeight: 600,
                  marginBottom: "0.5rem"
                }}
              >
                Bloomington
              </div>
              <div style={{ color: COLORS.darkText, lineHeight: 1.7 }}>
                Cignetti on the sideline, Mendoza under center, the trophy on display, and the IU logo front and center.
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const [tab, setTab] = useState("main");
  const [buttonCount, setButtonCount] = useState(0);
  const [hoosierCount, setHoosierCount] = useState(0);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showPatterns, setShowPatterns] = useState(false);
  const [showHoosierCorner, setShowHoosierCorner] = useState(false);
  const [showHoosierPage, setShowHoosierPage] = useState(false);
  const [peelProgress, setPeelProgress] = useState(0);
  const [isPeelCommitting, setIsPeelCommitting] = useState(false);
  const [peelOffset, setPeelOffset] = useState({ x: 0, y: 0 });
  const isMobile = useIsMobile();
  const shouldReduceMotion = useReducedMotion();
  const activeTabRef = useRef(null);
  const peelStartPointRef = useRef(null);
  const peelCommitTimerRef = useRef(null);
  const [tabContentHeight, setTabContentHeight] = useState(null);
  const tabHeightTransition = shouldReduceMotion ? { duration: 0 } : { duration: 0.58, ease: [0.16, 1, 0.3, 1] };

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

  useEffect(() => {
    const unsubscribe = onValue(hoosierCountRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null) setHoosierCount(val);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (tab !== "main") {
      setShowHoosierCorner(false);
      setShowHoosierPage(false);
      setPeelProgress(0);
      setIsPeelCommitting(false);
      setPeelOffset({ x: 0, y: 0 });
    }
  }, [tab]);

  useEffect(() => () => {
    if (peelCommitTimerRef.current) {
      window.clearTimeout(peelCommitTimerRef.current);
    }
  }, []);

  useLayoutEffect(() => {
    const node = activeTabRef.current;
    if (!node) return undefined;

    const updateHeight = () => {
      setTabContentHeight(node.getBoundingClientRect().height);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    resizeObserver.observe(node);

    return () => resizeObserver.disconnect();
  }, [tab, isMobile]);

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

  const handleRevealHoosierCorner = () => {
    setShowHoosierCorner(true);
    setPeelProgress(0);
    setIsPeelCommitting(false);
    setPeelOffset({ x: 0, y: 0 });
  };

  const handleOpenHoosierPage = () => {
    setShowHoosierCorner(false);
    setShowHoosierPage(true);
    setPeelProgress(0);
    setIsPeelCommitting(false);
    setPeelOffset({ x: 0, y: 0 });
  };

  const handleCloseHoosierPage = () => {
    setShowHoosierPage(false);
    setShowHoosierCorner(false);
    setPeelProgress(0);
    setIsPeelCommitting(false);
    setPeelOffset({ x: 0, y: 0 });
  };

  const handleGoHoosiers = () => {
    runTransaction(hoosierCountRef, (current) => (current || 0) + 1);
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.72 },
      colors: [COLORS.indianaCrimson, COLORS.indianaWhite, COLORS.primary],
      zIndex: 9999
    });
  };

  const handlePeelPointerDown = (event) => {
    if (isPeelCommitting) return;
    event.preventDefault();
    peelStartPointRef.current = { x: event.clientX, y: event.clientY };
    const maxPull = isMobile ? 150 : 210;

    const handlePointerMove = (moveEvent) => {
      if (!peelStartPointRef.current || isPeelCommitting) return;
      const dx = Math.max(0, peelStartPointRef.current.x - moveEvent.clientX);
      const dy = Math.max(0, peelStartPointRef.current.y - moveEvent.clientY);
      const nextOffset = {
        x: Math.min(dx, isMobile ? 120 : 170),
        y: Math.min(dy, isMobile ? 100 : 145)
      };
      setPeelOffset(nextOffset);
      setPeelProgress(Math.min(1, (dx + dy) / maxPull));
    };

    const handlePointerUp = (upEvent) => {
      const dx = peelStartPointRef.current ? Math.max(0, peelStartPointRef.current.x - upEvent.clientX) : 0;
      const dy = peelStartPointRef.current ? Math.max(0, peelStartPointRef.current.y - upEvent.clientY) : 0;
      const nextProgress = Math.min(1, (dx + dy) / maxPull);

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      peelStartPointRef.current = null;

      if (nextProgress > 0.72) {
        setIsPeelCommitting(true);
        setPeelProgress(1);
        setPeelOffset({
          x: isMobile ? 120 : 170,
          y: isMobile ? 100 : 145
        });
        peelCommitTimerRef.current = window.setTimeout(() => {
          handleOpenHoosierPage();
        }, shouldReduceMotion ? 0 : 420);
      } else {
        setPeelProgress(0);
        setPeelOffset({ x: 0, y: 0 });
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
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
            reducedMotion={shouldReduceMotion}
            onRevealHoosierCorner={handleRevealHoosierCorner}
          />
        );
      case "rsvp":
        return <RSVPTab isMobile={isMobile} reducedMotion={shouldReduceMotion} />;
      case "info":
        return <InfoTab isMobile={isMobile} reducedMotion={shouldReduceMotion} />;
      case "party":
        return <WeddingPartyTab isMobile={isMobile} reducedMotion={shouldReduceMotion} />;
      case "registry":
        return <RegistryTab isMobile={isMobile} reducedMotion={shouldReduceMotion} />;
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
  const peelActive = tab === "main" && showHoosierCorner && !showHoosierPage;

  return (
    <>
      {/* GLOBAL STYLES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Lora:wght@400;500;600&display=swap');

        .press-button {
          position: relative;
          transition: transform 0.06s ease, box-shadow 0.06s ease, letter-spacing 0.06s ease;
          box-shadow: 0 4px 0 rgba(0,0,0,0.15), 0 6px 12px rgba(0,0,0,0.08) !important;
        }
        .press-button:active {
          transform: translateY(3px) scaleY(0.95) scaleX(1.02) !important;
          box-shadow: 0 0px 0 rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.05) !important;
          letter-spacing: -0.02em;
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

        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column"
          }}
        >
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
                <TabButton id="main" label="Home" tab={tab} setTab={setTab} isMobile={isMobile} shouldReduceMotion={shouldReduceMotion} />
                <TabButton id="rsvp" label="RSVP" tab={tab} setTab={setTab} isMobile={isMobile} shouldReduceMotion={shouldReduceMotion} />
                <TabButton id="info" label="Details" tab={tab} setTab={setTab} isMobile={isMobile} shouldReduceMotion={shouldReduceMotion} />
                <TabButton id="party" label="Wedding Party" tab={tab} setTab={setTab} isMobile={isMobile} shouldReduceMotion={shouldReduceMotion} />
                <TabButton id="registry" label="Registry" tab={tab} setTab={setTab} isMobile={isMobile} shouldReduceMotion={shouldReduceMotion} />
              </div>
            </div>
          </div>

          {/* CONTENT AREA - CENTERED with margin auto */}
          <motion.div
            layout
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              ...centeredContentStyle,
              flex: 1,
              position: "relative",
              padding: isMobile ? "2rem 1rem" : "3rem 2rem",
              minHeight: "70vh",
              background: COLORS.bg
            }}
          >
            <motion.div
              initial={false}
              animate={shouldReduceMotion ? { height: "auto" } : { height: tabContentHeight || "auto" }}
              transition={tabHeightTransition}
              style={{
                position: "relative",
                overflow: "hidden",
                background: COLORS.bg
              }}
            >
              <AnimatePresence mode="sync" initial={false}>
                <motion.div
                  key={tab}
                  ref={activeTabRef}
                  {...getTabPanelMotion(shouldReduceMotion)}
                  style={{ width: "100%" }}
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </motion.div>
            <AnimatePresence>
              {peelActive && (
                <PeelOverlay
                  isVisible={peelActive}
                  progress={peelProgress}
                  peelOffset={peelOffset}
                  isCommitting={isPeelCommitting}
                  isMobile={isMobile}
                  reducedMotion={shouldReduceMotion}
                  onPointerDown={handlePeelPointerDown}
                />
              )}
            </AnimatePresence>
          </motion.div>

          {/* FOOTER - Full width background */}
          <footer
            style={{
              width: "100%",
              textAlign: "center",
              padding: "3rem 1.5rem",
              background: COLORS.primary,
              color: COLORS.darkText
            }}
          >
            <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem", fontWeight: 300, fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}>
              We can't wait to celebrate with you
            </p>
            <p style={{ fontSize: "0.7rem", opacity: 0.5, marginTop: "1rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Ben & Emily &middot; October 24, 2026
            </p>
          </footer>
        </div>

        <AnimatePresence>
          {tab === "main" && showHoosierPage && (
            <HoosiersOverlay
              isVisible={showHoosierPage}
              isMobile={isMobile}
              reducedMotion={shouldReduceMotion}
              hoosierCount={hoosierCount}
              onClose={handleCloseHoosierPage}
              onGoHoosiers={handleGoHoosiers}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ============================================
   MAIN TAB
   ============================================ */

function MainTab({ photoBuckets, buttonCount, handleButtonClick, downloadCalendarEvent, isMobile, reducedMotion, onRevealHoosierCorner }) {
  const [indices, setIndices] = useState(photoBuckets.map(() => 0));
  const [holdProgress, setHoldProgress] = useState(0);
  const containerVariants = getStaggerContainerVariants(reducedMotion);
  const itemVariants = getStaggerItemVariants(reducedMotion);
  const holdTimerRef = useRef(null);
  const longPressTriggeredRef = useRef(false);
  const holdStartRef = useRef(0);
  const holdAnimationRef = useRef(null);

  useEffect(() => () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
    }
    if (holdAnimationRef.current) {
      cancelAnimationFrame(holdAnimationRef.current);
    }
  }, []);

  const cycle = (slot) =>
    setIndices((prev) =>
      prev.map((v, i) => (i === slot && photoBuckets[slot].length > 0 ? (v + 1) % photoBuckets[slot].length : v))
    );

  const clearCelebrateHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdAnimationRef.current) {
      cancelAnimationFrame(holdAnimationRef.current);
      holdAnimationRef.current = null;
    }
  };

  const updateHoldProgress = () => {
    const elapsed = performance.now() - holdStartRef.current;
    const nextProgress = Math.max(0, Math.min(1, (elapsed - 5000) / 5000));
    setHoldProgress(nextProgress);

    if (elapsed >= 10000) {
      longPressTriggeredRef.current = true;
      clearCelebrateHold();
      setHoldProgress(0);
      onRevealHoosierCorner();
      return;
    }

    holdAnimationRef.current = requestAnimationFrame(updateHoldProgress);
  };

  const handleCelebratePointerDown = () => {
    longPressTriggeredRef.current = false;
    clearCelebrateHold();
    holdStartRef.current = performance.now();
    setHoldProgress(0);
    holdAnimationRef.current = requestAnimationFrame(updateHoldProgress);
  };

  const handleCelebratePointerUp = () => {
    clearCelebrateHold();
    setHoldProgress(0);
  };

  const handleCelebrateTap = (event) => {
    if (longPressTriggeredRef.current) {
      event.preventDefault();
      longPressTriggeredRef.current = false;
      return;
    }
    handleButtonClick();
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      {/* Page Title */}
      <motion.h2 variants={itemVariants} style={{
        textAlign: "center",
        fontSize: isMobile ? "min(9vw, 2.9rem)" : "min(10vw, 3.5rem)",
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontWeight: 300,
        fontStyle: "italic",
        color: COLORS.darkText,
        marginBottom: "0.3rem",
        letterSpacing: "0.02em"
      }}>
        Ben & Emily
      </motion.h2>
      <motion.p variants={itemVariants} style={{
        textAlign: "center",
        fontSize: isMobile ? "0.68rem" : "min(3vw, 0.8rem)",
        color: COLORS.lightText,
        textTransform: "uppercase",
        letterSpacing: "0.2em",
        marginBottom: "2rem"
      }}>
        October 24, 2026 &nbsp;&middot;&nbsp; Charlottesville, VA
      </motion.p>

      {/* Photo Grid */}
      <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "1.2rem", marginBottom: "2.5rem" }}>
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
      </motion.div>

      {/* Story Text */}
      <motion.div variants={itemVariants} style={{ padding: isMobile ? "1rem 0.5rem" : "1.5rem 2rem", marginBottom: "2rem" }}>
        <p style={{ fontSize: isMobile ? "0.82rem" : "0.9rem", lineHeight: 1.8, color: COLORS.mediumText, textAlign: "center", marginBottom: "0.8rem" }}>
          Emily and Ben met on Halloween in Atlanta, with Emily dressed as Padme and Ben as Anakin. Since then, life has taken them from Atlanta to New York City, where they&apos;ve built a home together on the Upper East Side.
        </p>
        <p style={{ fontSize: isMobile ? "0.82rem" : "0.9rem", lineHeight: 1.8, color: COLORS.mediumText, textAlign: "center", marginBottom: "0.8rem" }}>
          We&apos;re looking forward to celebrating this next chapter with you. Here you&apos;ll find all the details about our wedding weekend, travel information, and our registry.
        </p>
        <p style={{ fontSize: isMobile ? "0.82rem" : "0.9rem", lineHeight: 1.8, color: COLORS.mediumText, textAlign: "center" }}>
          We can&apos;t wait to celebrate together!
        </p>
      </motion.div>

      {/* Save the Date + Excitement */}
      <motion.div variants={itemVariants} style={{ textAlign: "center", padding: isMobile ? "1.5rem 1rem" : "2rem", borderTop: `1px solid ${COLORS.border}`, marginTop: "1rem", position: "relative", overflow: "visible" }}>
        <p style={{ fontSize: isMobile ? "0.78rem" : "0.85rem", color: COLORS.lightText, marginBottom: "1rem", letterSpacing: "0.05em" }}>
          Save the date — add it to your calendar so you don't forget!
        </p>
        <button
          className="press-button"
          onClick={downloadCalendarEvent}
          style={{
            background: COLORS.accent,
            color: "#FFFFFF",
            border: "none",
            padding: "0.7rem 1.6rem",
            fontSize: isMobile ? "0.8rem" : "0.85rem",
            fontWeight: 500,
            borderRadius: 50,
            cursor: "pointer",
            letterSpacing: "0.05em",
            marginBottom: "2rem"
          }}
        >
          Add to Calendar
        </button>

        <div style={{ width: 40, height: 1, background: COLORS.border, margin: "0 auto 2rem" }} />

        <p style={{ fontSize: isMobile ? "0.78rem" : "0.85rem", color: COLORS.lightText, marginBottom: "0.8rem" }}>
          Show us how excited you are!
        </p>
        <button
          className="press-button"
          onClick={handleCelebrateTap}
          onPointerDown={handleCelebratePointerDown}
          onPointerUp={handleCelebratePointerUp}
          onPointerLeave={handleCelebratePointerUp}
          onPointerCancel={handleCelebratePointerUp}
          style={{
            position: "relative",
            overflow: "hidden",
            background: COLORS.accent,
            color: "#FFFFFF",
            border: "none",
            padding: "0.7rem 1.6rem",
            fontSize: isMobile ? "0.8rem" : "0.85rem",
            fontWeight: 500,
            borderRadius: 50,
            cursor: "pointer",
            marginBottom: "0.5rem",
            letterSpacing: "0.05em"
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: 0,
              width: `${holdProgress * 100}%`,
              background: "linear-gradient(90deg, rgba(153, 0, 0, 0.28), rgba(153, 0, 0, 0.55))",
              transition: holdProgress === 0 ? "width 0.18s ease-out" : "none"
            }}
          />
          <span style={{ position: "relative", zIndex: 1 }}>
          Can't Wait!
          </span>
        </button>
        <div style={{ fontSize: isMobile ? "0.7rem" : "0.75rem", color: COLORS.lightText }}>{buttonCount.toLocaleString()} clicks</div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================
   RSVP TAB
   ============================================ */

function RSVPTab({ isMobile, reducedMotion }) {
  const containerVariants = getStaggerContainerVariants(reducedMotion);
  const itemVariants = getStaggerItemVariants(reducedMotion);

  if (!RSVP_ENABLED) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show">
        <motion.h2 variants={itemVariants} style={getTabTitleStyle(isMobile)}>RSVP</motion.h2>
        <motion.p variants={itemVariants} style={getTabSubtitleStyle(isMobile)}>Please let us know if you can join us</motion.p>
        <motion.p variants={itemVariants} style={{ textAlign: "center", fontSize: isMobile ? "1rem" : "1.15rem", color: COLORS.mediumText, fontFamily: "'Cormorant Garamond', serif" }}>
          Coming soon
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <motion.h2 variants={itemVariants} style={getTabTitleStyle(isMobile)}>RSVP</motion.h2>
      <motion.p variants={itemVariants} style={getTabSubtitleStyle(isMobile)}>Please let us know if you can join us</motion.p>

      <motion.div variants={itemVariants} style={{ ...getSectionCardStyle(isMobile), padding: isMobile ? "1.5rem" : "2.5rem", textAlign: "center" }}>
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
      </motion.div>
    </motion.div>
  );
}

/* ============================================
   INFO TAB
   ============================================ */

function InfoTab({ isMobile, reducedMotion }) {
  const cardStyle = getSectionCardStyle(isMobile);
  const plainSectionStyle = {
    padding: isMobile ? "0.4rem 0 0.8rem" : "0.6rem 0 1rem",
    marginBottom: "1.5rem"
  };
  const schedulePaperStyle = {
    position: "relative",
    backgroundColor: COLORS.bg,
    backgroundImage: `url(${scrollImage})`,
    backgroundPosition: "60% top",
    backgroundRepeat: "no-repeat",
    backgroundSize: isMobile ? "108% 100%" : "106% 100%",
    padding: isMobile ? "6.35rem 1.1rem 3.75rem" : "8.2rem 2.15rem 5rem",
    marginBottom: "1.7rem",
    overflow: "hidden"
  };
  const sectionTitle = (text) => (
    <h3 style={getSectionTitleStyle(isMobile)}>
      {text}
    </h3>
  );
  const containerVariants = getStaggerContainerVariants(reducedMotion);
  const itemVariants = getStaggerItemVariants(reducedMotion);
  const dayDivider = () => (
    <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "0.65rem" : "0.9rem", margin: isMobile ? "1.6rem 0 1.2rem" : "1.8rem 0 1.4rem" }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${COLORS.border})` }} />
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "0.4rem" : "0.55rem", color: COLORS.accent, flexShrink: 0 }}>
        <div style={{ width: 8, height: 8, border: `1px solid ${COLORS.accent}`, transform: "rotate(45deg)" }} />
        <div style={{ width: isMobile ? 18 : 26, height: 1, background: COLORS.accent, opacity: 0.7 }} />
        <div style={{ width: 8, height: 8, border: `1px solid ${COLORS.accent}`, transform: "rotate(45deg)" }} />
      </div>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${COLORS.border}, transparent)` }} />
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <motion.h2 variants={itemVariants} style={getTabTitleStyle(isMobile)}>Wedding Details</motion.h2>
      <motion.p variants={itemVariants} style={getTabSubtitleStyle(isMobile)}>Everything you need to know</motion.p>

      {/* Weekend Schedule */}
      <motion.div variants={itemVariants} style={schedulePaperStyle}>
        <div
          style={{
            position: "relative",
            zIndex: 1
          }}
        >
          <h3 style={{
            fontSize: isMobile ? "1.6rem" : "2.2rem",
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

            <ScheduleRow time="TBD" event="Scramble Golf Tournament" location="Birdwood Golf Club" note="If interested, fill out this form." noteHref={GOLF_FORM_URL || undefined} isMobile={isMobile} />
            <ScheduleRow time="TBD" event="Rehearsal Dinner" location="Farmington Country Club | The Jefferson Room" attire="Cocktail Attire" isMobile={isMobile} />
            <ScheduleRow time="9:00 PM" event="Welcome Party" location="Farmington Country Club" attire="Cocktail Attire" isLast isMobile={isMobile} />

            {dayDivider()}

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

            <ScheduleRow time="5:00 PM" event="Ceremony" location="Christ Episcopal Church" attire="Black Tie Optional" isMobile={isMobile} />
            <ScheduleRow time="6:30 PM" event="Cocktail Hour" location="Rosemont Farm" attire="Black Tie Optional" isMobile={isMobile} />
            <ScheduleRow time="7:30 PM" event="Reception & Dinner" location="Rosemont Farm" attire="Black Tie Optional" isMobile={isMobile} />
            <ScheduleRow time="11:00 PM" event="Late Night" location="Rosemont Farm" attire="Black Tie Optional" isLast isMobile={isMobile} />
          </div>
        </div>
      </motion.div>

      {/* Travel & Hotels */}
      <motion.div variants={itemVariants} style={plainSectionStyle}>
        {sectionTitle("Travel & Stay")}
        <div style={{ lineHeight: 1.8, color: COLORS.mediumText, fontSize: isMobile ? "0.88rem" : "0.95rem" }}>
          <p style={{ marginBottom: "0.8rem" }}><strong style={{ color: COLORS.darkText }}>Hotels with Room Blocks:</strong></p>
          <ul style={{ paddingLeft: "1.5rem", marginBottom: "1.2rem" }}>
            <li style={{ marginBottom: "0.4rem" }}>
              <a href="https://be.synxis.com/?Hotel=48984&Chain=10237&arrive=2026-10-23&depart=2026-10-25&adult=1&child=0&group=1281" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.primary, textDecoration: "underline" }}>
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
      </motion.div>

      {/* Shuttle Information */}
      <motion.div variants={itemVariants} style={plainSectionStyle}>
        {sectionTitle("Shuttle Information")}
        <p style={{ textAlign: "center", fontSize: "1.1rem", color: COLORS.mediumText, fontFamily: "'Cormorant Garamond', serif" }}>
          Coming Soon
        </p>
      </motion.div>

      {/* Things to Do */}
      <motion.div variants={itemVariants} style={plainSectionStyle}>
        {sectionTitle("Things to Do in Charlottesville")}
        <p style={{ fontSize: isMobile ? "0.84rem" : "0.9rem", color: COLORS.mediumText, lineHeight: 1.9, marginBottom: "1.2rem" }}>
          <strong style={{ color: COLORS.darkText }}>Dining</strong> — Don't miss Riverside for lunch by the water, Bodo's Bagels for the best bagels in town, and C&O Restaurant for a Charlottesville classic.
        </p>
        <p style={{ fontSize: isMobile ? "0.84rem" : "0.9rem", color: COLORS.mediumText, lineHeight: 1.9, marginBottom: "1.2rem" }}>
          <strong style={{ color: COLORS.darkText }}>Drinks & Wine</strong> — Charlottesville is wine country! King Family Vineyards, Pippin Hill Farm & Vineyards, and Early Mountain Vineyards are all beautiful. Check out <a href="https://raggedbranch.com/" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.darkText }}>Ragged Branch Distillery</a> for Virginia bourbon, and <a href="https://www.prn.beer/" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.darkText }}>Pro Re Nata Brewery</a> for craft beer. In town, The Whiskey Jar and Coup Deville's are great for a casual drink.
        </p>
        <p style={{ fontSize: isMobile ? "0.84rem" : "0.9rem", color: COLORS.mediumText, lineHeight: 1.9, marginBottom: "1.2rem" }}>
          <strong style={{ color: COLORS.darkText }}>Shopping</strong> — Stroll the Downtown Mall, a charming pedestrian mall with boutiques and restaurants. Be sure to stop by <a href="https://quattrotizi.com/" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.darkText }}>Quattro Tizi</a> at the Dairy Market for men's and women's clothing.
        </p>
        <p style={{ fontSize: isMobile ? "0.84rem" : "0.9rem", color: COLORS.mediumText, lineHeight: 1.9 }}>
          <strong style={{ color: COLORS.darkText }}>Things to See</strong> — Walk the UVA Campus & The Rotunda, visit Monticello, pick apples at Carter Mountain Orchard, or take a day trip to Shenandoah National Park.
        </p>
      </motion.div>

    </motion.div>
  );
}

/* ============================================
   REGISTRY TAB
   ============================================ */

function RegistryTab({ isMobile, reducedMotion }) {
  const registries = [
    { name: "Registry details", icon: "C" }
  ];
  const containerVariants = getStaggerContainerVariants(reducedMotion);
  const itemVariants = getStaggerItemVariants(reducedMotion);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <motion.h2 variants={itemVariants} style={getTabTitleStyle(isMobile)}>Registry</motion.h2>
      <motion.p variants={itemVariants} style={getTabSubtitleStyle(isMobile)}>Your presence is the greatest gift</motion.p>

      <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : registries.length === 1 ? "minmax(0, 420px)" : "repeat(2, 1fr)", justifyContent: "center", gap: "1.2rem", marginBottom: "2rem" }}>
        {registries.map((r) => (
          <div
            key={r.name}
            style={{
              display: "block",
              ...getSectionCardStyle(isMobile),
              padding: "1.5rem 1rem",
              textAlign: "center",
              color: COLORS.darkText,
              marginBottom: 0
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
            <p style={{ fontSize: "0.85rem", color: COLORS.lightText }}>Coming soon</p>
          </div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} style={{ ...getSectionCardStyle(isMobile), textAlign: "center", borderTop: `4px solid ${COLORS.accent}` }}>
        <p style={{ fontSize: "1rem", color: COLORS.mediumText, lineHeight: 1.8 }}>
          <strong style={{ color: COLORS.primary, fontSize: "1.1rem" }}>A Note from Us</strong><br /><br />
          The most important gift is your presence on our special day. If you'd still like to give something, we'd be grateful for contributions toward our honeymoon adventure!
        </p>
      </motion.div>
    </motion.div>
  );
}


/* ============================================
   WEDDING PARTY TAB - FULLY PROPORTIONAL SCALING
   Photo maintains 4:5 aspect ratio at all sizes
   ============================================ */

function WeddingPartyTab({ isMobile, reducedMotion }) {
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
  const containerVariants = getStaggerContainerVariants(reducedMotion);
  const itemVariants = getStaggerItemVariants(reducedMotion);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <motion.h2 variants={itemVariants} style={getTabTitleStyle(isMobile)}>Our Wedding Party</motion.h2>
      <motion.p variants={itemVariants} style={getTabSubtitleStyle(isMobile)}>Meet the amazing people standing by our side. Tap cards to see more.</motion.p>

      {/* BRIDESMAIDS FIRST - "Ladies" */}
      <motion.div variants={itemVariants} style={{ marginBottom: "3rem" }}>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", textAlign: "center", color: PARTY_CARD_THEMES.bride.accent, fontWeight: 400, fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.03em" }}>
          Ladies
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(0.8rem, 2vw, 1.2rem)" }}>
          {bridesmaids.map((p, index) => (
            <motion.div
              key={p.frontName}
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : { delay: 0.03 * index, duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: "relative", overflow: "visible", margin: "0 -0.45rem" }}
            >
              <BridesmaidCard person={p} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* GROOMSMEN SECOND - "Lads" */}
      <motion.div variants={itemVariants}>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", textAlign: "center", color: PARTY_CARD_THEMES.groom.accent, fontWeight: 400, fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.03em" }}>
          Lads
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(0.8rem, 2vw, 1.2rem)" }}>
          {groomsmen.map((p, index) => (
            <motion.div
              key={p.frontName}
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : { delay: 0.04 * index, duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: "relative", overflow: "visible", margin: "0 -0.45rem" }}
            >
              <GroomCard person={p} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================
   GROOM CARD - PHOTO MAINTAINS 4:5 ASPECT RATIO
   ============================================ */

const GroomCard = React.memo(({ person }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlipAnimating, setIsFlipAnimating] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const theme = PARTY_CARD_THEMES.groom;
  const color = theme.accent;
  const photos = (person.photos || []).filter(Boolean);
  const isRaised = isFlipped || isFlipAnimating;

  const nextPhoto = (e) => {
    e.stopPropagation();
    if (photos.length <= 1) return;
    setPhotoIndex((i) => (i + 1) % photos.length);
  };

  const handleFlip = () => {
    setIsFlipAnimating(true);
    setIsFlipped((prev) => !prev);
  };

  useEffect(() => {
    if (!isFlipAnimating) return undefined;
    const timer = window.setTimeout(() => setIsFlipAnimating(false), CARD_FLIP_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [isFlipAnimating, isFlipped]);

  return (
    <div
      style={{
        width: "100%",
        perspective: 1200,
        cursor: "pointer",
        position: "relative",
        zIndex: isRaised ? 30 : 1,
        overflow: "visible",
        padding: "0 0.8rem",
        boxSizing: "border-box",
        isolation: "isolate"
      }}
      onClick={handleFlip}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.6s ease",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transformOrigin: "center center",
          willChange: "transform",
          overflow: "visible",
          zIndex: isRaised ? 2 : 1
        }}
      >
        {/* FRONT FACE */}
        <div
          style={{
            width: "100%",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: COLORS.cardBg,
            borderRadius: "clamp(9px, 1.35vw, 12px)",
            boxShadow: "0 8px 24px rgba(44,36,32,0.07), inset 0 1px 0 rgba(255,255,255,0.78)",
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
              alignSelf: "stretch",
              background: photos[photoIndex] ? `url(${photos[photoIndex]}) center center/cover` : `linear-gradient(135deg, ${color}, ${color}dd)`,
              borderRight: `1px solid ${COLORS.border}`,
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
              fontSize: "clamp(1.1rem, 2.4vw, 1.6rem)",
              marginBottom: "clamp(0.15rem, 0.35vw, 0.3rem)",
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
              marginBottom: "clamp(0.15rem, 0.35vw, 0.3rem)",
              fontSize: "clamp(0.82rem, 1.55vw, 1.05rem)",
              letterSpacing: "0.02em"
            }}>
              {person.role}
            </p>
            <p style={{
              fontSize: "clamp(0.78rem, 1.35vw, 0.96rem)",
              color: COLORS.mediumText,
              marginBottom: "clamp(0.4rem, 1vw, 0.8rem)"
            }}>
              {person.relation}
            </p>
            <div>
              <div style={{ fontSize: "clamp(0.58rem, 0.95vw, 0.72rem)", color: COLORS.lightText, textTransform: "uppercase", letterSpacing: "0.08em" }}>City</div>
              <div style={{ fontSize: "clamp(0.8rem, 1.35vw, 0.96rem)", fontWeight: 600, color: COLORS.darkText, lineHeight: 1.4 }}>{person.currentCity}</div>
            </div>
            <p style={{ marginTop: "auto", paddingTop: "clamp(0.3rem, 0.6vw, 0.5rem)", fontSize: "clamp(0.64rem, 1.05vw, 0.78rem)", color: COLORS.lightText, fontStyle: "italic" }}>Tap for more</p>
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
            borderRadius: "clamp(9px, 1.35vw, 12px)",
            boxShadow: "0 8px 24px rgba(44,36,32,0.07), inset 0 1px 0 rgba(255,255,255,0.78)",
            border: `1px solid ${COLORS.border}`,
            padding: "clamp(0.8rem, 1.5vw, 1.15rem)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            overflow: "hidden"
          }}
        >
          <h3 style={{
            textAlign: "center",
            marginBottom: "clamp(0.45rem, 0.9vw, 0.7rem)",
            fontSize: "clamp(1.15rem, 2.35vw, 1.55rem)",
            color: COLORS.darkText,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            fontStyle: "italic"
          }}>
            {person.backName}
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "clamp(0.45rem, 1vw, 0.75rem)",
            marginBottom: "clamp(0.5rem, 1vw, 0.75rem)",
            fontSize: "clamp(0.72rem, 1.2vw, 0.92rem)"
          }}>
            <StatCell label="Bench" value={person.maxBench} color={color} background={COLORS.cream} borderColor={COLORS.border} labelColor={COLORS.lightText} />
            <StatCell label="40-Yard" value={person.fortyYard} color={color} background={COLORS.cream} borderColor={COLORS.border} labelColor={COLORS.lightText} />
            <StatCell label="Handicap" value={person.handicap} color={color} background={COLORS.cream} borderColor={COLORS.border} labelColor={COLORS.lightText} />
            <StatCell label="Status" value={person.relationshipStatus} color={color} background={COLORS.cream} borderColor={COLORS.border} labelColor={COLORS.lightText} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(0.35rem, 0.75vw, 0.55rem)", fontSize: "clamp(0.66rem, 1vw, 0.8rem)", color: COLORS.mediumText, marginBottom: "clamp(0.45rem, 0.9vw, 0.7rem)", flexWrap: "wrap", textAlign: "center" }}>
            {person.collegeLogo && <img src={person.collegeLogo} alt="" style={{ width: 16, height: 16, objectFit: "contain" }} />}
            <span>{person.college}</span>
            <span style={{ color: COLORS.lightText }}>|</span>
            {person.footballLogo && <img src={person.footballLogo} alt="" style={{ width: 16, height: 16, objectFit: "contain" }} />}
            <span>{person.footballTeam}</span>
          </div>
          <p style={{
            flex: 1,
            margin: 0,
            padding: "0 clamp(0.15rem, 0.35vw, 0.25rem)",
            textAlign: "left",
            fontSize: "clamp(0.76rem, 1.15vw, 0.95rem)",
            color: COLORS.mediumText,
            fontStyle: "italic",
            lineHeight: 1.6,
            overflow: "auto"
          }}>
            {person.comment}
          </p>
          <p style={{ textAlign: "center", marginTop: "clamp(0.3rem, 0.6vw, 0.4rem)", fontSize: "clamp(0.54rem, 0.82vw, 0.64rem)", color: COLORS.lightText }}>Tap to flip back</p>
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
  const [isFlipAnimating, setIsFlipAnimating] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const theme = PARTY_CARD_THEMES.bride;
  const color = theme.accent;
  const photos = (person.photos || []).filter(Boolean);
  const isRaised = isFlipped || isFlipAnimating;

  const nextPhoto = (e) => {
    e.stopPropagation();
    if (photos.length <= 1) return;
    setPhotoIndex((i) => (i + 1) % photos.length);
  };

  const handleFlip = () => {
    setIsFlipAnimating(true);
    setIsFlipped((prev) => !prev);
  };

  useEffect(() => {
    if (!isFlipAnimating) return undefined;
    const timer = window.setTimeout(() => setIsFlipAnimating(false), CARD_FLIP_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [isFlipAnimating, isFlipped]);

  return (
    <div
      style={{
        width: "100%",
        perspective: 1200,
        cursor: "pointer",
        position: "relative",
        zIndex: isRaised ? 30 : 1,
        overflow: "visible",
        padding: "0 0.8rem",
        boxSizing: "border-box",
        isolation: "isolate"
      }}
      onClick={handleFlip}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.6s ease",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transformOrigin: "center center",
          willChange: "transform",
          overflow: "visible",
          zIndex: isRaised ? 2 : 1
        }}
      >
        {/* FRONT FACE */}
        <div
          style={{
            width: "100%",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: COLORS.cardBg,
            borderRadius: "clamp(9px, 1.35vw, 12px)",
            boxShadow: "0 8px 24px rgba(44,36,32,0.07), inset 0 1px 0 rgba(255,255,255,0.78)",
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
              alignSelf: "stretch",
              background: photos[photoIndex] ? `url(${photos[photoIndex]}) center center/cover` : `linear-gradient(135deg, ${color}, ${color}dd)`,
              borderRight: `1px solid ${COLORS.border}`,
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
              fontSize: "clamp(1.1rem, 2.4vw, 1.6rem)",
              marginBottom: "clamp(0.15rem, 0.35vw, 0.3rem)",
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
              marginBottom: "clamp(0.15rem, 0.35vw, 0.3rem)",
              fontSize: "clamp(0.82rem, 1.55vw, 1.05rem)",
              letterSpacing: "0.02em"
            }}>
              {person.role}
            </p>
            <p style={{
              fontSize: "clamp(0.78rem, 1.35vw, 0.96rem)",
              color: COLORS.mediumText,
              marginBottom: "clamp(0.4rem, 1vw, 0.8rem)"
            }}>
              {person.relation}
            </p>
            <div>
              <div style={{ fontSize: "clamp(0.58rem, 0.95vw, 0.72rem)", color: COLORS.lightText, textTransform: "uppercase", letterSpacing: "0.08em" }}>City</div>
              <div style={{ fontSize: "clamp(0.8rem, 1.35vw, 0.96rem)", fontWeight: 600, color: COLORS.darkText, lineHeight: 1.4 }}>{person.currentCity}</div>
            </div>
            <p style={{ marginTop: "auto", paddingTop: "clamp(0.3rem, 0.6vw, 0.5rem)", fontSize: "clamp(0.64rem, 1.05vw, 0.78rem)", color: COLORS.lightText, fontStyle: "italic" }}>Tap for more</p>
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
            borderRadius: "clamp(9px, 1.35vw, 12px)",
            boxShadow: "0 8px 24px rgba(44,36,32,0.07), inset 0 1px 0 rgba(255,255,255,0.78)",
            border: `1px solid ${COLORS.border}`,
            padding: "clamp(0.8rem, 1.5vw, 1.15rem)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            overflow: "hidden"
          }}
        >
          <h3 style={{
            textAlign: "center",
            marginBottom: "clamp(0.45rem, 0.9vw, 0.7rem)",
            fontSize: "clamp(1.15rem, 2.35vw, 1.55rem)",
            color: COLORS.darkText,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            fontStyle: "italic"
          }}>
            {person.backName}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr", rowGap: "0.35rem", columnGap: "0.55rem", fontSize: "clamp(0.68rem, 1.05vw, 0.82rem)", color: COLORS.mediumText, marginBottom: "clamp(0.45rem, 0.9vw, 0.7rem)", lineHeight: 1.5, alignItems: "start" }}>
            <span style={{ color, textTransform: "uppercase", letterSpacing: "0.06em" }}>College</span>
            <span>{person.college}</span>
            <span style={{ color, textTransform: "uppercase", letterSpacing: "0.06em" }}>Drink</span>
            <span style={{ color }}>{person.favoriteDrink || "TBD"}</span>
            <span style={{ color, textTransform: "uppercase", letterSpacing: "0.06em" }}>Anthem</span>
            <span>{person.danceFloorSong || "TBD"}</span>
          </div>
          <p style={{
            flex: 1,
            margin: 0,
            padding: "0 clamp(0.15rem, 0.35vw, 0.25rem)",
            textAlign: "left",
            fontSize: "clamp(0.76rem, 1.15vw, 0.95rem)",
            color: COLORS.mediumText,
            fontStyle: "italic",
            lineHeight: 1.6,
            overflow: "auto"
          }}>
            {person.funFact || person.comment}
          </p>
          <p style={{ textAlign: "center", marginTop: "clamp(0.3rem, 0.6vw, 0.4rem)", fontSize: "clamp(0.54rem, 0.82vw, 0.64rem)", color: COLORS.lightText }}>Tap to flip back</p>
        </div>
      </div>
    </div>
  );
});
