/**
 * Lightweight luxury wedding confetti burst (Gold & Emerald theme).
 * Uses pure HTML5 Canvas without heavy external dependencies.
 */
export function fireWeddingConfetti(durationMs = 2500) {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    document.body.removeChild(canvas);
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const w = (canvas.width = window.innerWidth * dpr);
  const h = (canvas.height = window.innerHeight * dpr);
  ctx.scale(dpr, dpr);

  const colors = [
    "#c29b4e", // Gold
    "#dfbe7e", // Soft Gold
    "#1b6554", // Emerald Green
    "#2d8a74", // Sage Bright
    "#ffffff", // Pearl White
    "#fbf9f4", // Warm Cream
    "#ffd700", // Sparkle Gold
  ];

  type Particle = {
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
    vx: number;
    vy: number;
    rotation: number;
    vRot: number;
    alpha: number;
    scale: number;
    shape: "rect" | "circle" | "sparkle";
  };

  const count = 75;
  const particles: Particle[] = [];
  const startX = window.innerWidth / 2;
  const startY = window.innerHeight * 0.7;

  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
    const speed = 8 + Math.random() * 14;
    particles.push({
      x: startX,
      y: startY,
      w: 6 + Math.random() * 6,
      h: 4 + Math.random() * 7,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 4,
      vy: Math.sin(angle) * speed,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 12,
      alpha: 1,
      scale: 0.7 + Math.random() * 0.6,
      shape: Math.random() > 0.3 ? "rect" : Math.random() > 0.5 ? "circle" : "sparkle",
    });
  }

  const startTime = performance.now();

  function animate(now: number) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / durationMs, 1);

    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);

    let activeCount = 0;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.32; // Gravity
      p.vx *= 0.985; // Drag
      p.rotation += p.vRot;

      if (progress > 0.6) {
        p.alpha = Math.max(0, 1 - (progress - 0.6) / 0.4);
      }

      if (p.alpha > 0 && p.y < window.innerHeight + 50) {
        activeCount++;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.scale(p.scale, p.scale);
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // 4-point sparkle star
          ctx.beginPath();
          ctx.moveTo(0, -p.h);
          ctx.lineTo(p.w / 3, 0);
          ctx.lineTo(0, p.h);
          ctx.lineTo(-p.w / 3, 0);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }
    }

    if (progress < 1 && activeCount > 0) {
      requestAnimationFrame(animate);
    } else {
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  }

  requestAnimationFrame(animate);
}
