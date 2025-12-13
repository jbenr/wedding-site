import React from "react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import confetti from "canvas-confetti";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { FaHeart, FaCamera, FaGift, FaCalendar } from 'react-icons/fa';

import heroImage from './assets/IMG_9690.jpg';
import proposalPhoto from './assets/IMG_9679.jpg';
import engagedPhoto from './assets/IMG_9689.jpg';
import fenwayPhoto from './assets/IMG_3658.jpg';

export default function App() {
  const [tab, setTab] = useState("main");
  const [buttonCount, setButtonCount] = useState(0);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [guestBookEntries, setGuestBookEntries] = useState([]);
  
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  useEffect(() => {
    const weddingDate = new Date('2026-10-24T16:00:00');
    const updateCountdown = () => {
      const now = new Date();
      const diff = weddingDate - now;
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
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
    function fire(particleRatio, opts) {
      confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
    }
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  const handleButtonClick = () => {
    const newCount = buttonCount + 1;
    setButtonCount(newCount);
    localStorage.setItem("weddingButtonCount", newCount.toString());
    triggerConfetti();
  };

  const downloadCalendarEvent = () => {
    const icsContent = `BEGIN:VCALENDAR
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
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ben-emily-wedding.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const TabButton = ({ id, label, icon }) => (
    <button onClick={() => setTab(id)} style={{ flex: 1, padding: "0.875rem 1rem", border: "none", background: tab === id ? "#111" : "transparent", color: tab === id ? "white" : "#333", fontSize: "0.95rem", fontWeight: tab === id ? "600" : "500", borderRadius: "12px", cursor: "pointer", transition: "all 0.3s ease", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
      {icon}{label}
    </button>
  );

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", lineHeight: 1.6 }}>
      <Analytics />
      <SpeedInsights />
      <section style={{ minHeight: "100vh", position: "relative", color: "white", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <motion.div style={{ position: "absolute", inset: 0, backgroundImage: `url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center", y: heroY, opacity: heroOpacity }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))" }} />
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }} style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "2rem", maxWidth: "900px" }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
            <h1 style={{ fontSize: "clamp(3rem, 10vw, 5rem)", marginBottom: "1rem", fontWeight: "300", letterSpacing: "0.05em", fontFamily: "'Playfair Display', Georgia, serif" }}>Ben & Emily</h1>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }} style={{ fontSize: "clamp(1.1rem, 3vw, 1.5rem)", marginBottom: "2rem", fontWeight: "300", letterSpacing: "0.1em" }}>October 24, 2026</motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.8 }} style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)", fontWeight: "300", marginBottom: "2rem" }}>Charlottesville, Virginia</motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2, duration: 0.8 }} style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginBottom: "2rem", flexWrap: "wrap" }}>
            {[{ value: countdown.days, label: "Days" }, { value: countdown.hours, label: "Hours" }, { value: countdown.minutes, label: "Minutes" }, { value: countdown.seconds, label: "Seconds" }].map((item, i) => (
              <div key={i} style={{ background: "rgba(255, 255, 255, 0.15)", backdropFilter: "blur(10px)", padding: "1rem 1.5rem", borderRadius: "12px", minWidth: "80px" }}>
                <div style={{ fontSize: "2rem", fontWeight: "600" }}>{item.value}</div>
                <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>{item.label}</div>
              </div>
            ))}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.8 }}>
            <button onClick={() => document.getElementById("content").scrollIntoView({ behavior: "smooth" })} style={{ background: "rgba(255, 255, 255, 0.2)", backdropFilter: "blur(10px)", border: "1px solid rgba(255, 255, 255, 0.3)", color: "white", padding: "1rem 2.5rem", fontSize: "1rem", borderRadius: "50px", cursor: "pointer", transition: "all 0.3s ease", fontWeight: "500", letterSpacing: "0.05em" }} onMouseEnter={(e) => { e.target.style.background = "rgba(255, 255, 255, 0.3)"; e.target.style.transform = "translateY(-2px)"; }} onMouseLeave={(e) => { e.target.style.background = "rgba(255, 255, 255, 0.2)"; e.target.style.transform = "translateY(0)"; }}>Explore ↓</button>
          </motion.div>
        </motion.div>
      </section>
      <div id="content" style={{ position: "sticky", top: 0, background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e5e5e5", zIndex: 100, padding: "1rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", gap: "0.5rem", background: "#f8f8f8", padding: "0.5rem", borderRadius: "16px", flexWrap: "wrap" }}>
          <TabButton id="main" label="Main" icon={<FaHeart />} />
          <TabButton id="rsvp" label="RSVP" />
          <TabButton id="info" label="Info" />
          <TabButton id="party" label="Wedding Party" />
          <TabButton id="registry" label="Registry" icon={<FaGift />} />
          <TabButton id="guestbook" label="Guest Book" icon={<FaCamera />} />
        </div>
      </div>
      <section style={{ padding: "3rem 1rem", minHeight: "70vh" }}>
        {tab === "main" && <MainTab proposalPhoto={proposalPhoto} engagedPhoto={engagedPhoto} fenwayPhoto={fenwayPhoto} buttonCount={buttonCount} handleButtonClick={handleButtonClick} downloadCalendarEvent={downloadCalendarEvent} />}
        {tab === "rsvp" && <RSVPTab />}
        {tab === "info" && <InfoTab />}
        {tab === "party" && <WeddingPartyTab />}
        {tab === "registry" && <RegistryTab />}
        {tab === "guestbook" && <GuestBookTab entries={guestBookEntries} setEntries={setGuestBookEntries} />}
      </section>
      <footer style={{ textAlign: "center", padding: "3rem 1.5rem", background: "#111", color: "#eee" }}>
        <p style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>We can't wait to celebrate with you</p>
        <p style={{ fontSize: "2rem" }}>🤍</p>
        <p style={{ fontSize: "0.9rem", opacity: 0.7, marginTop: "1.5rem" }}>Ben & Emily • October 24, 2026</p>
      </footer>
    </div>
  );
}

