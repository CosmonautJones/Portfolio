"use client";

import { useEffect, useRef } from "react";
import { driftingPosition, position, projects, type Mode } from "./graph";

export function useLivingGraph(mode: Mode, paused: boolean) {
  const field = useRef<HTMLDivElement>(null);
  const points = useRef(projects.map((_, index) => position(index, mode)));
  const elapsed = useRef(0);

  useEffect(() => {
    const element = field.current;
    if (!element || mode === "CORE" || mode === "TERMINAL") return;
    const nodes = [...element.querySelectorAll<HTMLElement>(".cosmic-node")];
    const edges = [...element.querySelectorAll<SVGGElement>(".cosmic-connection")].map((group) => ({
      from: Number(group.dataset.from), to: Number(group.dataset.to),
      lines: [...group.querySelectorAll("line")], pulse: group.querySelector("circle"),
    }));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 800px)");
    let frame = 0;
    let previous = 0;
    let visible = true;

    const draw = (now: number) => {
      if (previous && now - previous < 1000 / 30) { frame = requestAnimationFrame(draw); return; }
      const delta = previous ? Math.min((now - previous) / 1000, .05) : 0;
      previous = now;
      if (!paused && !reduced.matches && !mobile.matches) elapsed.current += delta;
      const animate = !paused && !reduced.matches && !mobile.matches;
      nodes.forEach((node, index) => {
        const target = reduced.matches ? position(index, mode) : driftingPosition(index, mode, elapsed.current);
        const current = points.current[index];
        const blend = animate ? 1 - Math.exp(-delta * 4) : 1;
        current.x += (target.x - current.x) * blend;
        current.y += (target.y - current.y) * blend;
        node.style.left = `${current.x}%`; node.style.top = `${current.y}%`;
      });
      edges.forEach((edge, index) => {
        const from = points.current[edge.from]; const to = points.current[edge.to];
        edge.lines.forEach((line) => {
          line.setAttribute("x1", String(from.x)); line.setAttribute("y1", String(from.y));
          line.setAttribute("x2", String(to.x)); line.setAttribute("y2", String(to.y));
        });
        const progress = (elapsed.current * .12 + index * .618) % 1;
        edge.pulse?.setAttribute("cx", String(from.x + (to.x - from.x) * progress));
        edge.pulse?.setAttribute("cy", String(from.y + (to.y - from.y) * progress));
      });
      if (animate && visible && !document.hidden) frame = requestAnimationFrame(draw);
    };
    const restart = () => { cancelAnimationFrame(frame); previous = 0; if (visible && !document.hidden) frame = requestAnimationFrame(draw); };
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; restart(); });
    observer?.observe(element);
    document.addEventListener("visibilitychange", restart);
    reduced.addEventListener("change", restart); mobile.addEventListener("change", restart);
    restart();
    return () => {
      cancelAnimationFrame(frame); observer?.disconnect();
      document.removeEventListener("visibilitychange", restart);
      reduced.removeEventListener("change", restart); mobile.removeEventListener("change", restart);
    };
  }, [mode, paused]);
  return field;
}
