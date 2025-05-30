"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText, useGSAP);

interface FadeAnimatedTextProps {
  text: string;
  className?: string;
}

export default function FadeAnimatedText({
  text,
  className = "",
}: FadeAnimatedTextProps) {
  const textRef = useRef<HTMLParagraphElement>(null);

  useGSAP(() => {
    if (!textRef.current) return;

    const split = new SplitText(textRef.current, { type: "chars" });
    const chars = split.chars;

    gsap.set(chars, { opacity: 0 });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

    tl.to(chars, {
      opacity: 1,
      duration: 0.05,
      stagger: 0.05,
      ease: "none",
    }).to(chars, {
      opacity: 0,
      duration: 0.05,
      stagger: 0.02,
      ease: "none",
      delay: 2,
    });

    return () => {
      split.revert();
      tl.kill();
    };
  }, [text]);

  return (
    <p ref={textRef} className={className}>
      {text}
    </p>
  );
}
