import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import heroImage from "./assets/hero.jpg";
import { clickCountRef, hoosierCountRef, deepTrackRef, deepTrackLikesRef, deepTrackCommentsRef, onValue, runTransaction, push } from "./firebase";

// Import team logos
import bears from "./assets/bears.png";
import brown from "./assets/brown.png";
import commies from "./assets/commies.png";
import fbt from "./assets/fbt.png";
import dukes from "./assets/JMU.png";
import nu from "./assets/NU.svg";
import sc from "./assets/SC.png";
import skins from "./assets/skins.png";
import tex from "./assets/tex.png";
import vikes from "./assets/vikes.png";
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
const woodsPhotos = globToArray(import.meta.glob("./assets/woods/*", { eager: true }));
const wyattPhotos = globToArray(import.meta.glob("./assets/wyatt/*", { eager: true }));
const laurenPhotos = globToArray(import.meta.glob("./assets/lauren/*", { eager: true }));
const courtneyPhotos = globToArray(import.meta.glob("./assets/courtney/*", { eager: true }));
const addisonPhotos = globToArray(import.meta.glob("./assets/addison/*", { eager: true }));
const lilyPhotos = globToArray(import.meta.glob("./assets/lily/*", { eager: true }));
const mariaPhotos = globToArray(import.meta.glob("./assets/maria/*", { eager: true }));
const goofyPhotos = globToArray(import.meta.glob("./assets/goofy/*", { eager: true }));
const hoosierPhotos = globToArray(import.meta.glob("./assets/hoosiers/*", { eager: true }));
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

import iuLogo from "./assets/IU.png";
import hoosierLogo from "./assets/hoosier.png";
const IU_LOGO_IMAGE = iuLogo;
const GOLF_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSc05xidXMl9XIGrUmGwN7IqLgqHv727BPUUq3r4118eVUyi-Q/viewform?usp=publish-editor";
const DRAFTSMAN_URL = "https://app.marriott.com/reslink?id=1770319213584&key=GRP&app=resvlink";
const CARD_FLIP_DURATION_MS = 650;
const CELEBRATE_BUTTON_TEXT = "Can't Wait!";
const HOLD_REVEAL_MS = 10000;
const HOLD_MUSH_DURATION_MS = 3000;
const HOLD_SWELL_START_MS = 3000;
const HOLD_SWELL_DURATION_MS = HOLD_REVEAL_MS - HOLD_SWELL_START_MS;
const HOLD_COLOR_DURATION_MS = 8000;
const PEEL_HANDLE_SIZE_MOBILE = 84;
const PEEL_HANDLE_SIZE_DESKTOP = 96;
const PEEL_MAX_X_MOBILE = 168;
const PEEL_MAX_X_DESKTOP = 236;
const PEEL_MAX_Y_MOBILE = 132;
const PEEL_MAX_Y_DESKTOP = 186;
const PEEL_MAX_PULL_MOBILE = 210;
const PEEL_MAX_PULL_DESKTOP = 290;
const PEEL_COMMIT_PROGRESS = 0.68;

const INDIANA_CANDY_STRIPE = `repeating-linear-gradient(
  90deg,
  ${COLORS.indianaCrimson},
  ${COLORS.indianaCrimson} 20px,
  ${COLORS.indianaWhite} 20px,
  ${COLORS.indianaWhite} 40px
)`;

const clamp01 = (value) => Math.max(0, Math.min(1, value));

// FIXED CARD DIMENSIONS
const CARD_HEIGHT_DESKTOP = 380;
const CARD_HEIGHT_MOBILE = 400;
const PHOTO_WIDTH_DESKTOP = 280;
const PHOTO_WIDTH_MOBILE = 120;

// FIXED content width
const CONTENT_WIDTH = 900;

// Hook for mobile detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 960;
  });
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 960);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
};