function MainTab({ proposalPhoto, engagedPhoto, fenwayPhoto, buttonCount, handleButtonClick, downloadCalendarEvent }) {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", fontSize: "clamp(2rem, 5vw, 2.5rem)", marginBottom: "2rem", fontFamily: "'Playfair Display', Georgia, serif", fontWeight: "400" }}>Our Story</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
        {[{ src: proposalPhoto, alt: "The Proposal" }, { src: engagedPhoto, alt: "Engaged!" }, { src: fenwayPhoto, alt: "Fenway Kiss" }].map((img, i) => (
          <div key={i} style={{ borderRadius: "12px", overflow: "hidden", aspectRatio: "4/5" }}>
            <img src={img.src} alt={img.alt} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: img.alt === "Fenway Kiss" ? "40% center" : "center" }} />
          </div>
        ))}
      </div>
      <div style={{ background: "#f9f9f9", padding: "2.5rem", borderRadius: "16px", marginBottom: "3rem" }}>
        <p style={{ fontSize: "1.15rem", lineHeight: "1.8", color: "#333", textAlign: "center", marginBottom: "1.5rem" }}>What started as a chance meeting turned into countless adventures, inside jokes, and a love that grows deeper every day. We've laughed through the chaos, supported each other through challenges, and built a life filled with joy.</p>
        <p style={{ fontSize: "1.15rem", lineHeight: "1.8", color: "#333", textAlign: "center" }}>Now, we're ready to celebrate this next chapter with the people who mean the most to us. We can't wait to share this special day with you!</p>
      </div>
      <div style={{ textAlign: "center", padding: "2rem", background: "#f0f7ff", borderRadius: "16px", marginBottom: "2rem" }}>
        <FaCalendar style={{ fontSize: "3rem", color: "#667eea", marginBottom: "1rem" }} />
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#333" }}>Save the Date!</h3>
        <p style={{ marginBottom: "1.5rem", color: "#666" }}>Add our wedding to your calendar so you don't forget!</p>
        <button onClick={downloadCalendarEvent} style={{ background: "#667eea", color: "white", border: "none", padding: "1rem 2.5rem", fontSize: "1.1rem", fontWeight: "600", borderRadius: "50px", cursor: "pointer", transition: "all 0.3s ease" }} onMouseEnter={(e) => { e.target.style.background = "#5568d3"; e.target.style.transform = "translateY(-2px)"; }} onMouseLeave={(e) => { e.target.style.background = "#667eea"; e.target.style.transform = "translateY(0)"; }}>Download Calendar Event</button>
      </div>
      <div style={{ textAlign: "center", padding: "2rem", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderRadius: "16px", color: "white" }}>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "500" }}>How excited are you? 🎉</h3>
        <p style={{ marginBottom: "1.5rem", opacity: 0.9 }}>Click the button to show your excitement!</p>
        <button onClick={handleButtonClick} style={{ background: "white", color: "#667eea", border: "none", padding: "1.25rem 3rem", fontSize: "1.25rem", fontWeight: "600", borderRadius: "50px", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.2)", marginBottom: "1.5rem" }}>Can't Wait! 💕</button>
        <div style={{ fontSize: "1.25rem", fontWeight: "500" }}>Total clicks: {buttonCount.toLocaleString()}</div>
      </div>
    </div>
  );
}

