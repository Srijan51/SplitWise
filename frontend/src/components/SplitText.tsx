"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  splitType?: "chars" | "words";
  textAlign?: "left" | "center" | "right";
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  onLetterAnimationComplete?: () => void;
}

const SplitText = ({
  text,
  className = "",
  delay = 30,
  duration = 0.4,
  splitType = "chars",
  textAlign = "center",
  tag: _tag = "p",
  onLetterAnimationComplete,
}: SplitTextProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const units =
    splitType === "words"
      ? text.split(" ").map((word, i) => ({
          text: word,
          key: `word-${i}`,
          addSpace: i < text.split(" ").length - 1,
        }))
      : text.split("").map((char, i) => ({
          text: char,
          key: `char-${i}`,
          addSpace: false,
        }));

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden inline-block whitespace-normal ${className}`}
      style={{ textAlign }}
    >
      {units.map((unit, i) => (
        <span key={unit.key} className="inline-block">
          <motion.span
            className="inline-block"
            initial={{ opacity: 0, y: 20 }}
            animate={
              isVisible
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 20 }
            }
            transition={{
              duration,
              delay: (delay / 1000) * i,
              ease: [0.25, 0.4, 0.25, 1],
            }}
            onAnimationComplete={() => {
              if (i === units.length - 1) {
                onLetterAnimationComplete?.();
              }
            }}
          >
            {unit.text === " " ? "\u00A0" : unit.text}
          </motion.span>
          {unit.addSpace && <span>&nbsp;</span>}
        </span>
      ))}
    </div>
  );
};

export default SplitText;
