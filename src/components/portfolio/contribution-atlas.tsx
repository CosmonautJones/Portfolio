"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Box, ChevronLeft, ChevronRight, Grid2X2, RotateCcw } from "lucide-react";
import snapshot from "@/lib/data/github-contributions-snapshot.json";
import type { ContributionData } from "@/lib/github-contributions";
import type { PublicChange } from "@/lib/github-activity";
import styles from "./contribution-atlas.module.css";

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const formatDate = (date: string) => dateFormat.format(new Date(`${date}T00:00:00Z`));

export function ContributionAtlas() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [data, setData] = useState<ContributionData>({ ...snapshot, stale: true });
  const [unavailable, setUnavailable] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const [changes, setChanges] = useState<PublicChange[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const peak = data.days.reduce((a, b) => a.count >= b.count ? a : b);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setActive(true);
        observer.disconnect();
      }
    });
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    let disposed = false;
    const timer = setTimeout(() => controller.abort(), 8000);
    fetch("/api/github-contributions", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Calendar unavailable");
        return response.json();
      })
      .then((latest) => { if (!controller.signal.aborted) setData(latest); })
      .catch(() => {})
      .finally(() => { clearTimeout(timer); if (!disposed) setRefreshing(false); });
    return () => { disposed = true; clearTimeout(timer); controller.abort(); };
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    let disposed = false;
    const timer = setTimeout(() => controller.abort(), 12000);
    fetch("/api/github-activity", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Public activity unavailable");
        return response.json();
      })
      .then((activity) => { if (!disposed && Array.isArray(activity.items)) setChanges(activity.items); })
      .catch(() => {})
      .finally(() => { clearTimeout(timer); if (!disposed) setActivityLoading(false); });
    return () => { disposed = true; clearTimeout(timer); controller.abort(); };
  }, [active]);

  useEffect(() => {
    if (!active) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    import("./contribution-atlas-renderer").then(({ initializeContributionAtlas }) => {
      if (!disposed && root.current) cleanup = initializeContributionAtlas(root.current, data);
    }).catch(() => { if (!disposed) setUnavailable(true); });
    return () => { disposed = true; cleanup?.(); };
  }, [active, data]);

  return (
    <section aria-labelledby="contribution-atlas-title" className="container mx-auto px-6 py-16 sm:py-24">
      <div className="mb-8 border-t border-[var(--rule-strong)] pt-8">
        <p className="label-mono mb-3">Work in progress / GitHub</p>
        <h2 id="contribution-atlas-title" className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">A year of building.</h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">The familiar calendar, with depth. Each column is a day; its height is the number of contributions.</p>
      </div>
      <div ref={root} className={styles.atlas}>
        <div className={styles.toolbar}>
          <div className={styles["view-tabs"]} role="group" aria-label="Calendar view">
            <button id="top-view" aria-pressed="true"><Grid2X2 size={15} aria-hidden="true" />Top view</button>
            <button id="landscape-view" aria-pressed="false"><Box size={17} aria-hidden="true" />3D landscape</button>
          </div>
          <button className={styles.replay} id="replay" aria-label="Replay the transformation"><RotateCcw size={16} aria-hidden="true" />Replay</button>
        </div>
        <div className={styles.scene} id="scene">
          <canvas className={styles.canvas} id="atlas-canvas" tabIndex={0} role="img" aria-label="365-day contribution calendar. Use arrow keys to inspect days; press 1 for top view, 2 for 3D, or R to replay." aria-describedby="atlas-keyboard-help day-description" />
          <div className={styles.tooltip} id="tooltip" aria-hidden="true" />
          <div className={styles["scene-note"]}><span className={styles.dot} /><span id="scene-hint">Hover a day to explore</span></div>
          <div className={styles["view-name"]} id="view-name">The familiar view</div>
        </div>
        <div className={styles["scene-tools"]}>
          <div className={styles.legend} aria-label="Color scale from fewer to more contributions">
            <span>Less</span>{[0, 1, 2, 3, 4].map((level) => <i key={level} className={styles.swatch} data-level={level} />)}<span>More</span>
          </div>
          <div className={styles["scale-control"]}><label htmlFor="height-scale">Height</label><input id="height-scale" type="range" min="0.5" max="2" step="0.1" defaultValue="1" aria-label="Column height multiplier" /><output id="height-value" htmlFor="height-scale">1.0×</output><button className={styles.reset} id="reset-camera">Reset angle</button></div>
        </div>
        <div className={styles.details}>
          <div><div className={styles["stat-label"]}>Contributions</div><div className={styles["stat-value"]} id="total">{data.days.reduce((sum, day) => sum + day.count, 0).toLocaleString("en-US")}</div><div className={styles["stat-note"]}>Over the past year</div></div>
          <div><div className={styles["stat-label"]}>Active days</div><div className={styles["stat-value"]} id="active">{data.days.filter((day) => day.count > 0).length}</div><div className={styles["stat-note"]}>Out of 365 days</div></div>
          <div><div className={styles["stat-label"]}>Busiest day</div><div className={styles["stat-value"]} id="peak">{Math.max(...data.days.map((day) => day.count))}</div><button className={styles["peak-button"]} id="show-peak">Find the peak</button></div>
          <div className={styles["day-detail"]}>
            <div className={styles["stat-label"]} id="day-label">The highest point</div>
            <div className={styles["stat-value"]} id="day-description" aria-live="polite">{peak.count.toLocaleString("en-US")} contributions</div>
            <div className={styles["stat-note"]} id="day-date">{formatDate(peak.date)}</div>
            <div className={styles["date-control"]}>
              <button id="previous-day" aria-label="Inspect previous day"><ChevronLeft size={16} aria-hidden="true" /></button>
              <label className="sr-only" htmlFor="inspect-date">Inspect a date</label>
              <input id="inspect-date" type="date" min={data.from} max={data.to} defaultValue={peak.date} />
              <button id="next-day" aria-label="Inspect next day"><ChevronRight size={16} aria-hidden="true" /></button>
            </div>
          </div>
        </div>
        <div className={styles.status}>
          <p>{formatDate(data.from)} — {formatDate(data.to)}. {refreshing ? "Checking the latest GitHub activity…" : data.stale ? "Saved snapshot; live GitHub data is temporarily unavailable." : "Refreshes daily from GitHub."}</p>
          <p>Height is proportional to contributions, including commits, pull requests, issues, and reviews. <a href="https://github.com/CosmonautJones" target="_blank" rel="noopener noreferrer">View on GitHub</a></p>
          <p>Private activity may appear in the totals; repository names and details stay private.</p>
          {unavailable && <p role="status">The interactive map could not load. You can still inspect the calendar on GitHub.</p>}
        </div>
      </div>
      <div className={styles.activity}>
        <div className={styles["activity-heading"]}><h3 className="label-mono">Recent public changes</h3><a href="https://github.com/CosmonautJones?tab=overview" target="_blank" rel="noopener noreferrer">Explore on GitHub<ArrowUpRight size={14} aria-hidden="true" /></a></div>
        {changes.length > 0 ? <ul>{changes.map((change) => <li key={change.url}>
          <a href={change.url} target="_blank" rel="noopener noreferrer"><span className={styles["change-meta"]}>{change.repo.replace("CosmonautJones/", "")} · {change.kind}</span><span className={styles["change-title"]}>{change.title}<ArrowUpRight size={14} aria-hidden="true" /></span><time dateTime={change.date}>{dateFormat.format(new Date(change.date))}</time></a>
        </li>)}</ul> : <p className={styles["activity-note"]}>{activityLoading ? "Loading public changes…" : "Recent changes are available on GitHub."}</p>}
        {changes.length > 0 && <p className={styles["activity-note"]}>A few recent changes from public repositories. GitHub’s feed can take several hours to update.</p>}
      </div>
      <p className="sr-only" id="atlas-keyboard-help">Focus the calendar and use left and right for weeks, up and down for days. Press 1 for top view, 2 for landscape, or R to replay. In landscape, drag to change the viewing angle.</p>
    </section>
  );
}
