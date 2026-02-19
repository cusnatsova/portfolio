'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedX: number;
  speedY: number;
  pulseSpeed: number;
  pulsePhase: number;
  color: string;
}

const SparkleParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);

  // Violet color palette for particles
  const particleColors: readonly string[] = [
    'rgba(139, 92, 246, ',    // violet-500
    'rgba(124, 58, 237, ',    // violet-600
    'rgba(167, 139, 250, ',   // violet-400
    'rgba(217, 70, 239, ',    // fuchsia-500
    'rgba(196, 181, 253, ',   // violet-300
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  const initializeParticles = useCallback((canvas: HTMLCanvasElement) => {
    const particleCount = Math.min(40, Math.floor((canvas.width * canvas.height) / 30000));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        id: i,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.2,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        pulseSpeed: Math.random() * 0.015 + 0.008,
        pulsePhase: Math.random() * Math.PI * 2,
        color: particleColors[Math.floor(Math.random() * particleColors.length)]
      });
    }

    particlesRef.current = particles;
  }, [particleColors]);

  useEffect(() => {
    if (!isClient) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeParticles(canvas);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse move handler for subtle interaction
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isClient, initializeParticles]);

  useEffect(() => {
    if (!isClient) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    let isActive = true;
    let animationId: number | undefined;

    const animate = () => {
      if (!isActive) return;
      
      try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particlesRef.current.forEach((particle) => {
          // Update position
          particle.x += particle.speedX;
          particle.y += particle.speedY;

          // Wrap around edges
          if (particle.x < -10) particle.x = canvas.width + 10;
          if (particle.x > canvas.width + 10) particle.x = -10;
          if (particle.y < -10) particle.y = canvas.height + 10;
          if (particle.y > canvas.height + 10) particle.y = -10;

          // Subtle mouse interaction (reduced for performance)
          const dx = mouseRef.current.x - particle.x;
          const dy = mouseRef.current.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const force = (100 - distance) / 100;
            particle.x -= (dx / distance) * force * 0.3;
            particle.y -= (dy / distance) * force * 0.3;
          }

          // Pulsing opacity
          const pulsedOpacity = particle.opacity * (0.6 + 0.4 * Math.sin(time * particle.pulseSpeed + particle.pulsePhase));

          // Draw particle with glow
          ctx.save();
          
          // Outer glow (simplified for performance)
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 3
          );
          gradient.addColorStop(0, particle.color + pulsedOpacity + ')');
          gradient.addColorStop(0.4, particle.color + (pulsedOpacity * 0.2) + ')');
          gradient.addColorStop(1, particle.color + '0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
          ctx.fill();

          // Inner bright core
          ctx.fillStyle = particle.color + Math.min(1, pulsedOpacity * 1.5) + ')';
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        });

        time += 1;
        
        // Continue animation loop
        if (isActive) {
          animationId = requestAnimationFrame(animate);
        }
      } catch (error) {
        console.error('Animation error:', error);
        // Restart animation after error
        setTimeout(() => {
          if (isActive) {
            animate();
          }
        }, 1000);
      }
    };

    // Start animation
    animate();

    // Handle visibility change to pause/resume when tab is not visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActive = false;
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      } else {
        isActive = true;
        animate();
      }
    };

    // Handle page unload
    const handleBeforeUnload = () => {
      isActive = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };

    // Fallback restart mechanism
    const restartInterval = setInterval(() => {
      if (isActive && !animationId) {
        console.log('Restarting particle animation');
        animate();
      }
    }, 5000);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      isActive = false;
      clearInterval(restartInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isClient]);

  if (!isClient) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default SparkleParticles;
