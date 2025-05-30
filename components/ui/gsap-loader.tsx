"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

gsap.registerPlugin(useGSAP);

interface GSAPLoaderProps {
  className?: string;
}

export default function GSAPLoader({ className = "" }: GSAPLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    const dots = containerRef.current.querySelectorAll(".dot");

    // Create a timeline that repeats infinitely
    const tl = gsap.timeline({ repeat: -1 });

    // Animate each dot with a stagger
    tl.to(dots, {
      scale: 1.5,
      backgroundColor: "#8b5cf6",
      duration: 0.6,
      stagger: 0.15,
      ease: "power2.out",
    }).to(dots, {
      scale: 1,
      backgroundColor: "#e5e7eb",
      duration: 0.6,
      stagger: 0.15,
      ease: "power2.in",
    });

    // Add a pulsing glow effect
    gsap.to(containerRef.current, {
      filter: "drop-shadow(0 0 8px rgba(139, 92, 246, 0.3))",
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center gap-1 ${className}`}
    >
      <div className="dot w-2 h-2 bg-gray-300 rounded-full"></div>
      <div className="dot w-2 h-2 bg-gray-300 rounded-full"></div>
      <div className="dot w-2 h-2 bg-gray-300 rounded-full"></div>
      <div className="dot w-2 h-2 bg-gray-300 rounded-full"></div>
      <div className="dot w-2 h-2 bg-gray-300 rounded-full"></div>
    </div>
  );
}
