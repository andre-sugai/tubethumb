import React, { useEffect, useRef } from 'react';

interface Shape {
  x: number;
  y: number;
  size: number;
  sides: number;
  rotation: number;
  rotationSpeed: number;
  vx: number;
  vy: number;
  color: string;
  type: 'stroke' | 'fill';
}

const GRAY_TONES = [
  'rgba(30, 41, 59, 0.4)', // Slate 800
  'rgba(51, 65, 85, 0.4)', // Slate 700
  'rgba(71, 85, 105, 0.3)', // Slate 600
];

const GeometricBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    console.log("GeometricBackground mounted");
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let shapes: Shape[] = [];
    const shapeCount = 30;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createShapes = () => {
      shapes = [];
      for (let i = 0; i < shapeCount; i++) {
        shapes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 60 + 20, // 20px to 80px
          sides: Math.floor(Math.random() * 4) + 3, // 3 to 6 sides (triangle, square, pentagon, hexagon)
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.01,
          vx: (Math.random() - 0.5) * 0.5, // Slow movement
          vy: (Math.random() - 0.5) * 0.5,
          color: GRAY_TONES[Math.floor(Math.random() * GRAY_TONES.length)],
          type: Math.random() > 0.5 ? 'stroke' : 'fill',
        });
      }
    };

    const drawPolygon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, sides: number) => {
      ctx.beginPath();
      // Sides should be integer >= 3
      if (sides < 3) return;
      
      const angleStep = (Math.PI * 2) / sides;
      ctx.moveTo(x + size * Math.cos(0), y + size * Math.sin(0));

      for (let i = 1; i <= sides; i++) {
        ctx.lineTo(x + size * Math.cos(i * angleStep), y + size * Math.sin(i * angleStep));
      }
      ctx.closePath();
    };

    const draw = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      shapes.forEach((s) => {
        // Update
        s.x += s.vx;
        s.y += s.vy;
        s.rotation += s.rotationSpeed;

        // Bounce
        if (s.x < -s.size || s.x > canvas.width + s.size) s.vx *= -1;
        if (s.y < -s.size || s.y > canvas.height + s.size) s.vy *= -1;

        // Draw
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);
        
        // We draw centered at 0,0 because we translated
        drawPolygon(ctx, 0, 0, s.size, s.sides);

        if (s.type === 'stroke') {
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          ctx.fillStyle = s.color;
          ctx.fill();
        }
        
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    resize();
    createShapes();
    draw();

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default GeometricBackground;
