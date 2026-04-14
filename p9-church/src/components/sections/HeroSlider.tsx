"use client";
// [S01 Hero] full-bleed 100vh, blur+dark overlay, 3 CTA buttons, social sidebar

import { useState, useEffect } from "react";
import Image from "next/image";

const ctaButtons = [
  { label: "온라인 예배", href: "#" },
  { label: "새가족 등록", href: "#" },
  { label: "온라인 헌금", href: "#" },
];

export default function HeroSlider() {
  const [slide, setSlide] = useState(0);
  const images = ["/hyesung/hero/main-hero.jpg"];

  useEffect(() => {
    const t = setInterval(() => setSlide((p) => (p + 1) % images.length), 5000);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <section style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}>
      {/* Background image with blur */}
      <div style={{ position: "absolute", inset: 0, filter: "blur(2px)" }}>
        <Image src={images[slide]} alt="밀알교회" fill style={{ objectFit: "cover" }} priority />
      </div>
      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />

      {/* Header - transparent */}
      <header style={{
        position: "absolute", top: 0, left: 0, right: 0,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 40px", zIndex: 10,
      }}>
        <Image src="/hyesung/logos/milal-logo.png" alt="밀알교회" width={112} height={35} style={{ objectFit: "contain" }} />
      </header>

      {/* Carousel arrows */}
      <button onClick={() => setSlide((p) => (p - 1 + images.length) % images.length)}
        style={{ position: "absolute", left: "60px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--color-text-inverse)", fontSize: "60px", cursor: "pointer", zIndex: 5, fontWeight: 300, opacity: 0.7 }}
        aria-label="이전">‹</button>
      <button onClick={() => setSlide((p) => (p + 1) % images.length)}
        style={{ position: "absolute", right: "60px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--color-text-inverse)", fontSize: "60px", cursor: "pointer", zIndex: 5, fontWeight: 300, opacity: 0.7 }}
        aria-label="다음">›</button>

      {/* CTA buttons - 하단 중앙, 붙어있는 흰 테두리 버튼 */}
      <div style={{ position: "absolute", bottom: "100px", left: "50%", transform: "translateX(-50%)", display: "flex", zIndex: 5 }}>
        {ctaButtons.map((btn, i) => (
          <a key={i} href={btn.href} style={{
            color: "var(--color-text-inverse)", border: "1px solid rgba(255,255,255,0.6)",
            background: "transparent", padding: "16px 44px", fontSize: "var(--font-size-button)",
            fontFamily: "var(--font-family-body)", fontWeight: "var(--font-weight-regular)",
            textDecoration: "none", borderRadius: "0px", whiteSpace: "nowrap",
          }}>{btn.label}</a>
        ))}
      </div>

      {/* Social sidebar - fixed right */}
      <div style={{
        position: "fixed", right: "16px", top: "50%", transform: "translateY(-50%)",
        display: "flex", flexDirection: "column", gap: "10px", zIndex: 50,
      }}>
        {["▶", "💬", "📷"].map((icon, i) => (
          <a key={i} href="#" style={{
            width: "32px", height: "32px", borderRadius: "50%", background: "rgba(0,0,0,0.75)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", textDecoration: "none", fontSize: "13px",
          }}>{icon}</a>
        ))}
      </div>
    </section>
  );
}