function RSVPTab() {
  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", fontSize: "clamp(2rem, 5vw, 2.5rem)", marginBottom: "1.5rem", fontFamily: "'Playfair Display', Georgia, serif", fontWeight: "400" }}>RSVP</h2>
      <p style={{ textAlign: "center", fontSize: "1.1rem", marginBottom: "2.5rem", color: "#666" }}>Please let us know if you can join us by filling out the form below</p>
      <div style={{ background: "#f9f9f9", padding: "2rem", borderRadius: "16px", textAlign: "center" }}>
        <p style={{ marginBottom: "1.5rem", fontSize: "1.05rem" }}>Click below to open our RSVP form:</p>
        <a href="https://forms.gle/9U5nv3R1hasEXZYJA" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", background: "#111", color: "white", padding: "1.25rem 3rem", fontSize: "1.1rem", fontWeight: "600", borderRadius: "50px", textDecoration: "none", transition: "all 0.3s ease" }} onMouseEnter={(e) => { e.target.style.background = "#333"; e.target.style.transform = "translateY(-2px)"; }} onMouseLeave={(e) => { e.target.style.background = "#111"; e.target.style.transform = "translateY(0)"; }}>Open RSVP Form →</a>
        <p style={{ marginTop: "1.5rem", fontSize: "0.95rem", color: "#888" }}>Please respond by September 1, 2026</p>
      </div>
    </div>
  );
}