// Simple schedule row — clean two-column layout
const ScheduleRow = ({ time, event, location, attire, note, noteHref, isLast, isMobile }) => {
  return (
    <div style={{
      padding: isMobile ? "0.9rem 0" : "0.8rem 0",
      borderBottom: isLast ? "none" : `1px solid ${COLORS.border}`
    }}>
      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.16rem" }}>
          <div style={{
            fontSize: "0.64rem",
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: COLORS.accent
          }}>
            {time}
          </div>
          <div style={{
            fontSize: "0.95rem",
            fontWeight: 500,
            color: COLORS.darkText,
            lineHeight: 1.32
          }}>
            {event}
          </div>
          {location && (
            <div style={{
              fontSize: "0.76rem",
              lineHeight: 1.45,
              color: COLORS.mediumText
            }}>
              {location}
            </div>
          )}
          {attire && (
            <div style={{
              fontSize: "0.72rem",
              lineHeight: 1.45,
              color: COLORS.lightText,
              fontStyle: "italic"
            }}>
              {attire}
            </div>
          )}
          {note && (
            <div style={{
              fontSize: "0.72rem",
              lineHeight: 1.45,
              color: COLORS.mediumText
            }}>
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
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "92px minmax(0, 1fr)",
          gap: "0.75rem",
          alignItems: "start"
        }}>
          <div style={{
            width: 92,
            flexShrink: 0,
            fontSize: "0.95rem",
            color: COLORS.lightText,
            whiteSpace: "nowrap",
            paddingTop: "0.05rem"
          }}>
            {time}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: "1rem",
              fontWeight: 500,
              color: COLORS.darkText,
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {event}
            </div>
            {location && (
              <div style={{
                marginTop: "0.18rem",
                fontSize: "0.82rem",
                lineHeight: 1.35,
                color: COLORS.lightText,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {location}
              </div>
            )}
            {attire && (
              <div style={{
                marginTop: "0.18rem",
                fontSize: "0.8rem",
                lineHeight: 1.35,
                color: COLORS.mediumText,
                fontStyle: "italic",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {attire}
              </div>
            )}
            {note && (
              <div style={{
                marginTop: "0.2rem",
                fontSize: "0.76rem",
                lineHeight: 1.35,
                color: COLORS.mediumText,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
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
      )}
    </div>
  );
};

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
        padding: isMobile ? "0.5rem 0.52rem" : "0.7rem 1.2rem",
        border: "none",
        background: "transparent",
        color: tab === id ? COLORS.darkText : COLORS.mediumText,
        fontSize: isMobile ? "0.64rem" : "0.9rem",
        fontWeight: tab === id ? 500 : 400,
        borderRadius: 8,
        cursor: "pointer",
        transition: "all 0.2s ease",
        whiteSpace: "nowrap",
        overflow: "hidden",
        flexShrink: 0,
        minHeight: isMobile ? 34 : undefined,
        letterSpacing: isMobile ? "0.01em" : "normal"
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
      padding: "clamp(0.18rem, 0.6vw, 0.6rem) clamp(0.12rem, 0.4vw, 0.4rem)",
      borderRadius: 10,
      border: `1px solid ${borderColor}`
    }}
  >
    <div style={{ fontSize: "clamp(0.48rem, 0.7vw, 0.7rem)", color: labelColor, marginBottom: "0.1rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {label}
    </div>
    <div style={{ fontSize: "clamp(0.65rem, 1vw, 1rem)", fontWeight: 600, color }}>{value}</div>
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
  const handleSize = isMobile ? PEEL_HANDLE_SIZE_MOBILE : PEEL_HANDLE_SIZE_DESKTOP;
  const restFoldX = isMobile ? 26 : 32;
  const restFoldY = isMobile ? 20 : 24;
  const restRevealX = restFoldX + (isMobile ? 8 : 10);
  const restRevealY = restFoldY + (isMobile ? 7 : 9);
  const maxCornerX = isMobile ? PEEL_MAX_X_MOBILE : PEEL_MAX_X_DESKTOP;
  const maxCornerY = isMobile ? PEEL_MAX_Y_MOBILE : PEEL_MAX_Y_DESKTOP;
  const cornerX = Math.min(peelOffset.x, maxCornerX);
  const cornerY = Math.min(peelOffset.y, maxCornerY);
  const activeCornerX = progress > 0 ? cornerX : 0;
  const activeCornerY = progress > 0 ? cornerY : 0;
  const foldX = Math.min(
    isMobile ? 214 : 292,
    restFoldX + activeCornerX * 1.14 + (progress > 0 ? (isMobile ? 24 : 30) : 0)
  );
  const foldY = Math.min(
    isMobile ? 176 : 248,
    restFoldY + activeCornerY * 1.1 + (progress > 0 ? (isMobile ? 20 : 26) : 0)
  );

  return {
    handleSize,
    revealClipPath:
      progress <= 0
        ? `polygon(0 calc(100% - ${restRevealY}px), ${restRevealX}px 100%, 0 100%)`
        : `polygon(0 calc(100% - ${foldY}px), ${activeCornerX}px calc(100% - ${activeCornerY}px), ${foldX}px 100%, 0 100%)`,
    flapClipPath:
      progress <= 0
        ? `polygon(0 calc(100% - ${foldY}px), ${foldX}px 100%, 0 100%)`
        : `polygon(0 calc(100% - ${foldY}px), ${activeCornerX}px calc(100% - ${activeCornerY}px), ${foldX}px 100%, 0 100%)`,
    shadowClipPath:
      progress <= 0
        ? `polygon(0 calc(100% - ${foldY + 2}px), ${foldX + 2}px 100%, 0 100%)`
        : `polygon(0 calc(100% - ${foldY + 2}px), ${Math.max(0, activeCornerX - 2)}px calc(100% - ${Math.max(0, activeCornerY - 2)}px), ${foldX + 2}px 100%, 0 100%)`
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
  const revealOpacity = 0.38 + progress * 0.34;
  const promptOpacity = Math.max(0, 0.82 - progress * 0.58);
  const promptWidth = isMobile ? 138 : 182;
  const promptHeight = isMobile ? 102 : 124;

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
              backgroundPosition: isMobile ? "0 0" : "left top",
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
                "linear-gradient(135deg, rgba(153, 0, 0, 0) 22%, rgba(153, 0, 0, 0.06) 58%, rgba(153, 0, 0, 0.15) 100%)",
              opacity: 0.7 + progress * 0.18
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: revealClipPath,
              background:
                "linear-gradient(125deg, rgba(255,255,255,0) 42%, rgba(255,255,255,0.14) 72%, rgba(255,255,255,0.26) 100%)",
              opacity: 0.5 + progress * 0.25
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: revealClipPath,
              background:
                "radial-gradient(circle at bottom left, rgba(255,255,255,0.28), rgba(255,255,255,0) 72%)",
              opacity: 0.25 + progress * 0.45
            }}
          />
        </>
      )}
      <motion.div
        initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
        animate={reducedMotion ? { opacity: promptOpacity } : { opacity: promptOpacity, y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.32, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          left: isMobile ? 18 : 26,
          bottom: isMobile ? 18 : 26,
          width: promptWidth,
          height: promptHeight,
          pointerEvents: "none"
        }}
      >
        <div
          style={{
            position: "absolute",
            right: isMobile ? 4 : 8,
            top: isMobile ? -18 : -20,
            fontFamily: "'Caveat', cursive",
            fontSize: isMobile ? "0.96rem" : "1.14rem",
            color: "rgba(153, 0, 0, 0.42)",
            letterSpacing: "0.01em",
            transform: "rotate(5deg)",
            textShadow: "0 1px 0 rgba(255,255,255,0.45)",
            whiteSpace: "nowrap",
            background: "rgba(250,248,243,0.82)",
            padding: isMobile ? "0.02rem 0.28rem" : "0.04rem 0.36rem",
            borderRadius: 999
          }}
        >
          Drag the corner
        </div>
        <motion.svg
          viewBox="0 0 180 120"
          animate={reducedMotion ? undefined : { x: [0, 2, 0], y: [0, -2, 0] }}
          transition={reducedMotion ? { duration: 0 } : { repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            overflow: "visible"
          }}
        >
          <defs>
            <marker
              id="peel-arrowhead"
              markerWidth="7"
              markerHeight="7"
              refX="6.1"
              refY="3.5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0 0.8 L6.1 3.5 L0 6.2" fill="none" stroke="rgba(153, 0, 0, 0.24)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>
          <path
            d="M164 28 C 110 2, 62 12, 26 82"
            fill="none"
            stroke="rgba(153, 0, 0, 0.24)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray="4 8"
            markerEnd="url(#peel-arrowhead)"
          />
        </motion.svg>
      </motion.div>
      <div
        style={{
          position: "absolute",
          left: 0,
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
            background: "linear-gradient(135deg, rgba(44,36,32,0), rgba(44,36,32,0.16))",
            filter: "blur(8px)",
            opacity: reducedMotion ? 0.14 : 0.12 + foldIntensity * 0.18,
            transform: `translate(${flapLift * 0.16}px, ${-flapLift * 0.16}px)`
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            clipPath: flapClipPath,
            background: `linear-gradient(145deg, rgba(255,255,255,${paperOpacity}) 0%, rgba(249, 244, 238, ${paperOpacity}) 38%, rgba(236, 226, 216, ${paperOpacity}) 68%, rgba(210, 192, 176, ${paperOpacity}) 100%)`,
            filter: "drop-shadow(10px -10px 18px rgba(44,36,32,0.16))",
            transformOrigin: "bottom left",
            transform: reducedMotion
              ? "none"
              : `perspective(900px) rotateX(${foldIntensity * 7.5}deg) rotateY(${foldIntensity * 7.5}deg) translate3d(${flapLift * 0.18}px, ${-flapLift * 0.18}px, 0) rotate(${flapTilt}deg)`
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: flapClipPath,
              backgroundImage: INDIANA_CANDY_STRIPE,
              backgroundPosition: "left bottom",
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
                "linear-gradient(135deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.18) 36%, rgba(153,0,0,0.06) 100%)"
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: flapClipPath,
              background:
                "linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 58%, rgba(120, 36, 36, 0.14) 78%, rgba(94, 18, 18, 0.28) 100%)"
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: flapClipPath,
              background:
                "linear-gradient(45deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 28%, rgba(44,36,32,0.14) 100%)",
              mixBlendMode: "multiply"
            }}
          />
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
                "linear-gradient(325deg, rgba(255,255,255,0) 52%, rgba(255,255,255,0.66) 70%, rgba(255,255,255,0.06) 100%)",
              opacity: 0.45
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// Captions for goofy photos — update to match your photos
const GOOFY_CAPTIONS = [
  "Looking good, you two",
  "Absolutely iconic",
  "This is peak romance",
  "Frame-worthy moment",
  "Can't stop, won't stop",
  "Goals tbh",
  "Main characters",
  "No notes",
  "Unhinged and in love",
  "Certified goofballs"
];

// Phase constants
const PHASE_SECRET = 0;    // "Congratulations you found our secret stash..."
const PHASE_TRANSITION = 1; // "Enjoy some deep tracks of Bemily..."
const PHASE_FEED = 2;       // Instagram-style goofy photo feed

const formatCommentTimestamp = (timestamp) => {
  if (typeof timestamp !== "number") return "";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";

  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);

  return `${String(hours12).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")} ${hours24 >= 12 ? "pm" : "am"} ${String(date.getDate()).padStart(2, "0")} ${month} ${date.getFullYear()}`;
};

// Word-by-word sparkle text — words stay together, letters animate in, sparkles track new letters
const SparkleText = ({ text, onComplete, isMobile }) => {
  const chars = text.split("");
  const [visibleCount, setVisibleCount] = useState(0);
  const [sparkles, setSparkles] = useState([]);
  const [done, setDone] = useState(false);
  const charRefs = useRef([]);

  useEffect(() => {
    if (visibleCount >= chars.length) {
      setDone(true);
      return;
    }
    const timer = setTimeout(() => {
      setVisibleCount((c) => c + 1);
      // Spawn sparkle near the newly revealed character
      const el = charRefs.current[visibleCount];
      if (el && Math.random() > 0.35) {
        const rect = el.getBoundingClientRect();
        setSparkles((prev) => [...prev.slice(-8), {
          id: Date.now() + Math.random(),
          x: rect.left + rect.width / 2 + (Math.random() * 16 - 8),
          y: rect.top + rect.height / 2 + (Math.random() * 12 - 6)
        }]);
      }
    }, 38);
    return () => clearTimeout(timer);
  }, [visibleCount, chars.length]);

  // Split into words, render each word as a nowrap span
  const words = text.split(" ");
  let charIndex = 0;

  return (
    <div style={{ position: "relative", display: "block", width: "100%", maxWidth: "100%", textAlign: "center" }}>
      <span style={{
        fontFamily: "'Cormorant Garamond', serif",
        display: "inline-flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "flex-start",
        columnGap: "0.35ch",
        rowGap: isMobile ? "0.1em" : "0.14em",
        fontSize: isMobile ? "1.5rem" : "2.2rem",
        fontStyle: "italic",
        fontWeight: 400,
        color: COLORS.darkText,
        lineHeight: 1.6,
        width: "100%",
        maxWidth: isMobile ? "14ch" : "18ch",
        textAlign: "center"
      }}>
        {words.map((word, wi) => {
          const wordChars = word.split("");
          const startIdx = charIndex;
          charIndex += word.length + 1; // +1 for space
          return (
            <span key={wi} style={{ display: "inline-flex", whiteSpace: "nowrap" }}>
              {wordChars.map((char, ci) => {
                const idx = startIdx + ci;
                return (
                  <motion.span
                    key={idx}
                    ref={(el) => { charRefs.current[idx] = el; }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={idx < visibleCount ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    style={{ display: "inline-block" }}
                  >
                    {char}
                  </motion.span>
                );
              })}
            </span>
          );
        })}
      </span>
      {sparkles.map((s) => (
        <motion.span
          key={s.id}
          initial={{ opacity: 1, scale: 0 }}
          animate={{ opacity: 0, scale: 1.5, y: -20 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "fixed",
            left: s.x,
            top: s.y,
            fontSize: "0.85rem",
            pointerEvents: "none",
            color: COLORS.accent
          }}
        >
          ✦
        </motion.span>
      ))}
      {/* Tap to continue — always mounted to prevent layout snap */}
      <motion.div
        animate={{ opacity: done ? 1 : 0 }}
        transition={{ duration: 0.5, delay: done ? 0.4 : 0 }}
        onClick={done ? onComplete : undefined}
        style={{
          marginTop: "2rem",
          textAlign: "center",
          cursor: done ? "pointer" : "default",
          pointerEvents: done ? "auto" : "none"
        }}
      >
        <span style={{
          fontSize: isMobile ? "0.72rem" : "0.8rem",
          color: COLORS.lightText,
          fontStyle: "italic",
          letterSpacing: "0.05em"
        }}>
          Tap to continue
        </span>
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ fontSize: "0.7rem", color: COLORS.lightText, marginTop: 4 }}
        >
          ▼
        </motion.div>
      </motion.div>
    </div>
  );
};

function HoosiersOverlay({ isVisible, isMobile, hoosierCount, onClose, onRevealHoosiers, onGoHoosiers }) {
  const [phase, setPhase] = useState(PHASE_SECRET);
  const [secretFading, setSecretFading] = useState(false);  // secret text fading out
  const [goHoosiersVisible, setGoHoosiersVisible] = useState(false); // Go Hoosiers slam-in
  const [hoosierSlideIndex, setHoosierSlideIndex] = useState(0);
  const [slideshowStarted, setSlideshowStarted] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState("");
  const [transitionStep, setTransitionStep] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const heartTimerRef = useRef(null);
  const hoosierTimerRef = useRef(null);

  // Reset phase when overlay opens
  useEffect(() => {
    if (isVisible) {
      setPhase(PHASE_SECRET);
      setSecretFading(false);
      setGoHoosiersVisible(false);
      setSlideshowStarted(false);
      setSlideshowDone(false);
      setTransitionStep(0);
      setHoosierSlideIndex(0);
      setPhotoIndex(0);
    }
    return () => { if (hoosierTimerRef.current) clearInterval(hoosierTimerRef.current); };
  }, [isVisible]);

  // Secret text done -> fade out -> Go Hoosiers slam
  const handleSecretComplete = () => {
    setSecretFading(true);
    setTimeout(() => {
      setGoHoosiersVisible(true);
      onRevealHoosiers();
    }, 800);
  };

  const [slideshowDone, setSlideshowDone] = useState(false);

  // Auto-advance hoosier slideshow when started
  useEffect(() => {
    if (phase !== PHASE_SECRET || !slideshowStarted) return;
    if (hoosierPhotos.length === 0) return; // "Tap to continue" shown directly
    hoosierTimerRef.current = setInterval(() => {
      setHoosierSlideIndex((prev) => {
        const next = prev + 1;
        if (next >= hoosierPhotos.length) {
          clearInterval(hoosierTimerRef.current);
          setSlideshowDone(true);
          return prev;
        }
        return next;
      });
    }, 4000);
    return () => { if (hoosierTimerRef.current) clearInterval(hoosierTimerRef.current); };
  }, [phase, slideshowStarted]);

  // Listen for likes & comments on goofy photos
  useEffect(() => {
    if (!isVisible || goofyPhotos.length === 0) return;
    const unsubs = [];
    goofyPhotos.forEach((_, i) => {
      unsubs.push(onValue(deepTrackRef(i), (snap) => {
        const val = snap.val() || {};
        const nextComments = val.comments
          ? Object.entries(val.comments)
            .map(([id, comment]) => ({
              id,
              text: typeof comment?.text === "string" ? comment.text : "",
              ts: typeof comment?.ts === "number" ? comment.ts : 0
            }))
            .filter((comment) => comment.text.trim().length > 0)
            .sort((a, b) => a.ts - b.ts)
          : [];
        setLikes((prev) => ({ ...prev, [i]: typeof val.likes === "number" ? val.likes : 0 }));
        setComments((prev) => ({ ...prev, [i]: nextComments }));
      }));
    });
    return () => unsubs.forEach((u) => typeof u === "function" && u());
  }, [isVisible]);

  if (!isVisible) return null;

  // Tap left/right to navigate hoosier slideshow
  const handleHoosierPhotoTap = (e) => {
    if (hoosierTimerRef.current) clearInterval(hoosierTimerRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const tapRight = (clientX - rect.left) > rect.width * 0.5;
    setHoosierSlideIndex((prev) => {
      if (tapRight) {
        const next = prev + 1;
        if (next >= hoosierPhotos.length) { setSlideshowDone(true); return prev; }
        return next;
      }
      return Math.max(0, prev - 1);
    });
    // Restart auto-advance
    hoosierTimerRef.current = setInterval(() => {
      setHoosierSlideIndex((p) => {
        const n = p + 1;
        if (n >= hoosierPhotos.length) { clearInterval(hoosierTimerRef.current); setSlideshowDone(true); return p; }
        return n;
      });
    }, 4000);
  };

  const doLike = () => {
    runTransaction(deepTrackLikesRef(photoIndex), (current) => (current || 0) + 1);
    setShowHeart(true);
    if (heartTimerRef.current) clearTimeout(heartTimerRef.current);
    heartTimerRef.current = setTimeout(() => setShowHeart(false), 900);
  };

  const goToPrevGoofyPhoto = () => {
    setPhotoIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNextGoofyPhoto = () => {
    setPhotoIndex((prev) => Math.min(goofyPhotos.length - 1, prev + 1));
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    const text = commentText.replace(/\s+/g, " ").trim();
    if (!text) return;
    push(deepTrackCommentsRef(photoIndex), { text, ts: Date.now() });
    setCommentText("");
  };

  const handleLogoClick = (event) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    const origin = {
      x: Math.min(0.92, Math.max(0.08, (rect.left + rect.width / 2) / window.innerWidth)),
      y: Math.min(0.88, Math.max(0.12, (rect.top + rect.height / 2) / window.innerHeight))
    };
    if (!slideshowStarted) {
      setHoosierSlideIndex(0);
      setSlideshowDone(false);
      setSlideshowStarted(true);
    }
    onGoHoosiers(origin);
  };

  const overlayBase = {
    position: "fixed",
    inset: 0,
    zIndex: 170,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  };

  const backButton = (
    <button
      onClick={(e) => { e.stopPropagation(); onClose(); }}
      style={{
        position: "fixed",
        top: isMobile ? 16 : 22,
        right: isMobile ? 16 : 22,
        zIndex: 20,
        border: `1px solid ${COLORS.border}`,
        background: "rgba(255,255,255,0.85)",
        color: COLORS.darkText,
        padding: "0.55rem 0.9rem",
        borderRadius: 999,
        cursor: "pointer",
        fontSize: "0.72rem",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        fontWeight: 500,
        backdropFilter: "blur(10px)"
      }}
    >
      Back
    </button>
  );

  // PHASE 0: Secret text -> fade -> Go Hoosiers slam -> slideshow (all one phase)
  if (phase === PHASE_SECRET) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          ...overlayBase,
          background: goHoosiersVisible
            ? `linear-gradient(180deg, rgba(249,245,240,0.92), rgba(255,255,255,0.95)), ${INDIANA_CANDY_STRIPE}`
            : COLORS.bg,
          backgroundSize: "100% 100%, 40px 100%",
          transition: "background 0.6s ease",
          overflowY: "auto"
        }}
      >
        {backButton}

        {/* Secret text — fades out */}
        <AnimatePresence>
          {!secretFading && (
            <motion.div
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
              style={{ textAlign: "center", padding: "2rem", maxWidth: 520, position: "absolute", zIndex: 2 }}
            >
              <SparkleText
                text="Congratulations, you've discovered our secret stash...!"
                isMobile={isMobile}
                onComplete={handleSecretComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Go Hoosiers slam-in */}
        <AnimatePresence>
          {goHoosiersVisible && (
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                textAlign: "center",
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                maxWidth: 540,
                padding: "0 1rem"
              }}
            >
              {/* Let's Go / HOOSIERS! */}
              <motion.h2
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5, type: "spring", stiffness: 200, damping: 15 }}
                style={{
                  fontFamily: "'Archivo Black', 'Impact', sans-serif",
                  color: COLORS.indianaCrimson,
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                  margin: 0,
                  lineHeight: 1
                }}
              >
                <span style={{ fontSize: isMobile ? "2rem" : "3.5rem", display: "block", fontWeight: 400 }}>Let's Go</span>
                <span style={{ fontSize: isMobile ? "3.8rem" : "6.5rem", display: "block", fontWeight: 900 }}>Hoosiers!</span>
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: isMobile ? "0.12rem" : "0.18rem",
                  marginTop: "0.5rem",
                  marginBottom: "0.8rem"
                }}
              >
                {["16-0", "2026 B1G Champions", "2026 National Champions"].map((line, index) => (
                  <div
                    key={line}
                    style={{
                      color: COLORS.indianaCrimson,
                      fontSize: isMobile ? "0.72rem" : "0.88rem",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      fontWeight: index === 0 ? 800 : 700,
                      lineHeight: 1.15
                    }}
                  >
                    {line}
                  </div>
                ))}
              </motion.div>

              {/* Clickable IU logo + count */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.35rem",
                  marginBottom: "0.9rem"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: isMobile ? "0.45rem" : "0.65rem"
                  }}
                >
                  <span style={{ fontSize: isMobile ? "0.84rem" : "0.98rem", color: COLORS.mediumText, fontWeight: 600 }}>
                    {hoosierCount.toLocaleString()} Hoo Hoo Hoosiers!
                  </span>
                  <motion.button
                    type="button"
                    onClick={handleLogoClick}
                    whileHover={isMobile ? undefined : { y: -1, scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      margin: 0,
                      outline: "none",
                      boxShadow: "none",
                      appearance: "none",
                      WebkitTapHighlightColor: "transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    aria-label="Add one more Hoo Hoo Hoosier"
                    title="Tap logo!"
                  >
                    <img
                      src={IU_LOGO_IMAGE}
                      alt="Indiana Hoosiers"
                      style={{ width: isMobile ? 156 : 234, height: isMobile ? 192 : 288, objectFit: "contain", display: "block" }}
                    />
                  </motion.button>
                </div>
                <span
                  onClick={slideshowDone ? () => setPhase(PHASE_TRANSITION) : undefined}
                  style={{ fontSize: isMobile ? "0.68rem" : "0.76rem", color: COLORS.lightText, letterSpacing: "0.05em", textTransform: "uppercase", cursor: slideshowDone ? "pointer" : "default" }}
                >
                  {!slideshowStarted ? "Tap logo to start!" : slideshowDone ? "Tap to continue →" : "Tap picture to advance"}
                </span>
              </motion.div>

              {/* Hoosier slideshow */}
              {slideshowStarted && hoosierPhotos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  onClick={handleHoosierPhotoTap}
                  style={{
                    width: isMobile ? "90%" : 440,
                    aspectRatio: "4 / 3",
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "0 12px 40px rgba(44,36,32,0.15)",
                    border: `2px solid ${COLORS.indianaCrimson}`,
                    position: "relative",
                    cursor: "pointer"
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={hoosierSlideIndex}
                      src={hoosierPhotos[hoosierSlideIndex]}
                      alt="Go Hoosiers"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", position: "absolute", inset: 0 }}
                    />
                  </AnimatePresence>
                  {/* Dots */}
                  <div style={{
                    position: "absolute",
                    bottom: 10,
                    left: 0,
                    right: 0,
                    display: "flex",
                    justifyContent: "center",
                    gap: 4,
                    pointerEvents: "none"
                  }}>
                    {hoosierPhotos.map((_, i) => (
                      <div key={i} style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        background: i === hoosierSlideIndex ? "#fff" : "rgba(255,255,255,0.4)",
                        transition: "background 0.3s"
                      }} />
                    ))}
                  </div>
                </motion.div>
              )}

              {slideshowStarted && hoosierPhotos.length === 0 && (
                <p style={{ fontSize: "0.75rem", color: COLORS.lightText, fontStyle: "italic", marginTop: "0.5rem" }}>
                  Drop Hoosier pics into src/assets/hoosiers/
                </p>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Transition message — two steps
  if (phase === PHASE_TRANSITION) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ ...overlayBase, background: COLORS.bg }}
      >
        {backButton}
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: 500 }}>
          <AnimatePresence mode="wait">
            {transitionStep === 0 && (
              <motion.div key="t0" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5 }}>
                <SparkleText
                  text="Now that we're on the same page..."
                  isMobile={isMobile}
                  onComplete={() => setTransitionStep(1)}
                />
              </motion.div>
            )}
            {transitionStep === 1 && (
              <motion.div key="t1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.4 }}>
                <SparkleText
                  text="Enjoy some deep tracks of Bemily...!"
                  isMobile={isMobile}
                  onComplete={() => setPhase(PHASE_FEED)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  // PHASE 3: Instagram-style goofy photo feed
  const currentLikes = likes[photoIndex] || 0;
  const currentComments = comments[photoIndex] || [];
  const caption = GOOFY_CAPTIONS[photoIndex % GOOFY_CAPTIONS.length];
  const canGoPrev = photoIndex > 0;
  const canGoNext = photoIndex < goofyPhotos.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 170,
        overflowY: "auto",
        background: COLORS.bg
      }}
    >
      {/* Header */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "rgba(250,248,243,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${COLORS.border}`,
        padding: isMobile ? "0.7rem 1rem" : "0.8rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: isMobile ? "1.2rem" : "1.4rem",
          fontStyle: "italic",
          color: COLORS.darkText,
          fontWeight: 500
        }}>
          Bemily — Unfiltered
        </h2>
        <button
          onClick={onClose}
          style={{
            border: `1px solid ${COLORS.border}`,
            background: "rgba(255,255,255,0.8)",
            color: COLORS.darkText,
            padding: "0.45rem 0.8rem",
            borderRadius: 999,
            cursor: "pointer",
            fontSize: "0.72rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontWeight: 500
          }}
        >
          Back
        </button>
      </div>

      {/* Feed */}
      <div style={{ maxWidth: 520, margin: "0 auto", padding: isMobile ? "0" : "1rem 0" }}>
        {goofyPhotos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 1rem", color: COLORS.lightText }}>
            <p style={{ fontSize: "1.1rem", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", marginBottom: "0.5rem" }}>
              Coming Soon
            </p>
            <p style={{ fontSize: "0.82rem" }}>Drop photos into src/assets/goofy/</p>
          </div>
        ) : (
          <>
            {/* Photo dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 5, padding: "0.6rem 0" }}>
              {goofyPhotos.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setPhotoIndex(i)}
                  style={{
                    width: i === photoIndex ? 18 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: i === photoIndex ? COLORS.accent : COLORS.border,
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                />
              ))}
            </div>

            {/* Photo */}
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "4 / 5",
                background: COLORS.cream,
                cursor: "pointer",
                overflow: "hidden",
                userSelect: "none"
              }}
            >
              <motion.img
                key={photoIndex}
                src={goofyPhotos[photoIndex]}
                alt={caption}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <button
                type="button"
                onClick={goToPrevGoofyPhoto}
                disabled={!canGoPrev}
                aria-label="Previous deep track photo"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: "50%",
                  border: "none",
                  outline: "none",
                  boxShadow: "none",
                  appearance: "none",
                  WebkitTapHighlightColor: "transparent",
                  background: canGoPrev ? "linear-gradient(90deg, rgba(0,0,0,0.16), rgba(0,0,0,0))" : "transparent",
                  cursor: canGoPrev ? "pointer" : "default",
                  opacity: canGoPrev ? 1 : 0
                }}
              />
              <button
                type="button"
                onClick={goToNextGoofyPhoto}
                disabled={!canGoNext}
                aria-label="Next deep track photo"
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: "50%",
                  border: "none",
                  outline: "none",
                  boxShadow: "none",
                  appearance: "none",
                  WebkitTapHighlightColor: "transparent",
                  background: canGoNext ? "linear-gradient(270deg, rgba(0,0,0,0.16), rgba(0,0,0,0))" : "transparent",
                  cursor: canGoNext ? "pointer" : "default",
                  opacity: canGoNext ? 1 : 0
                }}
              />
              <AnimatePresence>
                {showHeart && (
                  <motion.div
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 1.3, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      fontSize: isMobile ? "4rem" : "5rem",
                      color: "#e74c3c",
                      pointerEvents: "none",
                      textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                      zIndex: 5
                    }}
                  >
                    ♥
                  </motion.div>
                )}
              </AnimatePresence>
              <div style={{
                position: "absolute",
                bottom: 12,
                left: 0,
                right: 0,
                display: "none",
                justifyContent: "space-between",
                padding: "0 14px",
                pointerEvents: "none",
                fontSize: "0.6rem",
                color: "rgba(255,255,255,0.4)"
              }}>
                <span>{photoIndex > 0 ? "← Prev" : ""}</span>
                <span>{photoIndex < goofyPhotos.length - 1 ? "Next →" : ""}</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: isMobile ? "0.6rem 1rem" : "0.7rem 0.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <button
                onClick={doLike}
                aria-label={currentLikes > 0 ? "Liked photo" : "Like photo"}
                style={{ background: "none", border: "none", outline: "none", boxShadow: "none", appearance: "none", WebkitTapHighlightColor: "transparent", cursor: "pointer", padding: 0, lineHeight: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  aria-hidden="true"
                  style={{ display: "block", overflow: "visible" }}
                >
                  <path
                    d="M12 21.2 10.55 19.88C5.4 15.22 2 12.14 2 8.35 2 5.27 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.27 22 8.35c0 3.79-3.4 6.87-8.55 11.56L12 21.2Z"
                    fill={currentLikes > 0 ? "#e74c3c" : "none"}
                    stroke="#e74c3c"
                    strokeWidth={currentLikes > 0 ? 1.15 : 1.9}
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <span style={{ fontSize: "0.88rem", fontWeight: 600, color: COLORS.darkText }}>
                {currentLikes.toLocaleString()} {currentLikes === 1 ? "like" : "likes"}
              </span>
            </div>

            {/* Caption */}
            <div style={{ padding: isMobile ? "0 1rem 0.5rem" : "0 0.5rem 0.5rem" }}>
              <p style={{ fontSize: "0.88rem", color: COLORS.darkText, lineHeight: 1.6 }}>
                <strong>bemily</strong>{" "}
                <span style={{ color: COLORS.mediumText }}>{caption}</span>
              </p>
            </div>

            {/* Comments */}
            <div style={{ padding: isMobile ? "0 1rem" : "0 0.5rem", borderTop: `1px solid ${COLORS.border}`, marginTop: "0.3rem" }}>
              {currentComments.length > 0 && (
                <div style={{ padding: "0.6rem 0", maxHeight: 180, overflowY: "auto" }}>
                  {currentComments.map((c, i) => (
                    <div key={c.id || i} style={{ fontSize: "0.82rem", color: COLORS.mediumText, lineHeight: 1.6, marginBottom: "0.35rem", display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", alignItems: "baseline", columnGap: "0.55rem" }}>
                      <span style={{ minWidth: 0 }}>{c.text}</span>
                      {c.ts > 0 && (
                        <span style={{ fontSize: "0.65rem", color: COLORS.lightText, whiteSpace: "nowrap", textAlign: "right" }}>
                          {formatCommentTimestamp(c.ts)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <form
                onSubmit={handleSubmitComment}
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  padding: "0.7rem 0 1rem",
                  borderTop: currentComments.length > 0 ? `1px solid ${COLORS.border}` : "none"
                }}
              >
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  maxLength={280}
                  autoComplete="off"
                  placeholder="Add a comment..."
                  style={{
                    flex: 1,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 999,
                    padding: "0.5rem 0.9rem",
                    fontSize: "0.82rem",
                    background: COLORS.cardBg,
                    color: COLORS.darkText,
                    outline: "none"
                  }}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  style={{
                    border: "none",
                    background: commentText.trim() ? COLORS.accent : COLORS.border,
                    color: "#fff",
                    borderRadius: 999,
                    padding: "0.5rem 1rem",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: commentText.trim() ? "pointer" : "default",
                    transition: "background 0.2s"
                  }}
                >
                  Post
                </button>
              </form>
            </div>
          </>
        )}
      </div>
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
      setTabContentHeight(Math.max(node.getBoundingClientRect().height, node.scrollHeight));
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

  const fireHoosierConfetti = (origin = { x: 0.5, y: 0.72 }) => {
    [
      { particleCount: 70, spread: 60, startVelocity: 42, scalar: 1.05 },
      { particleCount: 45, spread: 100, startVelocity: 28, scalar: 0.9, decay: 0.92 },
      { particleCount: 18, spread: 125, startVelocity: 54, scalar: 1.2 }
    ].forEach((burst) => {
      confetti({
        ...burst,
        origin,
        colors: [COLORS.indianaCrimson, COLORS.indianaWhite, COLORS.accent],
        zIndex: 9999
      });
    });
  };

  const handleGoHoosiers = (origin) => {
    runTransaction(hoosierCountRef, (current) => (current || 0) + 1);
    fireHoosierConfetti(origin);
  };

  const handlePeelPointerDown = (event) => {
    if (isPeelCommitting) return;
    event.preventDefault();
    peelStartPointRef.current = { x: event.clientX, y: event.clientY };
    const maxPull = isMobile ? PEEL_MAX_PULL_MOBILE : PEEL_MAX_PULL_DESKTOP;
    const maxOffsetX = isMobile ? PEEL_MAX_X_MOBILE : PEEL_MAX_X_DESKTOP;
    const maxOffsetY = isMobile ? PEEL_MAX_Y_MOBILE : PEEL_MAX_Y_DESKTOP;

    const handlePointerMove = (moveEvent) => {
      if (!peelStartPointRef.current || isPeelCommitting) return;
      const dx = Math.max(0, moveEvent.clientX - peelStartPointRef.current.x);
      const dy = Math.max(0, peelStartPointRef.current.y - moveEvent.clientY);
      const nextOffset = {
        x: Math.min(dx, maxOffsetX),
        y: Math.min(dy, maxOffsetY)
      };
      setPeelOffset(nextOffset);
      setPeelProgress(Math.min(1, (dx + dy) / maxPull));
    };

    const handlePointerUp = (upEvent) => {
      const dx = peelStartPointRef.current ? Math.max(0, upEvent.clientX - peelStartPointRef.current.x) : 0;
      const dy = peelStartPointRef.current ? Math.max(0, peelStartPointRef.current.y - upEvent.clientY) : 0;
      const nextProgress = Math.min(1, (dx + dy) / maxPull);

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      peelStartPointRef.current = null;

      if (nextProgress > PEEL_COMMIT_PROGRESS) {
        setIsPeelCommitting(true);
        setPeelProgress(1);
        setPeelOffset({
          x: maxOffsetX,
          y: maxOffsetY
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
    const ceremonyVenue = "Christ Episcopal Church";
    const ceremonyAddress = "120 W High St, Charlottesville, VA 22902";
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Ben & Emily Wedding//EN
BEGIN:VEVENT
DTSTART;TZID=America/New_York:20261024T170000
DTEND;TZID=America/New_York:20261024T180000
SUMMARY:Ben & Emily Wedding Ceremony
DESCRIPTION:${ceremonyVenue} at 5:00 PM on October 24, 2026. Address: ${ceremonyAddress}.
LOCATION:${ceremonyVenue} - 120 W High St Charlottesville VA 22902
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Lora:wght@400;500;600&family=Caveat:wght@500;600&family=Archivo+Black&display=swap');

        .press-button {
          position: relative;
          transition: transform 0.06s ease, box-shadow 0.06s ease, letter-spacing 0.06s ease;
          box-shadow: 0 4px 0 rgba(0,0,0,0.15), 0 6px 12px rgba(0,0,0,0.08) !important;
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .press-button:active {
          transform: translateY(3px) scaleY(0.95) scaleX(1.02) !important;
          box-shadow: 0 0px 0 rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.05) !important;
          letter-spacing: -0.02em;
        }

        .press-button.press-button--celebrate {
          transform: var(--celebrate-transform, none);
        }

        .press-button.press-button--celebrate:active {
          transform: var(--celebrate-transform, translateY(3px) scaleY(0.95) scaleX(1.02)) !important;
        }

        .tab-strip {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .tab-strip::-webkit-scrollbar {
          display: none;
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
                className="tab-strip"
                style={{
                  display: "flex",
                  gap: isMobile ? "0.18rem" : "0.3rem",
                  background: COLORS.cream,
                  padding: isMobile ? "0.28rem" : "0.4rem",
                  borderRadius: 10,
                  justifyContent: "center",
                  flexWrap: "nowrap",
                  border: `1px solid ${COLORS.border}`,
                  overflowX: isMobile ? "auto" : "visible",
                  overflowY: "hidden",
                  WebkitOverflowScrolling: "touch"
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
              animate={shouldReduceMotion || isMobile ? { height: "auto" } : { height: tabContentHeight || "auto" }}
              transition={tabHeightTransition}
              style={{
                position: "relative",
                overflow: shouldReduceMotion || isMobile ? "visible" : "hidden",
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
              hoosierCount={hoosierCount}
              onClose={handleCloseHoosierPage}
              onRevealHoosiers={fireHoosierConfetti}
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
  const [holdColorProgress, setHoldColorProgress] = useState(0);
  const [holdMushProgress, setHoldMushProgress] = useState(0);
  const [holdSwellProgress, setHoldSwellProgress] = useState(0);
  const [isCelebrateHolding, setIsCelebrateHolding] = useState(false);
  const containerVariants = getStaggerContainerVariants(reducedMotion);
  const itemVariants = getStaggerItemVariants(reducedMotion);
  const longPressTriggeredRef = useRef(false);
  const holdStartRef = useRef(0);
  const holdAnimationRef = useRef(null);
  const mixChannel = (start, end, amount) => Math.round(start + (end - start) * amount);

  useEffect(() => () => {
    if (holdAnimationRef.current) {
      cancelAnimationFrame(holdAnimationRef.current);
    }
  }, []);

  const cycle = (slot) =>
    setIndices((prev) =>
      prev.map((v, i) => (i === slot && photoBuckets[slot].length > 0 ? (v + 1) % photoBuckets[slot].length : v))
    );

  const clearCelebrateHold = () => {
    if (holdAnimationRef.current) {
      cancelAnimationFrame(holdAnimationRef.current);
      holdAnimationRef.current = null;
    }
  };

  const updateHoldProgress = () => {
    const elapsed = performance.now() - holdStartRef.current;
    const nextColorProgress = clamp01(elapsed / HOLD_COLOR_DURATION_MS);
    const nextMushProgress = clamp01(elapsed / HOLD_MUSH_DURATION_MS);
    const nextSwellProgress = clamp01((elapsed - HOLD_SWELL_START_MS) / HOLD_SWELL_DURATION_MS);
    setHoldColorProgress(nextColorProgress);
    setHoldMushProgress(nextMushProgress);
    setHoldSwellProgress(nextSwellProgress);

    if (elapsed >= HOLD_REVEAL_MS) {
      longPressTriggeredRef.current = true;
      clearCelebrateHold();
      setIsCelebrateHolding(false);
      setHoldColorProgress(0);
      setHoldMushProgress(0);
      setHoldSwellProgress(0);
      onRevealHoosierCorner();
      return;
    }

    holdAnimationRef.current = requestAnimationFrame(updateHoldProgress);
  };

  const handleCelebratePointerDown = (event) => {
    event.preventDefault();
    longPressTriggeredRef.current = false;
    clearCelebrateHold();
    holdStartRef.current = performance.now();
    setIsCelebrateHolding(true);
    setHoldColorProgress(0);
    setHoldMushProgress(0);
    setHoldSwellProgress(0);
    holdAnimationRef.current = requestAnimationFrame(updateHoldProgress);
  };

  const handleCelebratePointerUp = () => {
    clearCelebrateHold();
    setIsCelebrateHolding(false);
    setHoldColorProgress(0);
    setHoldMushProgress(0);
    setHoldSwellProgress(0);
  };

  const handleCelebrateTap = (event) => {
    if (longPressTriggeredRef.current) {
      event.preventDefault();
      longPressTriggeredRef.current = false;
      return;
    }
    handleButtonClick();
  };

  const celebrateBaseFontSize = isMobile ? 0.8 : 0.85;
  const holdWarmth = isCelebrateHolding ? Math.min(1, 0.08 + holdColorProgress * 0.92) : 0;
  const mushProgress = reducedMotion ? 0 : holdMushProgress;
  const swellProgress = reducedMotion ? 0 : holdSwellProgress;
  const celebrateScaleX = 1.02 + mushProgress * 0.03 + swellProgress * 0.045;
  const celebrateScaleY = 0.95 - mushProgress * 0.055 + swellProgress * 0.125;
  const celebrateTranslateY = 3 - swellProgress * 1.25;
  const celebrateHoldTransform = `translateY(${celebrateTranslateY}px) scaleX(${celebrateScaleX}) scaleY(${celebrateScaleY})`;
  const celebrateButtonBackground = `rgb(${mixChannel(197, 153, holdWarmth)}, ${mixChannel(165, 0, holdWarmth)}, ${mixChannel(90, 0, holdWarmth)})`;

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
                position: "relative",
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
                <>
                  <img src={src} alt={`Story ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: i === 2 ? "40% center" : "center" }} />
                  {bucket.length > 1 && (
                    <span style={{ position: "absolute", bottom: 10, right: 12, fontSize: "0.6rem", color: "rgba(255,255,255,0.55)", fontStyle: "italic", pointerEvents: "none" }}>Tap for more</span>
                  )}
                </>
              ) : (
                <span style={{ color: COLORS.lightText, fontSize: "0.85rem", fontStyle: "italic" }}>Add photos to assets/b{i + 1}</span>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Story Text */}
      <motion.div variants={itemVariants} style={{ padding: isMobile ? "0.9rem 0.3rem" : "1.5rem 2rem", marginBottom: "2rem", maxWidth: isMobile ? 360 : "none", marginInline: "auto" }}>
        <p style={{ fontSize: isMobile ? "0.79rem" : "0.9rem", lineHeight: isMobile ? 1.72 : 1.8, color: COLORS.mediumText, textAlign: "center", marginBottom: "1.15rem" }}>
          Emily and Ben met on Halloween in Atlanta, with Emily dressed as Padme and Ben as Anakin. Since then, life has taken them from Atlanta to New York City, where they&apos;ve built a home together on the Upper East Side.
        </p>
        <p style={{ fontSize: isMobile ? "0.79rem" : "0.9rem", lineHeight: isMobile ? 1.72 : 1.8, color: COLORS.mediumText, textAlign: "center", marginBottom: "1.15rem" }}>
          We&apos;re looking forward to celebrating this next chapter with you. Here you&apos;ll find all the details about our wedding weekend, travel information, and our registry.
        </p>
        <p style={{ fontSize: isMobile ? "0.79rem" : "0.9rem", lineHeight: isMobile ? 1.72 : 1.8, color: COLORS.mediumText, textAlign: "center" }}>
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
          className="press-button press-button--celebrate"
          onClick={handleCelebrateTap}
          onContextMenu={(event) => event.preventDefault()}
          onPointerDown={handleCelebratePointerDown}
          onPointerUp={handleCelebratePointerUp}
          onPointerLeave={handleCelebratePointerUp}
          onPointerCancel={handleCelebratePointerUp}
          style={{
            position: "relative",
            "--celebrate-transform": isCelebrateHolding ? celebrateHoldTransform : undefined,
            background: celebrateButtonBackground,
            color: "#FFFFFF",
            border: "none",
            padding: "0.7rem 1.6rem",
            fontSize: `${celebrateBaseFontSize}rem`,
            fontWeight: 500,
            borderRadius: 50,
            cursor: "pointer",
            marginBottom: "0.5rem",
            letterSpacing: "0.05em",
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
            touchAction: "manipulation",
            transition: isCelebrateHolding ? "none" : "background 0.2s linear, transform 0.24s ease-out"
          }}
        >
          {CELEBRATE_BUTTON_TEXT}
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
  const detailBodyStyle = {
    lineHeight: isMobile ? 1.72 : 1.8,
    color: COLORS.mediumText,
    fontSize: isMobile ? "0.84rem" : "0.95rem"
  };
  const detailLabelStyle = {
    marginBottom: "0.6rem"
  };
  const detailListStyle = {
    paddingLeft: isMobile ? "1.1rem" : "1.5rem",
    marginBottom: "1.8rem"
  };
  const detailListItemStyle = {
    marginBottom: "0.55rem",
    lineHeight: isMobile ? 1.68 : 1.75
  };
  const detailLinkStyle = {
    color: COLORS.darkText,
    textDecoration: "underline"
  };
  const detailMutedStyle = {
    color: COLORS.lightText,
    marginBottom: "0.8rem",
    fontStyle: "italic",
    fontSize: isMobile ? "0.78rem" : "0.85rem"
  };
  const schedulePaperStyle = {
    position: "relative",
    background: "linear-gradient(180deg, #fafaf6 0%, #f6f5ef 100%)",
    border: "1px solid rgba(170, 158, 138, 0.22)",
    borderRadius: isMobile ? 18 : 22,
    boxShadow: "0 12px 26px rgba(44,36,32,0.06)",
    padding: isMobile ? "2.8rem 1.45rem 2.45rem" : "3.8rem 2rem 3.5rem",
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
    <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "0.45rem" : "0.9rem", margin: isMobile ? "1.3rem 0 1rem" : "1.8rem 0 1.4rem" }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${COLORS.border})` }} />
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "0.28rem" : "0.55rem", color: COLORS.accent, flexShrink: 0 }}>
        <div style={{ width: isMobile ? 6 : 8, height: isMobile ? 6 : 8, border: `1px solid ${COLORS.accent}`, transform: "rotate(45deg)" }} />
        <div style={{ width: isMobile ? 14 : 26, height: 1, background: COLORS.accent, opacity: 0.7 }} />
        <div style={{ width: isMobile ? 6 : 8, height: isMobile ? 6 : 8, border: `1px solid ${COLORS.accent}`, transform: "rotate(45deg)" }} />
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
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(circle at 16% 14%, rgba(255,255,255,0.4), transparent 26%),
              radial-gradient(circle at 82% 84%, rgba(156, 126, 88, 0.05), transparent 22%),
              linear-gradient(90deg, rgba(201,171,132,0.08) 0%, transparent 8%, transparent 92%, rgba(201,171,132,0.08) 100%)
            `,
            pointerEvents: "none"
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: isMobile ? "7px" : "8px",
            border: "1px solid rgba(182, 153, 118, 0.12)",
            borderRadius: isMobile ? 14 : 18,
            pointerEvents: "none"
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: isMobile ? 18 : 26,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: isMobile ? "0.4rem" : "0.6rem",
            pointerEvents: "none"
          }}
        >
          <div style={{ width: isMobile ? 5 : 7, height: isMobile ? 5 : 7, border: `1px solid ${COLORS.accent}`, transform: "rotate(45deg)", opacity: 0.55 }} />
          <div style={{ width: isMobile ? 28 : 44, height: 1, background: COLORS.accent, opacity: 0.45 }} />
          <div style={{ width: isMobile ? 5 : 7, height: isMobile ? 5 : 7, border: `1px solid ${COLORS.accent}`, transform: "rotate(45deg)", opacity: 0.55 }} />
        </div>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: isMobile ? 18 : 26,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: isMobile ? "0.4rem" : "0.6rem",
            pointerEvents: "none"
          }}
        >
          <div style={{ width: isMobile ? 5 : 7, height: isMobile ? 5 : 7, border: `1px solid ${COLORS.accent}`, transform: "rotate(45deg)", opacity: 0.55 }} />
          <div style={{ width: isMobile ? 28 : 44, height: 1, background: COLORS.accent, opacity: 0.45 }} />
          <div style={{ width: isMobile ? 5 : 7, height: isMobile ? 5 : 7, border: `1px solid ${COLORS.accent}`, transform: "rotate(45deg)", opacity: 0.55 }} />
        </div>
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
          <div style={{ width: isMobile ? 40 : 50, height: 1, background: COLORS.accent, margin: isMobile ? "0 auto 1.55rem" : "0 auto 2rem" }} />

          <div style={{ maxWidth: isMobile ? "100%" : 480, margin: "0 auto" }}>
          {/* Friday */}
            <h4 style={{
              fontSize: isMobile ? "0.72rem" : "0.8rem",
              fontWeight: 600,
              color: COLORS.accent,
              textTransform: "uppercase",
              letterSpacing: isMobile ? "0.16em" : "0.2em",
              marginBottom: "0.5rem"
            }}>
              Friday, October 23
            </h4>

            <ScheduleRow time="10:00 AM" event="Scramble Golf Tournament" location="Birdwood Golf Club" note="If interested, fill out this form." noteHref={GOLF_FORM_URL || undefined} isMobile={isMobile} />
            <ScheduleRow time="5:00 PM" event="Rehearsal Dinner" location="Farmington Country Club - The Jefferson Room" attire="Cocktail Attire" isMobile={isMobile} />
            <ScheduleRow time="8:00 PM" event="Welcome Party" location="Farmington Country Club - The Blue Ridge Room" attire="Cocktail Attire" isLast isMobile={isMobile} />

            {dayDivider()}

            {/* Saturday */}
            <h4 style={{
              fontSize: isMobile ? "0.72rem" : "0.8rem",
              fontWeight: 600,
              color: COLORS.accent,
              textTransform: "uppercase",
              letterSpacing: isMobile ? "0.16em" : "0.2em",
              marginBottom: "0.5rem"
            }}>
              Saturday, October 24
            </h4>

            <ScheduleRow time="5:00 PM" event="Ceremony" location="Christ Episcopal Church" attire="Black Tie Optional" isMobile={isMobile} />
            <ScheduleRow time="6:30 PM" event="Cocktail Hour" location="Rosemont Farm" attire="Black Tie Optional" isMobile={isMobile} />
            <ScheduleRow time="7:30 PM" event="Reception & Dinner" location="Rosemont Farm" attire="Black Tie Optional" isMobile={isMobile} />
            <ScheduleRow time="11:00 PM" event="Late Night" location="Rosemont Farm" attire="" isLast isMobile={isMobile} />
          </div>
        </div>
      </motion.div>

      {/* Divider before Travel */}
      <div style={{ width: "60%", maxWidth: 300, height: 1, background: COLORS.border, margin: "1.5rem auto 2.5rem" }} />

      {/* Travel & Hotels */}
      <motion.div variants={itemVariants} style={plainSectionStyle}>
        {sectionTitle("Travel & Stay")}
        <div style={detailBodyStyle}>

          <p style={detailLabelStyle}><strong style={{ color: COLORS.darkText }}>Getting There:</strong></p>
          <p style={{ marginBottom: "1.8rem" }}>
            Charlottesville-Albemarle Airport (CHO) is 20 minutes from downtown.<br />
            Charlottesville Amtrak Station (CVS) is right in town with daily service from DC, NYC, and beyond.
          </p>

          <p style={detailLabelStyle}><strong style={{ color: COLORS.darkText }}>Hotels with Room Blocks:</strong></p>
          <ul style={detailListStyle}>
            <li style={detailListItemStyle}>
              <a href="https://be.synxis.com/?Hotel=48984&Chain=10237&arrive=2026-10-23&depart=2026-10-25&adult=1&child=0&group=1281" target="_blank" rel="noopener noreferrer" style={detailLinkStyle}>
                <strong>Boars Head Resort</strong>
              </a>{" "}
              — If you need a reservation for before or after these dates, or if you need to book more than two rooms, please call to speak with a Reservation agent and have them reference <strong style={{ color: COLORS.darkText }}>Collins-Reichert Wedding Room Block</strong>. Block code: <strong style={{ color: COLORS.darkText }}>1281</strong>.
            </li>
            <li style={detailListItemStyle}>
              <a href={DRAFTSMAN_URL} target="_blank" rel="noopener noreferrer" style={detailLinkStyle}>
                <strong>The Draftsman</strong>
              </a>{" "}
              — Courtesy block available (10 rooms).
            </li>
            <li style={{ marginBottom: "0.4rem", display: "none" }}>
              <strong>The Draftsman</strong> — Courtesy block available (10 rooms). More details to follow.
            </li>
            <li style={detailListItemStyle}>
              <a href="https://englishinncharlottesville.com/" target="_blank" rel="noopener noreferrer" style={detailLinkStyle}>
                <strong>The English Inn of Charlottesville</strong>
              </a>{" "}— No online booking link for the room block. Call the front desk at <strong style={{ color: COLORS.darkText }}>434-971-9900 ext. 0</strong> and reference group code <strong style={{ color: COLORS.darkText }}>COLLINS-REICHERT WEDDING GROUP</strong>. Rate is $289/night plus tax and includes breakfast buffet, internet, and parking. Check-in 4:00 PM, check-out 11:00 AM. Room block releases 40 days before the wedding.
            </li>
          </ul>

          <p style={detailLabelStyle}><strong style={{ color: COLORS.darkText }}>Other Hotel Options:</strong></p>
          <p style={detailMutedStyle}>
            Please note: we do not have a wedding block at these hotels. Book directly at general rates.
          </p>
          <ul style={detailListStyle}>
            <li style={detailListItemStyle}>
              <a href="https://www.ihg.com/kimptonhotels/hotels/us/en/find-hotels/select-roomrate?fromRedirect=true&qSrt=sBR&qDest=Kimpton%20The%20Forum%20Hotel&qErm=false&qSlH=chodd&qRms=1&qAdlt=1&qChld=0&qCiD=26&qCiMy=072025&qCoD=29&qCoMy=072025&qCpid=100221153&qAAR=6CBARC&qRtP=6CBARC&setPMCookies=true&qSHBrC=KI&qpMbw=0&qpMn=1&srb_u=1&qRmFltr=" target="_blank" rel="noopener noreferrer" style={detailLinkStyle}>
                Kimpton The Forum Hotel
              </a> — 15% off with room block link.
            </li>
            <li style={detailListItemStyle}>
              <a href="https://www.hilton.com/en/hotels/chogcgu-graduate-charlottesville/" target="_blank" rel="noopener noreferrer" style={detailLinkStyle}>
                The Graduate
              </a>{" "}— Book directly at general rates.
            </li>
          </ul>

          <p style={detailLabelStyle}><strong style={{ color: COLORS.darkText }}>VA Guest Houses:</strong></p>
          <p style={{ marginBottom: "0.8rem" }}>
            Guesthouses accommodates wedding block holds across their entire portfolio of properties, allowing guests to book and pay directly. Here's how it works:
          </p>
          <ul style={{ ...detailListStyle, marginBottom: "1.2rem" }}>
            <li>Minimum stay of 2 nights (select dates or properties require 3)</li>
            <li>10% deposit to hold properties</li>
            <li>Guests may call and book any held units</li>
          </ul>
          <p style={{ marginBottom: "0.8rem" }}>
            Accommodations close to Rosemont Farm:
          </p>
          <ul style={{ ...detailListStyle, marginBottom: "1.2rem" }}>
            <li><a href="https://www.vaguesthouses.com/charlottesville-vacation-rentals/blue-mountain-haven" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.darkText, textDecoration: "underline" }}>Blue Mountain Haven</a> — 5 bedrooms, 4 bathrooms, sleeps 10</li>
            <li><a href="https://www.vaguesthouses.com/charlottesville-vacation-rentals/farlea" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.darkText, textDecoration: "underline" }}>Farlea</a> — 4 bedrooms, 2.5 bathrooms, sleeps 8</li>
            <li><a href="https://www.vaguesthouses.com/charlottesville-vacation-rentals/fox-cottage" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.darkText, textDecoration: "underline" }}>Fox Cottage</a> — 2 bedrooms, 2 bathrooms, sleeps 4</li>
            <li><a href="https://www.vaguesthouses.com/charlottesville-vacation-rentals/ivy-cottages-all-cottages" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.darkText, textDecoration: "underline" }}>Ivy Cottages</a> — 5 one-bedroom cottages, each sleeping 2–4 guests</li>
            <li>Ramsay Estate Main House — 3 bedrooms, 5 bathrooms, sleeps 8 (not on website, but bookable for select groups)</li>
            <li><a href="https://www.vaguesthouses.com/piedmont-place-suites" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.darkText, textDecoration: "underline" }}>Piedmont Place Suites</a> — 6 two-bedroom, 2 bathroom suites, each sleeps 4–6 guests</li>
            <li><a href="https://www.vaguesthouses.com/charlottesville-vacation-rentals/ramsay-estate-carriage-house" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.darkText, textDecoration: "underline" }}>Ramsay Estate Carriage House</a> — 1 bedroom, 1 bathroom, sleeps 2</li>
            <li><a href="https://www.vaguesthouses.com/charlottesville-vacation-rentals/ramsay-estate-cottage" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.darkText, textDecoration: "underline" }}>Ramsay Estate Cottage</a> — 3 bedrooms, 3 bathrooms, sleeps 6</li>
            <li><a href="https://www.vaguesthouses.com/charlottesville-vacation-rentals/stockton-creek-farmhouse" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.darkText, textDecoration: "underline" }}>Stockton Creek Farmhouse</a> — 3 bedrooms, 2.5 bathrooms, sleeps 6</li>
          </ul>
          <p>
            You can view a map of all properties on the <a href="https://www.vaguesthouses.com/" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.darkText, textDecoration: "underline" }}>VA Guesthouses website</a>.
          </p>
        </div>
      </motion.div>

      {/* Divider before Shuttle */}
      <div style={{ width: "60%", maxWidth: 300, height: 1, background: COLORS.border, margin: "1rem auto 2.5rem" }} />

      {/* Shuttle Information */}
      <motion.div variants={itemVariants} style={plainSectionStyle}>
        {sectionTitle("Shuttle Information")}
        <p style={{ ...detailBodyStyle, textAlign: "center" }}>
          Coming Soon
        </p>
      </motion.div>

      {/* Divider before Things to Do */}
      <div style={{ width: "60%", maxWidth: 300, height: 1, background: COLORS.border, margin: "1rem auto 2.5rem" }} />

      {/* Things to Do */}
      <motion.div variants={itemVariants} style={plainSectionStyle}>
        {sectionTitle("Things to Do in Charlottesville")}
        <div style={detailBodyStyle}>
          <p style={{ marginBottom: "1.2rem" }}>
            <strong style={{ color: COLORS.darkText }}>Dining</strong> — Don't miss Riverside for lunch by the water, Bodo's Bagels for the best bagels in town, and C&O Restaurant for a Charlottesville classic.
          </p>
          <p style={{ marginBottom: "1.2rem" }}>
            <strong style={{ color: COLORS.darkText }}>Drinks & Wine</strong> — Charlottesville is wine country! King Family Vineyards, Pippin Hill Farm & Vineyards, and Early Mountain Vineyards are all beautiful. Check out <a href="https://raggedbranch.com/" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.darkText, textDecoration: "underline" }}>Ragged Branch Distillery</a> for Virginia bourbon, and <a href="https://www.prn.beer/" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.darkText, textDecoration: "underline" }}>Pro Re Nata Brewery</a> for craft beer. In town, The Whiskey Jar and Coup Deville's are great for a casual drink.
          </p>
          <p>
            <strong style={{ color: COLORS.darkText }}>Shopping</strong> — Stroll the Downtown Mall, a charming pedestrian mall with boutiques and restaurants. Be sure to stop by <a href="https://quattrotizi.com/" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.darkText, textDecoration: "underline" }}>Quattro Tizi</a> at the Dairy Market for men's and women's clothing.
          </p>
        </div>
      </motion.div>

    </motion.div>
  );
}

/* ============================================
   REGISTRY TAB
   ============================================ */

function RegistryTab({ isMobile, reducedMotion }) {
  const iconSvgProps = {
    width: 30,
    height: 30,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.3,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };
  const SaucepanIcon = () => (
    <svg {...iconSvgProps}>
      {/* knob connected to lid dome */}
      <path d="M11 9v-2h2v2" />
      <path d="M5.5 11Q12 8 18.5 11" />
      {/* pot body */}
      <path d="M5.5 11v6.5a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3V11" />
      {/* side handles */}
      <path d="M5.5 13.5H2.5M18.5 13.5H21.5" />
    </svg>
  );
  const BedIcon = () => (
    <svg {...iconSvgProps} stroke="none" fill="currentColor">
      <path d="M2 19V8a2 2 0 0 1 2-2H5.5A2 2 0 0 1 7.5 8V13H22a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />
      <rect x="3" y="19" width="2" height="2" rx="0.4" />
      <rect x="20.5" y="19" width="2" height="2" rx="0.4" />
      <rect x="8" y="13.8" width="6" height="3" rx="0.7" fill="rgba(255,255,255,0.4)" />
    </svg>
  );
  const WineGlassIcon = () => (
    <svg {...iconSvgProps}>
      <path d="M8 4h8c0 5-1.6 8.5-4 9-2.4-.5-4-4-4-9z" />
      <path d="M12 13v6.5" />
      <path d="M8.5 19.5h7" />
    </svg>
  );
  const PlateIcon = () => {
    const trimDots = Array.from({ length: 12 }).map((_, i) => {
      const angle = (i * 30 * Math.PI) / 180;
      return <circle key={i} cx={10 + 5.8 * Math.cos(angle)} cy={12 + 5.8 * Math.sin(angle)} r={0.45} fill="currentColor" stroke="none" />;
    });
    return (
      <svg {...iconSvgProps}>
        {/* plate */}
        <circle cx="10" cy="12" r="7" />
        <circle cx="10" cy="12" r="4.5" />
        {trimDots}
        {/* fork */}
        <path d="M19 5v14" />
        <path d="M17.5 5v4M19 9v-4M20.5 5v4" />
        <path d="M17.5 9Q19 10.5 19 9" />
        {/* knife */}
        <path d="M22.5 5v14" />
        <path d="M22.5 5Q24.5 7 22.5 11" />
      </svg>
    );
  };
  const registries = [
    { name: "Williams Sonoma", icon: <SaucepanIcon />, url: "https://www.williams-sonoma.com/registry/b5qxm986n7/registry-list.html" },
    { name: "Bloomingdale's", icon: <BedIcon />, url: "https://www.bloomingdales.com/registry/Emily-Collins-Ben-Reichert/1414256" },
    { name: "Simon Pearce", icon: <WineGlassIcon />, url: "https://www.myregistry.com/wedding-registry/emily-collins-and-ben-reichert-new-york-ny/5388243" },
    { name: "Scully and Scully", icon: <PlateIcon />, url: "https://www.scullyandscully.com/wedding-registry/emilycollinsandbenreichert" }
  ];
  const containerVariants = getStaggerContainerVariants(reducedMotion);
  const itemVariants = getStaggerItemVariants(reducedMotion);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      <motion.h2 variants={itemVariants} style={getTabTitleStyle(isMobile)}>Registry</motion.h2>
      <motion.p variants={itemVariants} style={getTabSubtitleStyle(isMobile)}>Your presence is the greatest gift</motion.p>

      <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", justifyContent: "center", gap: "1.2rem", marginBottom: "2rem" }}>
        {registries.map((r) => (
          <a
            key={r.name}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              ...getSectionCardStyle(isMobile),
              padding: "1.5rem 1rem",
              textAlign: "center",
              color: COLORS.darkText,
              marginBottom: 0,
              textDecoration: "none",
              cursor: "pointer"
            }}
          >
            <div style={{
              marginBottom: "0.8rem",
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: COLORS.cream,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 0.8rem",
              color: COLORS.accent
            }}>
              {r.icon}
            </div>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "0.4rem", fontWeight: 500, fontFamily: "'Cormorant Garamond', serif" }}>{r.name}</h3>
            <p style={{ fontSize: "0.85rem", color: COLORS.accent }}>View Registry →</p>
          </a>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} style={{ textAlign: "center", padding: isMobile ? "2rem 1rem" : "2.5rem 2rem", marginTop: "1rem" }}>
        <div style={{ width: 40, height: 1, background: COLORS.accent, margin: "0 auto 1.5rem", opacity: 0.5 }} />
        <h3 style={{
          fontSize: isMobile ? "1.3rem" : "1.5rem",
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 500,
          fontStyle: "italic",
          color: COLORS.darkText,
          marginBottom: "1rem"
        }}>
          A Note from Us
        </h3>
        <p style={{
          fontSize: isMobile ? "0.88rem" : "0.95rem",
          color: COLORS.mediumText,
          lineHeight: 1.9,
          fontStyle: "italic",
          maxWidth: 480,
          margin: "0 auto"
        }}>
          The most important gift is your presence on our special day. If you'd still like to give something, we'd be grateful for contributions toward our honeymoon adventure!
        </p>
        <div style={{ width: 40, height: 1, background: COLORS.accent, margin: "1.5rem auto 0", opacity: 0.5 }} />
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
    { frontName: "Harry Reichert", backName: "Gresh", relation: "Brother", photos: harryPhotos, role: "Best Man", maxBench: "175 lbs", fortyYard: "4.95s", handicap: "19.0", relationshipStatus: "Taken", currentCity: "Williamsburg, NY", college: "Northwestern University", collegeLogo: nu, footballTeam: "Cleveland Browns", footballLogo: brown, comment: "Known for his subpar jumpshot and spending more time in the trees than in the fairway. Let's hope Harry shows up on time to the ceremony." },
    { frontName: "Charlie Reichert", backName: "Chuck Wagon", relation: "Brother", photos: chuckPhotos, role: "Groomsman", maxBench: "135 lbs", fortyYard: "5.4s", handicap: "13.5", relationshipStatus: "Taken", currentCity: "Chicago, IL", college: "University of Wisconsin", collegeLogo: w, footballTeam: "Chicago Bears", footballLogo: bears, comment: "Known for his inconsistency off the tee and emotional instability at Bears games. Keep your eyes peeled when Chuck hits the dance floor." },
    { frontName: "Jack Reichert", backName: "Jacko", relation: "Brother", photos: jackoPhotos, role: "Groomsman", maxBench: "185 lbs", fortyYard: "5.8s", handicap: "20.0", relationshipStatus: "Single", currentCity: "Washington DC", college: "University of Virginia", collegeLogo: uva, footballTeam: "Minnesota Vikings", footballLogo: vikes, comment: "The most controversial character in the lineup. No, you don't want to meet his boy. Look for Jacko on stage for the late night." },
    { frontName: "Cole Dickinson", backName: "Cole D", relation: "Dog", photos: colePhotos, role: "Groomsman", maxBench: "285 lbs", fortyYard: "4.9s", handicap: "9.5", relationshipStatus: "Married", currentCity: "Charleston, SC", college: "University of South Carolina", collegeLogo: sc, footballTeam: "Washington Football Team", footballLogo: fbt, comment: "It's too Cole for my Dickinson. Known for his quip and catch phrase 'my life is your vacation.' Try not to let this guy get under your skin." },
    { frontName: "Henry Kreienbaum", backName: "Henry Cignetti", relation: "Dog", photos: henryPhotos, role: "Groomsman", maxBench: "265 lbs", fortyYard: "5.3s", handicap: "15.0", relationshipStatus: "Taken", currentCity: "Atlanta, GA", college: "James Madison University", collegeLogo: dukes, collegeLogoScale: 1.5, footballTeam: "Washington Commanders", footballLogo: commies, comment: "Don't ask this guy about NASCAR, but do ask about Curt Cignetti. And definitely ask for a Juul rip." },
    { frontName: "Oliver Herndon", backName: "Oli", relation: "Dog", photos: oliPhotos, role: "Groomsman", maxBench: "255 lbs", fortyYard: "4.6s", handicap: "22.0", relationshipStatus: "Engaged", currentCity: "New York, NY", college: "Washington & Lee University", collegeLogo: wl, footballTeam: "Washington Redskins", footballLogo: skins, comment: "Don give a piss bout nun but the Tide. And slow pitch softball. And zyns. Don't let this guy or his fiancée know that you have zyns." },
    { frontName: "Joel Gibbons V", backName: "Wood", relation: "Dog", photos: woodsPhotos, role: "Groomsman", maxBench: "155 lbs", fortyYard: "6.7s", handicap: "21.0", relationshipStatus: "Taken?", currentCity: "Washington DC", college: "Indiana University", collegeLogo: hoosierLogo, footballTeam: "Houston Texans", footballLogo: tex, comment: "While Wood is pretty smoked out, his exotic artwork will surely be worth millions one day. Don't mention politics around this guy, but do mention au pairs." },
    { frontName: "Wyatt Collins", backName: "Wyatt", relation: "Brother-in-law", photos: wyattPhotos, role: "Groomsman", maxBench: "225 lbs", fortyYard: "5.5s", handicap: "8.0", relationshipStatus: "Single", currentCity: "Knoxville, TN", college: "University of Tennessee", collegeLogo: ut, collegeLogoScale: 0.9, footballTeam: "The Vols", footballLogo: ut, footballLogoScale: 0.9, comment: "Known for his e4 openings as white and JUCO league thunder thighs. Don't trust your girlfriend around this guy." }
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
              <GroomCard person={p} isMobile={isMobile} />
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

const GroomCard = React.memo(({ person, isMobile }) => {
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
            <p style={{ marginTop: "auto", paddingTop: "clamp(0.3rem, 0.6vw, 0.5rem)", fontSize: "clamp(0.5rem, 0.82vw, 0.64rem)", color: COLORS.lightText, fontStyle: "italic" }}>Tap for more</p>
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
            padding: "clamp(0.5rem, 1.5vw, 1.15rem)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            overflow: "hidden"
          }}
        >
          <h3 style={{
            textAlign: "center",
            marginBottom: "clamp(0.25rem, 0.9vw, 0.7rem)",
            fontSize: "clamp(0.95rem, 2.35vw, 1.55rem)",
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
            gap: "clamp(0.25rem, 1vw, 0.75rem)",
            marginBottom: "clamp(0.3rem, 1vw, 0.75rem)",
            fontSize: "clamp(0.62rem, 1.2vw, 0.92rem)"
          }}>
            <StatCell label="Bench" value={person.maxBench} color={color} background={COLORS.cream} borderColor={COLORS.border} labelColor={COLORS.lightText} />
            <StatCell label="40-Yard" value={person.fortyYard} color={color} background={COLORS.cream} borderColor={COLORS.border} labelColor={COLORS.lightText} />
            <StatCell label="Handicap" value={person.handicap} color={color} background={COLORS.cream} borderColor={COLORS.border} labelColor={COLORS.lightText} />
            <StatCell label="Status" value={person.relationshipStatus} color={color} background={COLORS.cream} borderColor={COLORS.border} labelColor={COLORS.lightText} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(0.25rem, 0.75vw, 0.55rem)", fontSize: "clamp(0.6rem, 1vw, 0.8rem)", color: COLORS.mediumText, marginBottom: "clamp(0.25rem, 0.9vw, 0.7rem)", flexWrap: "wrap", textAlign: "center" }}>
            {person.collegeLogo && <img src={person.collegeLogo} alt="" style={{ width: 24 * (person.collegeLogoScale || 1) * (isMobile ? 0.9 : 1), height: 24 * (person.collegeLogoScale || 1) * (isMobile ? 0.9 : 1), objectFit: "contain" }} />}
            <span>{person.college}</span>
            <span style={{ color: COLORS.lightText }}>|</span>
            {person.footballLogo && <img src={person.footballLogo} alt="" style={{ width: 24 * (person.footballLogoScale || 1) * (isMobile ? 0.9 : 1), height: 24 * (person.footballLogoScale || 1) * (isMobile ? 0.9 : 1), objectFit: "contain" }} />}
            <span>{person.footballTeam}</span>
          </div>
          <p style={{
            flex: 1,
            margin: 0,
            padding: "0 clamp(0.15rem, 0.35vw, 0.25rem)",
            textAlign: "left",
            fontSize: "clamp(0.65rem, 1.15vw, 0.95rem)",
            color: COLORS.mediumText,
            fontStyle: "italic",
            lineHeight: 1.45,
            overflow: "hidden"
          }}>
            {person.comment}
          </p>
          <p style={{ textAlign: "center", marginTop: "clamp(0.15rem, 0.6vw, 0.4rem)", fontSize: "clamp(0.5rem, 0.82vw, 0.64rem)", color: COLORS.lightText }}>Tap to flip back</p>
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
            <p style={{ marginTop: "auto", paddingTop: "clamp(0.3rem, 0.6vw, 0.5rem)", fontSize: "clamp(0.5rem, 0.82vw, 0.64rem)", color: COLORS.lightText, fontStyle: "italic" }}>Tap for more</p>
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
            padding: "clamp(0.5rem, 1.5vw, 1.15rem)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            overflow: "hidden"
          }}
        >
          <h3 style={{
            textAlign: "center",
            marginBottom: "clamp(0.25rem, 0.9vw, 0.7rem)",
            fontSize: "clamp(0.95rem, 2.35vw, 1.55rem)",
            color: COLORS.darkText,
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            fontStyle: "italic"
          }}>
            {person.backName}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr", rowGap: "clamp(0.15rem, 0.35vw, 0.35rem)", columnGap: "0.55rem", fontSize: "clamp(0.6rem, 1.05vw, 0.82rem)", color: COLORS.mediumText, marginBottom: "clamp(0.25rem, 0.9vw, 0.7rem)", lineHeight: 1.4, alignItems: "start" }}>
            <span style={{ color, textTransform: "uppercase", letterSpacing: "0.06em" }}>College</span>
            <span>{person.college}</span>
            <span style={{ color, textTransform: "uppercase", letterSpacing: "0.06em" }}>Drink</span>
            <span>{person.favoriteDrink || "TBD"}</span>
            <span style={{ color, textTransform: "uppercase", letterSpacing: "0.06em" }}>Anthem</span>
            <span>{person.danceFloorSong || "TBD"}</span>
          </div>
          <p style={{
            flex: 1,
            margin: 0,
            padding: "0 clamp(0.15rem, 0.35vw, 0.25rem)",
            textAlign: "left",
            fontSize: "clamp(0.65rem, 1.15vw, 0.95rem)",
            color: COLORS.mediumText,
            fontStyle: "italic",
            lineHeight: 1.45,
            overflow: "hidden"
          }}>
            {person.funFact || person.comment}
          </p>
          <p style={{ textAlign: "center", marginTop: "clamp(0.15rem, 0.6vw, 0.4rem)", fontSize: "clamp(0.5rem, 0.82vw, 0.64rem)", color: COLORS.lightText }}>Tap to flip back</p>
        </div>
      </div>
    </div>
  );
});
