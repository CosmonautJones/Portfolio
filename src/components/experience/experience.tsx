"use client";

import { useState } from "react";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { Atmosphere } from "./atmosphere";
import { connections, modes, position, projects, type Mode } from "./graph";


const descriptions: Record<Mode, string> = {
  CORE: "Working software. A direct path to the proof.",
  JAC: "Follow shared technologies through a living graph.",
  COSMOS: "A constellation of projects. Take your time exploring.",
  TERMINAL: "Explore by command. The same projects, another way in.",
};

export function Experience() {
  const [mode, setMode] = useState<Mode>("CORE");
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [layer, setLayer] = useState("Purpose");
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState(["Welcome aboard. Type help to explore."]);
  const active = hovered ?? selected;
  const related = connections(active);
  const project = projects[selected];

  function runCommand() {
    const input = command.trim();
    const [verb, ...args] = input.toLowerCase().split(/\s+/);
    let output = "Unknown command. Type help.";
    if (verb === "help") output = "help · projects · open <number> · mode <core|jac|cosmos|terminal> · about · clear";
    if (verb === "projects") output = projects.map((item, index) => `${index + 1}. ${item.title}`).join("\n");
    if (verb === "about") output = `${SITE_CONFIG.name} / ${SITE_CONFIG.title}\n${SITE_CONFIG.tagline}`;
    if (verb === "mode") {
      const next = args[0]?.toUpperCase() as Mode;
      if (modes.includes(next)) { setMode(next); output = `Entered ${next}.`; }
      else output = "Choose CORE, JAC, COSMOS, or TERMINAL.";
    }
    if (verb === "open") {
      const index = Number(args[0]) - 1;
      if (Number.isInteger(index) && projects[index]) { setSelected(index); output = `Inspecting ${projects[index].title}. Proof link is in the project panel.`; }
      else output = `Use open <number>, from 1 to ${projects.length}.`;
    }
    setHistory((previous) => verb === "clear" ? [] : [...previous.slice(-39), `> ${input}\n${output}`]);
    setCommand("");
  }

  return (
    <section className="cosmic-experience" aria-label="Cosmic portfolio prototype">
      <Atmosphere />
      <header className="cosmic-header">
        <span className="cosmic-label">TJ / EXPLORATION 001</span>
        <Link href="/contact">Let’s build something ↗</Link>
      </header>
      <div className="cosmic-intro">
        <p className="cosmic-label">{SITE_CONFIG.title} · {SITE_CONFIG.location}</p>
        <h1>Curiosity, connected.</h1>
        <p>I’m Travis Jones. Explore the systems I build, the ideas behind them, and the connections between them.</p>
      </div>
      <nav className="cosmic-modes" aria-label="Experience mode">
        {modes.map((item) => <button key={item} aria-pressed={mode === item} onClick={() => { setMode(item); setHovered(null); }}>{item}</button>)}
      </nav>
      <p className="cosmic-caption" role="status">{descriptions[mode]}</p>
      <div className="cosmic-workspace">
        <div className={`cosmic-stage cosmic-${mode.toLowerCase()}`}>
          {mode === "TERMINAL" ? <div className="cosmic-terminal">
            <pre role="log" aria-label="Command output">{history.join("\n\n")}</pre>
            <form onSubmit={(event) => { event.preventDefault(); runCommand(); }}>
              <label htmlFor="cosmic-command">guest@cosmos:~$</label>
              <input id="cosmic-command" autoComplete="off" value={command} onChange={(event) => setCommand(event.target.value)} />
              <button type="submit">Run</button>
            </form>
          </div> : <>
            {mode !== "CORE" && <svg className="cosmic-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {projects.flatMap((_, index) => connections(index).filter((edge) => edge.index > index).map((edge) => {
                const from = position(index, mode); const to = position(edge.index, mode);
                return <line key={`${index}-${edge.index}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className={index === active || edge.index === active ? "lit" : ""} />;
              }))}
            </svg>}
            {projects.map((item, index) => {
              const point = position(index, mode);
              const connected = index === active || related.some((edge) => edge.index === index);
              return <button key={item.title} className={`cosmic-node ${connected ? "connected" : ""}`} style={mode === "CORE" ? undefined : { left: `${point.x}%`, top: `${point.y}%` }} aria-pressed={selected === index}
                onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(index)} onBlur={() => setHovered(null)} onClick={() => { setSelected(index); setLayer("Purpose"); }}>
                <span className="cosmic-star" aria-hidden="true" /><span><small>{String(index + 1).padStart(2, "0")} / {item.role}</small>{item.title}</span>
              </button>;
            })}
          </>}
        </div>
        <aside className="cosmic-detail" aria-label="Project deconstruction">
          <span className="cosmic-label">INSPECT / {String(selected + 1).padStart(2, "0")}</span>
          <h2>{project.title}</h2>
          <div className="cosmic-layers" aria-label="Deconstruction layer">
            {["Purpose", "System", "Proof"].map((item) => <button key={item} aria-pressed={layer === item} onClick={() => setLayer(item)}>{item}</button>)}
          </div>
          <p>{layer === "Purpose" ? project.description : layer === "System" ? `${project.role}. Built with ${project.tags.join(", ")}.` : project.proof || project.description}</p>
          <div className="cosmic-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          <a className="cosmic-proof" href={project.demoUrl || project.liveUrl || project.githubUrl}>{project.actionLabel || "Inspect proof"} ↗</a>
          {project.githubUrl && <a href={project.githubUrl}>Read the source ↗</a>}
          <div className="cosmic-relations">
            <h3>Connected through shared technology</h3>
            {connections(selected).slice(0, 5).map((edge) => <button key={edge.index} onClick={() => { setSelected(edge.index); setLayer("System"); }}>
              {projects[edge.index].title}<small>{edge.shared.join(" · ")}</small>
            </button>)}
            {!connections(selected).length && <p>An independent orbit. Explore another project from the field.</p>}
          </div>
        </aside>
      </div>
      <footer className="cosmic-footnote">Same work. Four perspectives. <Link href="/work">Browse the full portfolio ↗</Link></footer>
    </section>
  );
}
