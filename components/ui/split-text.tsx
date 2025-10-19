"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import { cn } from "@/lib/utils"

interface SplitTextProps {
  text: string
  className?: string
  delay?: number
  duration?: number
  ease?: string
  splitType?: "chars" | "words" | "lines"
  from?: gsap.TweenVars
  to?: gsap.TweenVars
  threshold?: number
  rootMargin?: string
  textAlign?: "left" | "center" | "right"
  onLetterAnimationComplete?: () => void
}

export default function SplitText({
  text,
  className,
  delay = 0,
  duration = 0.6,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "center",
  onLetterAnimationComplete,
}: SplitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [threshold, rootMargin])

  useGSAP(
    () => {
      if (!isVisible || !containerRef.current) return

      const elements = containerRef.current.querySelectorAll(".split-char")

      gsap.fromTo(
        elements,
        from,
        {
          ...to,
          duration,
          ease,
          stagger: delay / 1000,
          onComplete: () => {
            if (onLetterAnimationComplete) {
              onLetterAnimationComplete()
            }
          },
        }
      )
    },
    { scope: containerRef, dependencies: [isVisible] }
  )

  const splitText = () => {
    if (splitType === "chars") {
      return text.split("").map((char, index) => (
        <span
          key={`${char}-${index}`}
          className="split-char inline-block"
          style={{ whiteSpace: char === " " ? "pre" : "normal" }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))
    } else if (splitType === "words") {
      return text.split(" ").map((word, index) => (
        <span key={`${word}-${index}`} className="split-char inline-block mr-1">
          {word}
        </span>
      ))
    } else {
      return text.split("\n").map((line, index) => (
        <span key={`${line}-${index}`} className="split-char block">
          {line}
        </span>
      ))
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn("overflow-hidden", className)}
      style={{ textAlign }}
    >
      {splitText()}
    </div>
  )
}