function InfoTab() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", fontSize: "clamp(2rem, 5vw, 2.5rem)", marginBottom: "3rem", fontFamily: "'Playfair Display', Georgia, serif", fontWeight: "400" }}>Wedding Information</h2>
      <div style={{ background: "#f9f9f9", padding: "2rem", borderRadius: "16px", marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", textAlign: "center", color: "#333" }}>Schedule</h3>
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          {[{ time: "4:00 PM", event: "Ceremony" }, { time: "5:00 PM", event: "Cocktail Hour" }, { time: "6:00 PM", event: "Reception & Dinner" }, { time: "10:00 PM", event: "Send-off" }].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "1rem 0", borderBottom: i < 3 ? "1px solid #e0e0e0" : "none", color: "#333" }}>
              <span style={{ fontWeight: "600", color: "#667eea" }}>{item.time}</span>
              <span>{item.event}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "#f9f9f9", padding: "2rem", borderRadius: "16px", marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", textAlign: "center", color: "#333" }}>Venue</h3>
        <p style={{ textAlign: "center", fontSize: "1.1rem", color: "#333" }}><strong>The Garden Estate</strong><br />123 Vineyard Lane<br />Charlottesville, VA 22902</p>
      </div>
      <div style={{ background: "#f9f9f9", padding: "2rem", borderRadius: "16px", marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", textAlign: "center", color: "#333" }}>Travel & Stay</h3>
        <div style={{ lineHeight: "1.8", color: "#333" }}>
          <p style={{ marginBottom: "1rem" }}><strong>Hotel Blocks:</strong></p>
          <ul style={{ paddingLeft: "1.5rem", marginBottom: "1.5rem" }}><li>The Charlottesville Inn - Book by Sept 1, 2026</li><li>Downtown Suites - Book by Sept 1, 2026</li></ul>
          <p><strong>Getting There:</strong><br />Charlottesville-Albemarle Airport (CHO) is 15 minutes from downtown. Rideshare and rental cars are readily available.</p>
        </div>
      </div>
      <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "2rem", borderRadius: "16px", color: "white", textAlign: "center" }}>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Dress Code</h3>
        <p style={{ fontSize: "1.1rem" }}>Cocktail Attire<br /><span style={{ fontSize: "0.95rem", opacity: 0.9 }}>(The ceremony will be outdoors on grass)</span></p>
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
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", fontSize: "clamp(2rem, 5vw, 2.5rem)", marginBottom: "1.5rem", fontFamily: "'Playfair Display', Georgia, serif", fontWeight: "400" }}>Registry</h2>
      <p style={{ textAlign: "center", fontSize: "1.1rem", marginBottom: "3rem", color: "#666" }}>Your presence is the best gift, but if you'd like to contribute to our future together, we've registered at these locations:</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmin(250px, 1fr))", gap: "1.5rem" }}>
        {registries.map((registry, i) => (
          <a key={i} href={registry.url} target="_blank" rel="noopener noreferrer" style={{ background: "#f9f9f9", padding: "2.5rem", borderRadius: "16px", textAlign: "center", textDecoration: "none", color: "#333", border: "2px solid transparent", transition: "all 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = registry.color; e.currentTarget.style.background = "#fff"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "#f9f9f9"; }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>{registry.icon}</div>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{registry.name}</h3>
            <p style={{ fontSize: "0.9rem", color: "#888" }}>Click to view registry →</p>
          </a>
        ))}
      </div>
      <div style={{ marginTop: "3rem", padding: "2rem", background: "#fff9e6", borderRadius: "16px", textAlign: "center" }}>
        <p style={{ fontSize: "1.05rem", color: "#666", lineHeight: "1.8" }}><strong>💛 A Note from Us:</strong><br />The most important gift is your presence on our special day. If you'd still like to give something, we'd be grateful for contributions toward our honeymoon adventure or home together!</p>
      </div>
    </div>
  );
}

function GuestBookTab({ entries, setEntries }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => { setPhotoPreview(reader.result); };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !message) return;
    const newEntry = { id: Date.now(), name, message, photo: photoPreview, timestamp: new Date().toISOString() };
    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem("guestBookEntries", JSON.stringify(updatedEntries));
    setName(""); setMessage(""); setPhoto(null); setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", fontSize: "clamp(2rem, 5vw, 2.5rem)", marginBottom: "1.5rem", fontFamily: "'Playfair Display', Georgia, serif", fontWeight: "400" }}>Guest Book</h2>
      <p style={{ textAlign: "center", fontSize: "1.1rem", marginBottom: "3rem", color: "#666" }}>Leave us a message and snap a selfie! 📸</p>
      <form onSubmit={handleSubmit} style={{ background: "#f9f9f9", padding: "2.5rem", borderRadius: "16px", marginBottom: "3rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>Your Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name..." required style={{ width: "100%", padding: "1rem", border: "2px solid #e0e0e0", borderRadius: "12px", fontSize: "1rem", fontFamily: "inherit" }} />
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>Your Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Share your well wishes..." required rows={4} style={{ width: "100%", padding: "1rem", border: "2px solid #e0e0e0", borderRadius: "12px", fontSize: "1rem", fontFamily: "inherit", resize: "vertical" }} />
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>Add a Selfie (Optional)</label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ width: "100%", padding: "1rem", border: "2px dashed #e0e0e0", borderRadius: "12px", cursor: "pointer" }} />
          {photoPreview && <div style={{ marginTop: "1rem", textAlign: "center" }}><img src={photoPreview} alt="Preview" style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "12px", objectFit: "cover" }} /></div>}
        </div>
        <button type="submit" style={{ width: "100%", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", border: "none", padding: "1.25rem", fontSize: "1.1rem", fontWeight: "600", borderRadius: "12px", cursor: "pointer", transition: "all 0.3s ease" }} onMouseEnter={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.4)"; }} onMouseLeave={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "none"; }}>Sign Guest Book 💕</button>
      </form>
      <div>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "2rem", textAlign: "center", color: "#333" }}>Messages from Our Guests ({entries.length})</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {entries.map((entry, i) => (
            <div key={entry.id} style={{ background: "white", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", transform: `rotate(${Math.random() * 4 - 2}deg)` }}>
              {entry.photo && <img src={entry.photo} alt={entry.name} style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px", marginBottom: "1rem" }} />}
              <p style={{ fontWeight: "600", marginBottom: "0.5rem", color: "#333" }}>{entry.name}</p>
              <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: "1.6" }}>"{entry.message}"</p>
            </div>
          ))}
        </div>
        {entries.length === 0 && <p style={{ textAlign: "center", color: "#999", fontSize: "1.1rem" }}>Be the first to sign the guest book! ✨</p>}
      </div>
    </div>
  );
}

