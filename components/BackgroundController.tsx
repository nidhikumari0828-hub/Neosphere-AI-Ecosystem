import React, { useRef, useEffect } from 'react';

type BackgroundTheme = 'solid' | 'grid' | 'snow' | 'matrix' | 'cosmos';

interface BackgroundControllerProps {
  theme: BackgroundTheme;
}

const BackgroundController: React.FC<BackgroundControllerProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let resizeListener: () => void;

    const setupCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setupCanvas();
    resizeListener = setupCanvas;
    window.addEventListener('resize', resizeListener);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (theme === 'snow') {
      const particles: any[] = [];
      const particleCount = 200;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1,
          density: Math.random() * particleCount,
        });
      }

      const animateSnow = () => {
        if(!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = `rgba(226, 232, 240, 0.5)`;
        ctx.beginPath();
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          ctx.moveTo(p.x, p.y);
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, true);
        }
        ctx.fill();

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.y += Math.cos(p.density) + 1 + p.radius / 2;
          p.x += Math.sin(p.density) * 0.5;
          
          if (p.y > canvas.height + 5 || p.x > canvas.width + 5 || p.x < -5) {
            particles[i] = { ...p, y: -10, x: Math.random() * canvas.width };
          }
        }
        animationFrameId = requestAnimationFrame(animateSnow);
      };
      animateSnow();
    } else if (theme === 'matrix') {
      const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
      const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const nums = '0123456789';
      const characters = katakana + latin + nums;
      const fontSize = 14;
      const columns = canvas.width / fontSize;
      const rainDrops: number[] = [];
      for (let x = 0; x < columns; x++) {
        rainDrops[x] = 1;
      }
      
      const animateMatrix = () => {
        if(!ctx || !canvas) return;
        ctx.fillStyle = 'rgba(2, 6, 23, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#06b6d4'; // Cyan color
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < rainDrops.length; i++) {
          const text = characters.charAt(Math.floor(Math.random() * characters.length));
          ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
          
          if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            rainDrops[i] = 0;
          }
          rainDrops[i]++;
        }
        animationFrameId = requestAnimationFrame(animateMatrix);
      };
      animateMatrix();
    } else if (theme === 'cosmos') {
      const stars: any[] = [];
      const starCount = 400;
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.1,
          vx: Math.floor(Math.random() * 50) - 25,
          vy: Math.floor(Math.random() * 50) - 25
        });
      }
      
      const animateCosmos = () => {
        if(!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = `rgba(226, 232, 240, 0.1)`;
        ctx.beginPath();
        for (let i = 0, x = stars.length; i < x; i++) {
          const s = stars[i];
          ctx.moveTo(s.x, s.y);
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        }
        ctx.fill();

        for (let i = 0, x = stars.length; i < x; i++) {
          const s = stars[i];
          s.x += s.vx / 500;
          s.y += s.vy / 500;
          
          if (s.x < 0 || s.x > canvas.width) s.vx = -s.vx;
          if (s.y < 0 || s.y > canvas.height) s.vy = -s.vy;
        }
        animationFrameId = requestAnimationFrame(animateCosmos);
      };
      animateCosmos();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeListener);
    };
  }, [theme]);

  const gridStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    width: '100%',
    height: '100%',
    zIndex: -2,
    backgroundImage: `linear-gradient(rgba(30, 41, 59, 0.5) 1px, transparent 1px), linear-gradient(to right, rgba(30, 41, 59, 0.5) 1px, transparent 1px)`,
    backgroundSize: '3rem 3rem',
  };

  if (theme === 'grid') {
    return <div style={gridStyle}></div>;
  }
  
  if (theme === 'solid') {
    return null; // The body background will show
  }

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />;
};

export default BackgroundController;