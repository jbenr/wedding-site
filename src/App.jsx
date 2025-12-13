import { motion } from "framer-motion";

export default function App() {
  return (
    <div style={{ fontFamily: "serif" }}>
      {/* Hero */}
      <section
        style={{
          height: "80vh",
          backgroundImage:
            "url(https://images.unsplash.com/photo-1523430410476-0185cb1f6ff9)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          color: "white",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "1rem",
          }}
        >
          <h1 style={{ fontSize: "3rem" }}>James & Partner</h1>
          <p>September 21, 2026 • Boston, MA</p>
        </motion.div>
      </section>

      {/* Story */}
      <section style={{ padding: "4rem 1rem", textAlign: "center" }}>
        <h2>Our Story</h2>
        <p style={{ maxWidth: 600, margin: "1rem auto" }}>
          We met, we laughed, and somehow decided forever sounded like a great
          idea.
        </p>
      </section>
    </div>
  );
}