import groomsman1Photo1 from './assets/img_9215.jpg';
import groomsman1Photo2 from './assets/img_0201.jpg';
import g2p1 from './assets/img_0796.jpg'
import w from './assets/W.png'
import bears from './assets/bears.png'
import j1 from './assets/img_5661.jpg'
import j2 from './assets/img_0600.jpg'
import T from './assets/UT.png'
import sc from './assets/SC.png'
import skins from './assets/skins.png'
import dukes from './assets/JMU.webp'
import UVA from './assets/UVA.png'
import nu from './assets/NU.png'
import wl from './assets/WL.png'
import vt from './assets/hokies.webp'
import brown from './assets/brown.png'
import h1 from './assets/img_0175.jpg'

function WeddingPartyTab() {
  const groomsmen = [
    {
    name: "Harry",
    relation: "Brother",
    photos: [groomsman1Photo1, groomsman1Photo2],
    role: "Best Man",
    maxBench: "135 lbs",
    fortyYard: "4.95s",
    handicap: "20.0",
    relationshipStatus: "Taken",
    currentCity: "Williamsburg, NY",
    college: "Northwestern University",
    collegeLogo: nu, // Replace with: import northwesternLogo from './assets/northwestern.png'
    footballTeam: "Cleveland Browns",
    footballLogo: brown, // Replace with: import brownsLogo from './assets/browns.png'
    comment: "The guy who somehow convinced his brother to let him be Best Man. Known for dad jokes and questionable dance moves."
  },
    {
    name: "Chuck",
    relation: "Brother",
    photos: [g2p1, null],
    role: "Groomsman",
    maxBench: "105 lbs",
    fortyYard: "5.2s",
    handicap: "20.0",
    relationshipStatus: "Taken",
    currentCity: "Chicago, IL",
    college: "University of Wisconsin",
    collegeLogo: w, // Replace with: import northwesternLogo from './assets/northwestern.png'
    footballTeam: "Chicago Bears",
    footballLogo: bears, // Replace with: import brownsLogo from './assets/browns.png'
    comment: "Known for his inconsistency off the tee and homer betting style, make sure your eyes are peeled for when Chuck hits the dance floor."
  },
    {
    name: "Jacko",
    relation: "Brother",
    photos: [j1, j2],
    role: "Groomsman",
    maxBench: "185 lbs",
    fortyYard: "5.8s",
    handicap: "20.0",
    relationshipStatus: "Single",
    currentCity: "Washington DC",
    college: "University of Virginia",
    collegeLogo: UVA, // Replace with: import northwesternLogo from './assets/northwestern.png'
    footballTeam: "The Hokies",
    footballLogo: vt, // Replace with: import brownsLogo from './assets/browns.png'
    comment: "The guy who somehow convinced his brother to let him be Best Man. Known for dad jokes and questionable dance moves."
  },
    {
    name: "Cole D",
    relation: "Dog",
    photos: [null, null],
    role: "Groomsman",
    maxBench: "265 lbs",
    fortyYard: "4.8s",
    handicap: "9.5",
    relationshipStatus: "Cuffed",
    currentCity: "Charleston, SC",
    college: "University of South Carolina",
    collegeLogo: sc, // Replace with: import northwesternLogo from './assets/northwestern.png'
    footballTeam: "The Washington Football Team",
    footballLogo: skins, // Replace with: import brownsLogo from './assets/browns.png'
    comment: "The guy who somehow convinced his brother to let him be Best Man. Known for dad jokes and questionable dance moves."
  },
      {
    name: "Henry",
    relation: "Groomsman",
    photos: [h1, null],
    role: "Groomsman",
    maxBench: "225 lbs",
    fortyYard: "5.3s",
    handicap: "11.5",
    relationshipStatus: "Taken",
    currentCity: "Atlanta, GA",
    college: "James Madison University University",
    collegeLogo: dukes, // Replace with: import northwesternLogo from './assets/northwestern.png'
    footballTeam: "The Washington Commanders",
    footballLogo: skins, // Replace with: import brownsLogo from './assets/browns.png'
    comment: "The guy who somehow convinced his brother to let him be Best Man. Known for dad jokes and questionable dance moves."
  },
      {
    name: "Oliver",
    relation: "Dog",
    photos: [null, null],
    role: "Groomsman",
    maxBench: "255 lbs",
    fortyYard: "4.6s",
    handicap: "22.0",
    relationshipStatus: "Taken",
    currentCity: "New York, NY",
    college: "Washington & Lee University",
    collegeLogo: wl, // Replace with: import northwesternLogo from './assets/northwestern.png'
    footballTeam: "Washington Redskins",
    footballLogo: skins, // Replace with: import brownsLogo from './assets/browns.png'
    comment: "The guy who somehow convinced his brother to let him be Best Man. Known for dad jokes and questionable dance moves."
  },
      {
    name: "Wyatt",
    relation: "Brother in law",
    photos: [null, null],
    role: "Groomsman",
    maxBench: "225 lbs",
    fortyYard: "4.8s",
    handicap: "16.0",
    relationshipStatus: "Single",
    currentCity: "Knoxville, TN",
    college: "University of Tennessee",
    collegeLogo: T, // Replace with: import northwesternLogo from './assets/northwestern.png'
    footballTeam: "The Vols",
    footballLogo: T, // Replace with: import brownsLogo from './assets/browns.png'
    comment: "The guy who somehow convinced his brother to let him be Best Man. Known for dad jokes and questionable dance moves."
  }
];
  
  const bridesmaids = [{
    name: "Sarah Johnson",
    relation: "Sister",
    photos: [null, null],
    role: "Maid of Honor",
    relationshipStatus: "Taken",
    currentCity: "Boston, MA",
    college: "Boston College",
    sorority: "Kappa Kappa Gamma",
    comment: "Can recite every line from The Office. Yes, all 9 seasons. It's both impressive and concerning."
  }];
  
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", fontSize: "clamp(2rem, 5vw, 2.5rem)", marginBottom: "1.5rem", fontFamily: "'Playfair Display', Georgia, serif", fontWeight: "400" }}>Our Wedding Party</h2>
      <p style={{ textAlign: "center", fontSize: "1.1rem", marginBottom: "4rem", color: "#666" }}>Meet the amazing people standing by our side!<br /><span style={{ fontSize: "0.95rem", fontStyle: "italic" }}>(Tap the cards to see more!)</span></p>
      <div style={{ marginBottom: "4rem" }}>
        <h3 style={{ fontSize: "1.8rem", marginBottom: "2rem", textAlign: "center", color: "#667eea" }}>Groom's Side 🤵</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {groomsmen.map((person, i) => <GroomCard key={i} person={person} />)}
        </div>
      </div>
      <div>
        <h3 style={{ fontSize: "1.8rem", marginBottom: "2rem", textAlign: "center", color: "#764ba2" }}>Bride's Side 👰</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {bridesmaids.map((person, i) => <BridesmaidCard key={i} person={person} />)}
        </div>
      </div>
    </div>
  );
}

