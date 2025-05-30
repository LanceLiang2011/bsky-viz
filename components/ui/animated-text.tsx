"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText, useGSAP);

interface AnimatedTextProps {
  text: string;
  className?: string;
}

export default function AnimatedText({
  text,
  className = "",
}: AnimatedTextProps) {
  const textRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    if (!textRef.current) return;

    const split = new SplitText(textRef.current, { type: "chars" });
    const chars = split.chars;

    gsap.set(chars, { opacity: 0, y: 20 });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });

    tl.to(chars, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.05,
      ease: "back.out(1.7)",
    }).to(chars, {
      opacity: 0,
      y: -10,
      duration: 0.4,
      stagger: 0.03,
      ease: "power2.in",
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
