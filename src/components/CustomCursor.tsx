import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const state = { x: 0, y: 0, rx: 0, ry: 0 };
    const move = (e: MouseEvent) => {
      state.x = e.clientX;
      state.y = e.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%)`;
      }
    };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("a, button, [data-cursor]")) setHover(true);
      else setHover(false);
    };
    let raf = 0;
    const loop = () => {
      state.rx += (state.x - state.rx) * 0.15;
      state.ry += (state.y - state.ry) * 0.15;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${state.rx}px, ${state.ry}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, []);

  return (
    <>
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-1.5 w-1.5 rounded-full bg-[var(--lcd-fg)] md:block"
        style={{ mixBlendMode: "difference" }}
      />
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] hidden rounded-full border border-[var(--lcd-fg)]/70 transition-[width,height,opacity] duration-300 md:block"
        style={{
          width: hover ? 56 : 28,
          height: hover ? 56 : 28,
          mixBlendMode: "difference",
          opacity: hover ? 1 : 0.6,
        }}
      />
    </>
  );
}