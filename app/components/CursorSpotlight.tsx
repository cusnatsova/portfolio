'use client';

import { useState, useEffect, useRef } from 'react';

type TrailPoint = { x: number; y: number; opacity: number; id: number };

export default function CursorSpotlight() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const lastTrailRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersPointer = window.matchMedia('(pointer: fine)').matches;
    if (!prefersPointer) return;

    const FADE_SPEED = 0.0008; // Slower fade for longer visible trail
    const TRAIL_INTERVAL = 40; // More frequent trail drops for smoother tail
    const MAX_TRAIL = 45; // More trail points for longer tail

    let rafId: number;
    const loop = () => {
      setPosition({ x: mouseRef.current.x, y: mouseRef.current.y });

      setTrail((prev) => {
        const now = Date.now();
        const updated = prev
          .map((p) => ({ ...p, opacity: p.opacity - FADE_SPEED }))
          .filter((p) => p.opacity > 0.05);

        if (now - lastTrailRef.current > TRAIL_INTERVAL) {
          lastTrailRef.current = now;
          const next = [
            { x: mouseRef.current.x, y: mouseRef.current.y, opacity: 1, id: now },
            ...updated,
          ];
          return next.slice(0, MAX_TRAIL);
        }
        return updated;
      });

      rafId = requestAnimationFrame(loop);
    };

    const handleMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      setIsVisible(true);
    };
    const handleLeave = () => setIsVisible(false);

    rafId = requestAnimationFrame(loop);
    window.addEventListener('mousemove', handleMove);
    document.documentElement.addEventListener('mouseleave', handleLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMove);
      document.documentElement.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] transition-opacity duration-300 md:block hidden"
      style={{ opacity: isVisible ? 1 : 0 }}
      aria-hidden
    >
      {/* Trail - smooth fading tail that follows cursor */}
      {trail.map((point, index) => {
        // Size and intensity decrease along the trail
        const sizeMultiplier = 1 - (index / trail.length) * 0.5;
        const size = 500 * sizeMultiplier;
        
        return (
          <div
            key={point.id}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(${size}px ${size * 0.7}px at ${point.x}px ${point.y}px, rgba(139, 92, 246, ${0.15 * point.opacity}) 0%, rgba(124, 58, 237, ${0.08 * point.opacity}) 35%, transparent 65%)`,
              transition: 'opacity 0.1s ease-out',
            }}
          />
        );
      })}
      
      {/* Main spotlight - brightest point at cursor */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(650px 450px at ${position.x}px ${position.y}px, rgba(139, 92, 246, 0.18) 0%, rgba(124, 58, 237, 0.09) 25%, transparent 60%)`,
        }}
      />
    </div>
  );
}