const GroomCard = React.memo(({ person }) => {
  const [showBack, setShowBack] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const color = "#667eea";
  
  return (
    <div style={{ width: "100%", perspective: "1000px" }}>
      <AnimatePresence mode="wait">
        {!showBack ? (
          <motion.div
            key="front"
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: 90 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowBack(true)}
            style={{ background: "white", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", overflow: "hidden", borderTop: `6px solid ${color}`, cursor: "pointer" }}
          >
            <div style={{ display: "flex", flexDirection: window.innerWidth < 768 ? "column" : "row", minHeight: "400px" }}>
              <div style={{ width: window.innerWidth < 768 ? "100%" : "300px", minHeight: "400px", background: person.photos[photoIndex] ? `url(${person.photos[photoIndex]})` : `linear-gradient(135deg, ${color}, ${color}dd)`, backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5rem", flexShrink: 0 }}>
                {!person.photos[photoIndex] && "👤"}
              </div>
              <div style={{ flex: 1, padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <h3 style={{ fontSize: "1.8rem", marginBottom: "0.5rem", color: "#333" }}>{person.name}</h3>
                <p style={{ color, fontWeight: "600", fontSize: "1.1rem", marginBottom: "0.5rem" }}>{person.role}</p>
                <p style={{ fontSize: "1rem", color: "#666", marginBottom: "1.5rem" }}>{person.relation}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
                  <div><div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.25rem" }}>Status</div><div style={{ fontSize: "1rem", fontWeight: "600", color: "#333" }}>{person.relationshipStatus}</div></div>
                  <div><div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.25rem" }}>City</div><div style={{ fontSize: "1rem", fontWeight: "600", color: "#333" }}>{person.currentCity}</div></div>
                </div>
                <div style={{ marginTop: "1.5rem", padding: "0.75rem", background: "#f0f7ff", borderRadius: "8px", fontSize: "0.85rem", color: "#666", textAlign: "center" }}>🔄 Tap to see stats</div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: -90 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: 90 }}
            transition={{ duration: 0.3 }}
            style={{ background: "white", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", borderTop: `6px solid ${color}`, padding: "2rem" }}
          >
            <h3 style={{ fontSize: "1.8rem", marginBottom: "1.5rem", color: "#333", textAlign: "center" }}>{person.name}'s Stats 💪</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
              <div style={{ textAlign: "center", padding: "1rem", background: "#f9f9f9", borderRadius: "12px" }}><div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.5rem" }}>Max Bench</div><div style={{ fontSize: "1.5rem", fontWeight: "700", color }}>{person.maxBench}</div></div>
              <div style={{ textAlign: "center", padding: "1rem", background: "#f9f9f9", borderRadius: "12px" }}><div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.5rem" }}>40-Yard Dash</div><div style={{ fontSize: "1.5rem", fontWeight: "700", color }}>{person.fortyYard}</div></div>
              <div style={{ textAlign: "center", padding: "1rem", background: "#f9f9f9", borderRadius: "12px" }}><div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.5rem" }}>GHIN Index</div><div style={{ fontSize: "1.5rem", fontWeight: "700", color }}>{person.handicap}</div></div>
            </div>
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.75rem", textAlign: "center" }}>College</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", fontSize: "1.1rem", fontWeight: "600", color: "#333" }}>
                {person.collegeLogo ? <img src={person.collegeLogo} alt="College Logo" style={{ width: "40px", height: "40px", objectFit: "contain" }} /> : <span style={{ fontSize: "1.5rem" }}>🎓</span>}
                {person.college}
              </div>
            </div>
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.75rem", textAlign: "center" }}>Football Team</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", fontSize: "1.1rem", fontWeight: "600", color: "#333" }}>
                {person.footballLogo ? <img src={person.footballLogo} alt="Team Logo" style={{ width: "40px", height: "40px", objectFit: "contain" }} /> : <span style={{ fontSize: "1.5rem" }}>🏈</span>}
                {person.footballTeam}
              </div>
            </div>
            <div style={{ padding: "1.25rem", background: "#f0f7ff", borderRadius: "12px", fontSize: "0.95rem", color: "#555", fontStyle: "italic", lineHeight: "1.6" }}>💬 {person.comment}</div>
            <div onClick={() => { if (person.photos[0] && person.photos[1]) setPhotoIndex(p => (p + 1) % 2); setShowBack(false); }} style={{ marginTop: "1.5rem", padding: "0.75rem", background: "#f9f9f9", borderRadius: "8px", fontSize: "0.85rem", color: "#666", textAlign: "center", cursor: "pointer" }}>🔄 Tap to flip back</div>
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
  
  return (
    <div style={{ width: "100%", perspective: "1000px" }}>
      <AnimatePresence mode="wait">
        {!showBack ? (
          <motion.div
            key="front"
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: 90 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowBack(true)}
            style={{ background: "white", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", overflow: "hidden", borderTop: `6px solid ${color}`, cursor: "pointer" }}
          >
            <div style={{ display: "flex", flexDirection: window.innerWidth < 768 ? "column" : "row", minHeight: "400px" }}>
              <div style={{ width: window.innerWidth < 768 ? "100%" : "300px", minHeight: "400px", background: person.photos[photoIndex] ? `url(${person.photos[photoIndex]})` : `linear-gradient(135deg, ${color}, ${color}dd)`, backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5rem", flexShrink: 0 }}>
                {!person.photos[photoIndex] && "👤"}
              </div>
              <div style={{ flex: 1, padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <h3 style={{ fontSize: "1.8rem", marginBottom: "0.5rem", color: "#333" }}>{person.name}</h3>
                <p style={{ color, fontWeight: "600", fontSize: "1.1rem", marginBottom: "0.5rem" }}>{person.role}</p>
                <p style={{ fontSize: "1rem", color: "#666", marginBottom: "1.5rem" }}>{person.relation}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
                  <div><div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.25rem" }}>Status</div><div style={{ fontSize: "1rem", fontWeight: "600", color: "#333" }}>{person.relationshipStatus}</div></div>
                  <div><div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.25rem" }}>City</div><div style={{ fontSize: "1rem", fontWeight: "600", color: "#333" }}>{person.currentCity}</div></div>
                </div>
                <div style={{ marginTop: "1.5rem", padding: "0.75rem", background: "#fff0f7", borderRadius: "8px", fontSize: "0.85rem", color: "#666", textAlign: "center" }}>🔄 Tap to see more</div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: -90 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: 90 }}
            transition={{ duration: 0.3 }}
            style={{ background: "white", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", borderTop: `6px solid ${color}`, padding: "2rem" }}
          >
            <h3 style={{ fontSize: "1.8rem", marginBottom: "1.5rem", color: "#333", textAlign: "center" }}>More About {person.name} ✨</h3>
            <div style={{ marginBottom: "2rem" }}><div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.75rem", textAlign: "center" }}>College</div><div style={{ fontSize: "1.2rem", fontWeight: "600", color: "#333", textAlign: "center" }}>{person.college}</div></div>
            <div style={{ marginBottom: "2rem" }}><div style={{ fontSize: "0.85rem", color: "#999", marginBottom: "0.75rem", textAlign: "center" }}>Sorority</div><div style={{ fontSize: "1.2rem", fontWeight: "600", color, textAlign: "center" }}>{person.sorority}</div></div>
            <div style={{ padding: "1.25rem", background: "#fff0f7", borderRadius: "12px", fontSize: "0.95rem", color: "#555", fontStyle: "italic", lineHeight: "1.6" }}>💬 {person.comment}</div>
            <div onClick={() => { if (person.photos[0] && person.photos[1]) setPhotoIndex(p => (p + 1) % 2); setShowBack(false); }} style={{ marginTop: "1.5rem", padding: "0.75rem", background: "#f9f9f9", borderRadius: "8px", fontSize: "0.85rem", color: "#666", textAlign: "center", cursor: "pointer" }}>🔄 Tap to flip back</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});