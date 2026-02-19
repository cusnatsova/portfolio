'use client';

import { useEffect, useRef, useState } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  opacity: number;
  id: number;
}

interface MousePosition {
  x: number;
  y: number;
}

export default function CursorSpotlight() {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isOverInteractive, setIsOverInteractive] = useState(false);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  const idleTimeoutRef = useRef<NodeJS.Timeout>();
  const animationFrameRef = useRef<number>();
  const lastMousePositionRef = useRef<MousePosition>({ x: 0, y: 0 });
  const mouseVelocityRef = useRef({ x: 0, y: 0 });
  const trailIdRef = useRef(0);

  // Check for touch device and reduced motion preference
  useEffect(() => {
    const checkDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
      setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };
    
    checkDevice();
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', checkDevice);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(checkDevice);
    }
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', checkDevice);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(checkDevice);
      }
    };
  }, []);

  // Handle mouse movement with performance optimization
  useEffect(() => {
    if (isTouchDevice || prefersReducedMotion) return;

    let lastUpdateTime = 0;
    const updateInterval = 16; // ~60fps

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastUpdateTime < updateInterval) return; // Throttle to 60fps
      
      lastUpdateTime = now;
      const newPosition = { x: e.clientX, y: e.clientY };
      
      // Calculate velocity for trail length
      const deltaX = newPosition.x - lastMousePositionRef.current.x;
      const deltaY = newPosition.y - lastMousePositionRef.current.y;
      const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      mouseVelocityRef.current = { x: deltaX, y: deltaY };
      lastMousePositionRef.current = newPosition;
      
      // Update mouse position immediately
      setMousePosition(newPosition);
      setIsVisible(true);
      
      // Add to trail based on velocity
      if (velocity > 2) {
        const newTrailPoint: TrailPoint = {
          x: newPosition.x,
          y: newPosition.y,
          opacity: 0.6,
          id: trailIdRef.current++
        };
        
        setTrail(prevTrail => {
          const updatedTrail = [...prevTrail, newTrailPoint];
          // Limit trail length based on velocity
          const maxLength = Math.min(Math.floor(velocity * 2), 8);
          return updatedTrail.slice(-maxLength);
        });
      }
      
      // Reset idle timeout
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      
      idleTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        // Clear trail when idle
        setTrail([]);
      }, 300); // 300ms idle timeout
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.matches('button, a, [role="button"], input, textarea, select') ||
        target.closest('button, a, [role="button"], input, textarea, select')
      ) {
        setIsOverInteractive(true);
      } else {
        setIsOverInteractive(false);
      }
    };

    const handleMouseLeave = () => {
      setIsOverInteractive(false);
    };

    // Continuous trail fade animation
    const updateTrail = () => {
      setTrail(prevTrail => {
        const updatedTrail = prevTrail
          .map(point => ({ ...point, opacity: point.opacity * 0.85 }))
          .filter(point => point.opacity > 0.01);
        
        // If no trail points and mouse is idle, ensure trail is empty
        if (updatedTrail.length === 0 && !isVisible) {
          return [];
        }
        
        return updatedTrail;
      });
      
      animationFrameRef.current = requestAnimationFrame(updateTrail);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);
    
    // Start trail animation loop
    animationFrameRef.current = requestAnimationFrame(updateTrail);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
      
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isTouchDevice, prefersReducedMotion, isVisible]);

  // Don't render on touch devices or with reduced motion preference
  if (isTouchDevice || prefersReducedMotion) {
    return null;
  }

  const spotlightIntensity = isOverInteractive ? 1.0 : 0.7;
  const spotlightScale = isVisible ? 1 : 0.8;
  const spotlightOpacity = isVisible ? spotlightIntensity : 0;

  return (
    <>
      {/* Spotlight */}
      <div
        className="pointer-events-none fixed z-50"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
          transform: `translate3d(-50%, -50%, 0) scale(${spotlightScale})`,
          opacity: spotlightOpacity,
          transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
        }}
      >
        <div
          className="relative"
          style={{
            width: '500px',
            height: '500px',
            background: `radial-gradient(
              circle at center,
              rgba(139, 92, 246, ${spotlightIntensity * 0.25}) 0%,
              rgba(139, 92, 246, ${spotlightIntensity * 0.15}) 20%,
              rgba(139, 92, 246, ${spotlightIntensity * 0.08}) 40%,
              rgba(139, 92, 246, ${spotlightIntensity * 0.04}) 60%,
              transparent 80%
            )`,
            borderRadius: '50%',
            filter: 'blur(1px)',
          }}
        />
      </div>

      {/* Cursor Trail */}
      {trail.map((point, index) => (
        <div
          key={point.id}
          className="pointer-events-none fixed z-40"
          style={{
            left: point.x,
            top: point.y,
            transform: `translate3d(-50%, -50%, 0) scale(${0.8 + (index / trail.length) * 0.4})`,
            opacity: point.opacity * 0.6,
            transition: 'opacity 0.15s ease-out, transform 0.1s ease-out',
          }}
        >
          <div
            className="relative"
            style={{
              width: `${20 + (index / trail.length) * 10}px`,
              height: `${20 + (index / trail.length) * 10}px`,
              background: `radial-gradient(
                circle at center,
                rgba(139, 92, 246, ${point.opacity * 0.5}) 0%,
                rgba(139, 92, 246, ${point.opacity * 0.3}) 40%,
                transparent 70%
              )`,
              borderRadius: '50%',
              filter: 'blur(1px)',
            }}
          />
        </div>
      ))}

      {/* Custom cursor styles */}
      <style jsx>{`
        * {
          cursor: none !important;
        }
        
        input, textarea, select, button, a {
          cursor: none !important;
        }
      `}</style>
    </>
  );
}
