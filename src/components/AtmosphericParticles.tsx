import React, { useEffect, useRef } from 'react';
import { WorldId } from '../types';

interface AtmosphericParticlesProps {
  worldId: WorldId;
  density?: number;
}

export const AtmosphericParticles: React.FC<AtmosphericParticlesProps> = ({
  worldId,
  density = 50,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle state representation
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      rotation: number;
      rotSpeed: number;
      color: string;
      petalLength?: number;
      petalWidth?: number;
    }

    const particles: Particle[] = [];
    const count = Math.min(density, window.innerWidth < 640 ? 35 : 60);

    // Initializer per world
    for (let i = 0; i < count; i++) {
      let pColor = 'rgba(255, 255, 255, 0.4)';
      let speedX = (Math.random() - 0.5) * 0.4;
      let speedY = 0.5 + Math.random() * 0.8;
      let size = 2 + Math.random() * 3;

      if (worldId === 'love') {
        // Rose petals & firefly sparks
        const isPetal = i % 2 === 0;
        pColor = isPetal ? 'rgba(244, 63, 94, 0.65)' : 'rgba(253, 164, 175, 0.7)';
        speedX = (Math.random() - 0.5) * 0.8;
        speedY = 0.6 + Math.random() * 1.0;
        size = isPetal ? 6 + Math.random() * 6 : 2 + Math.random() * 3;
      } else if (worldId === 'sad') {
        // Rain droplets
        pColor = 'rgba(186, 230, 253, 0.45)';
        speedX = -0.3;
        speedY = 6 + Math.random() * 8; // fast rain fall
        size = 1.2;
      } else if (worldId === 'breakup') {
        // Glass shards drifting
        pColor = 'rgba(233, 213, 255, 0.4)';
        speedX = (Math.random() - 0.5) * 0.6;
        speedY = (Math.random() - 0.5) * 0.4;
        size = 3 + Math.random() * 5;
      } else if (worldId === 'life') {
        // Celestial stars
        pColor = 'rgba(224, 231, 255, 0.6)';
        speedX = (Math.random() - 0.5) * 0.2;
        speedY = (Math.random() - 0.5) * 0.2;
        size = 1 + Math.random() * 2.5;
      } else if (worldId === 'motivation') {
        // Rising amber sparks
        pColor = 'rgba(251, 191, 36, 0.7)';
        speedX = (Math.random() - 0.5) * 0.5;
        speedY = -(1.2 + Math.random() * 1.5); // Rising upwards!
        size = 2 + Math.random() * 3.5;
      } else if (worldId === 'friendship') {
        pColor = 'rgba(52, 211, 153, 0.6)';
        speedX = (Math.random() - 0.5) * 0.6;
        speedY = (Math.random() - 0.5) * 0.6;
        size = 3 + Math.random() * 3;
      } else {
        // dreams & loneliness
        pColor = 'rgba(216, 180, 254, 0.5)';
        speedX = (Math.random() - 0.5) * 0.3;
        speedY = (Math.random() - 0.5) * 0.3;
        size = 2 + Math.random() * 3;
      }

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        speedX,
        speedY,
        opacity: 0.3 + Math.random() * 0.6,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        color: pColor,
        petalLength: 8 + Math.random() * 8,
        petalWidth: 4 + Math.random() * 4,
      });
    }

    // Animation loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        // Wrap around boundaries
        if (worldId === 'motivation') {
          // rising up
          if (p.y < -20) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        } else if (worldId === 'sad') {
          // falling rain
          if (p.y > height + 20) {
            p.y = -10;
            p.x = Math.random() * width;
          }
        } else {
          // general drift
          if (p.y > height + 20) p.y = -20;
          if (p.y < -20) p.y = height + 20;
          if (p.x > width + 20) p.x = -20;
          if (p.x < -20) p.x = width + 20;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        if (worldId === 'love' && p.size > 5) {
          // Draw organic curved rose petal
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.petalWidth || 4, p.petalLength || 8, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (worldId === 'sad') {
          // Draw rain streak
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(p.speedX * 3, p.speedY * 2.5);
          ctx.stroke();
        } else if (worldId === 'breakup' && p.size > 3) {
          // Draw angular glass shard polygon
          ctx.fillStyle = p.color;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.8, p.size * 0.5);
          ctx.lineTo(-p.size * 0.6, p.size * 0.8);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else {
          // Circular glowing particle / star / spark
          ctx.fillStyle = p.color;
          ctx.shadowBlur = p.size * 2;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [worldId, density]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 w-full h-full"
      aria-hidden="true"
    />
  );
};
