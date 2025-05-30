"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText, useGSAP);

interface GradientAnimatedTextProps {
  text: string;
  className?: string;
}

export default function GradientAnimatedText({
  text,
  className = "",
}: GradientAnimatedTextProps) {
  const textRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    if (!textRef.current) return;

    const split = new SplitText(textRef.current, { type: "chars" });
    const chars = split.chars;

    gsap.set(chars, {
      backgroundImage: "linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4)",
      backgroundSize: "200% 100%",
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      color: "transparent",
      backgroundPosition: "200% 0%",
    });

    const tl = gsap.timeline({ repeat: -1 });

    tl.to(chars, {
      backgroundPosition: "-200% 0%",
      duration: 2,
      stagger: 0.1,
      ease: "none",
    });

    return () => {
      split.revert();
      tl.kill();
    };
  }, [text]);

  return (
    <span ref={textRef} className={`inline-block ${className}`}>
      {text}
    </span>
  );
}
