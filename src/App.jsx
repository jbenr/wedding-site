import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const [tab, setTab] = useState("main");
  const [buttonCount, setButtonCount] = useState(0);

  // Load button count from localStorage on mount
  useEffect(() => {
    const savedCount = localStorage.getItem("weddingButtonCount");
    if (savedCount) {
      setButtonCount(parseInt(savedCount, 10));
    }
  }, []);

  // Save button count to localStorage whenever it changes
  const handleButtonClick = () => {
    const newCount = buttonCount + 1;
    setButtonCount(newCount);
    localStorage.setItem("weddingButtonCount", newCount.toString());
  };

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setTab(id)}
      style={{
        flex: 1,
        padding: "0.875rem 1rem",
        border: "none",
        background: tab === id ? "#111" : "transparent",
        color: tab === id ? "white" : "#333",
        fontSize: "0.95rem",
        fontWeight: tab === id ? "600" : "500",
        borderRadius: "12px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        position: "relative",
      }}
    >
      {label}
      {tab === id && (
        <motion.div
          layoutId="activeTab"
          style={{
            position: "absolute",
            inset: 0,
            background: "#111",
            borderRadius: "12px",
            zIndex: -1,
          }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  );

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", lineHeight: 1.6 }}>
      {/* Hero Section */}
      <section
        style={{
          minHeight: "100vh",
          backgroundImage:
            "url(https://images.unsplash.com/photo-1519741497674-611481863552?w=1600)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            padding: "2rem",
            maxWidth: "900px",
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h1
              style={{
                fontSize: "clamp(3rem, 10vw, 5rem)",
                marginBottom: "1rem",
                fontWeight: "300",
                letterSpacing: "0.05em",
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              Ben & Emily
            </h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            style={{
              fontSize: "clamp(1.1rem, 3vw, 1.5rem)",
              marginBottom: "2rem",
              fontWeight: "300",
              letterSpacing: "0.1em",
            }}
          >
            October 24, 2026
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
              fontWeight: "300",
            }}
          >
            Charlottesville, Virginia
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            style={{ marginTop: "3rem" }}
          >
            <button
              onClick={() => {
                document.getElementById("content").scrollIntoView({ 
                  behavior: "smooth" 
                });
              }}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "white",
                padding: "1rem 2.5rem",
                fontSize: "1rem",
                borderRadius: "50px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontWeight: "500",
                letterSpacing: "0.05em",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.3)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.2)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Explore ↓
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Tab Navigation */}
      <div
        id="content"
        style={{
          position: "sticky",
          top: 0,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #e5e5e5",
          zIndex: 100,
          padding: "1rem",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            display: "flex",
            gap: "0.5rem",
            background: "#f8f8f8",
            padding: "0.5rem",
            borderRadius: "16px",
          }}
        >
          <TabButton id="main" label="Main" />
          <TabButton id="rsvp" label="RSVP" />
          <TabButton id="info" label="Info" />
        </div>
      </div>

      {/* Tab Content */}
      <section style={{ padding: "3rem 1rem", minHeight: "70vh" }}>
        <AnimatePresence mode="wait">
          {tab === "main" && (
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{ maxWidth: "800px", margin: "0 auto" }}
            >
              <h2
                style={{
                  textAlign: "center",
                  fontSize: "clamp(2rem, 5vw, 2.5rem)",
                  marginBottom: "2rem",
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: "400",
                }}
              >
                Our Story
              </h2>

              {/* Photo Gallery */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "1rem",
                  marginBottom: "3rem",
                }}
              >
                {[
                  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800",
                  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800",
                  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800",
                ].map((img, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    style={{
                      borderRadius: "12px",
                      overflow: "hidden",
                      aspectRatio: "4/5",
                    }}
                  >
                    <img
                      src={img}
                      alt={`Memory ${i + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </motion.div>
                ))}
              </div>

              <div
                style={{
                  background: "#f9f9f9",
                  padding: "2.5rem",
                  borderRadius: "16px",
                  marginBottom: "3rem",
                }}
              >
                <p
                  style={{
                    fontSize: "1.15rem",
                    lineHeight: "1.8",
                    color: "#333",
                    textAlign: "center",
                    marginBottom: "1.5rem",
                  }}
                >
                  What started as a chance meeting turned into countless adventures,
                  inside jokes, and a love that grows deeper every day. We've laughed
                  through the chaos, supported each other through challenges, and built
                  a life filled with joy.
                </p>
                <p
                  style={{
                    fontSize: "1.15rem",
                    lineHeight: "1.8",
                    color: "#333",
                    textAlign: "center",
                  }}
                >
                  Now, we're ready to celebrate this next chapter with the people who
                  mean the most to us. We can't wait to share this special day with you!
                </p>
              </div>

              {/* Fun Button Counter */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "16px",
                  color: "white",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.5rem",
                    marginBottom: "1rem",
                    fontWeight: "500",
                  }}
                >
                  How excited are you? 🎉
                </h3>
                <p style={{ marginBottom: "1.5rem", opacity: 0.9 }}>
                  Click the button to show your excitement!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleButtonClick}
                  style={{
                    background: "white",
                    color: "#667eea",
                    border: "none",
                    padding: "1.25rem 3rem",
                    fontSize: "1.25rem",
                    fontWeight: "600",
                    borderRadius: "50px",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                    marginBottom: "1.5rem",
                  }}
                >
                  Can't Wait! 💕
                </motion.button>
                <motion.div
                  key={buttonCount}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "500",
                  }}
                >
                  Total clicks: {buttonCount.toLocaleString()}
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {tab === "rsvp" && (
            <motion.div
              key="rsvp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{ maxWidth: "700px", margin: "0 auto" }}
            >
              <h2
                style={{
                  textAlign: "center",
                  fontSize: "clamp(2rem, 5vw, 2.5rem)",
                  marginBottom: "1.5rem",
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: "400",
                }}
              >
                RSVP
              </h2>
              <p
                style={{
                  textAlign: "center",
                  fontSize: "1.1rem",
                  marginBottom: "2.5rem",
                  color: "#666",
                }}
              >
                Please let us know if you can join us by filling out the form below
              </p>

              {/* Embedded Google Form */}
              <div
                style={{
                  background: "#f9f9f9",
                  padding: "2rem",
                  borderRadius: "16px",
                  textAlign: "center",
                }}
              >
                <p style={{ marginBottom: "1.5rem", fontSize: "1.05rem" }}>
                  Click below to open our RSVP form:
                </p>
                <a
                  href="YOUR_GOOGLE_FORM_URL_HERE"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    background: "#111",
                    color: "white",
                    padding: "1.25rem 3rem",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    borderRadius: "50px",
                    textDecoration: "none",
                    transition: "all 0.3s ease",
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
                <p
                  style={{
                    marginTop: "1.5rem",
                    fontSize: "0.95rem",
                    color: "#888",
                  }}
                >
                  Please respond by September 1, 2026
                </p>
              </div>

              {/* Alternative: Embedded iframe - uncomment to use */}
              {/* <div
                style={{
                  position: "relative",
                  paddingBottom: "100%",
                  height: 0,
                  overflow: "hidden",
                  borderRadius: "16px",
                  marginTop: "2rem",
                }}
              >
                <iframe
                  src="YOUR_GOOGLE_FORM_EMBED_URL_HERE"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                  title="RSVP Form"
                >
                  Loading…
                </iframe>
              </div> */}
            </motion.div>
          )}

          {tab === "info" && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{ maxWidth: "800px", margin: "0 auto" }}
            >
              <h2
                style={{
                  textAlign: "center",
                  fontSize: "clamp(2rem, 5vw, 2.5rem)",
                  marginBottom: "3rem",
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: "400",
                }}
              >
                Wedding Information
              </h2>

              {/* Schedule */}
              <div
                style={{
                  background: "#f9f9f9",
                  padding: "2rem",
                  borderRadius: "16px",
                  marginBottom: "2rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.5rem",
                    marginBottom: "1.5rem",
                    textAlign: "center",
                  }}
                >
                  Schedule
                </h3>
                <div style={{ maxWidth: "500px", margin: "0 auto" }}>
                  {[
                    { time: "4:00 PM", event: "Ceremony" },
                    { time: "5:00 PM", event: "Cocktail Hour" },
                    { time: "6:00 PM", event: "Reception & Dinner" },
                    { time: "10:00 PM", event: "Send-off" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "1rem 0",
                        borderBottom:
                          i < 3 ? "1px solid #e0e0e0" : "none",
                      }}
                    >
                      <span style={{ fontWeight: "600", color: "#667eea" }}>
                        {item.time}
                      </span>
                      <span>{item.event}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Venue */}
              <div
                style={{
                  background: "#f9f9f9",
                  padding: "2rem",
                  borderRadius: "16px",
                  marginBottom: "2rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.5rem",
                    marginBottom: "1rem",
                    textAlign: "center",
                  }}
                >
                  Venue
                </h3>
                <p style={{ textAlign: "center", fontSize: "1.1rem" }}>
                  <strong>The Garden Estate</strong>
                  <br />
                  123 Vineyard Lane
                  <br />
                  Charlottesville, VA 22902
                </p>
              </div>

              {/* Travel & Accommodations */}
              <div
                style={{
                  background: "#f9f9f9",
                  padding: "2rem",
                  borderRadius: "16px",
                  marginBottom: "2rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.5rem",
                    marginBottom: "1.5rem",
                    textAlign: "center",
                  }}
                >
                  Travel & Stay
                </h3>
                <div style={{ lineHeight: "1.8" }}>
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
                    Charlottesville-Albemarle Airport (CHO) is 15 minutes from
                    downtown. Rideshare and rental cars are readily available.
                  </p>
                </div>
              </div>

              {/* Dress Code */}
              <div
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  padding: "2rem",
                  borderRadius: "16px",
                  color: "white",
                  textAlign: "center",
                }}
              >
                <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
                  Dress Code
                </h3>
                <p style={{ fontSize: "1.1rem" }}>
                  Cocktail Attire
                  <br />
                  <span style={{ fontSize: "0.95rem", opacity: 0.9 }}>
                    (The ceremony will be outdoors on grass)
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "3rem 1.5rem",
          background: "#111",
          color: "#eee",
        }}
      >
        <p style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
          We can't wait to celebrate with you
        </p>
        <p style={{ fontSize: "2rem" }}>🤍</p>
        <p style={{ fontSize: "0.9rem", opacity: 0.7, marginTop: "1.5rem" }}>
          Ben & Emily • October 24, 2026
        </p>
      </footer>
    </div>
  );
}