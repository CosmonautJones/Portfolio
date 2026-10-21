/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { RecordedTravosEvidence } from "../recorded-travos-evidence";

afterEach(cleanup);

describe("recorded TravOS evidence", () => {
  it("labels the recorded synthetic scope before a native expandable disclosure", () => {
    render(<RecordedTravosEvidence />);
    const panel = screen.getByRole("region", { name: "Recorded evidence" });

    expect(within(panel).getByText("Recorded synthetic fixture")).toBeDefined();
    expect(within(panel).getByText("2026-10-20").getAttribute("datetime")).toBe("2026-10-20");
    expect(within(panel).getByText("3 dispatches")).toBeDefined();
    expect(within(panel).getByText("0 model calls")).toBeDefined();
    expect(within(panel).getByText(/not a live execution or a replacement for the retained local receipts/)).toBeDefined();

    const summary = within(panel).getByText("Inspect recorded outcomes");
    expect(summary.tagName).toBe("SUMMARY");
    expect(summary.parentElement?.tagName).toBe("DETAILS");
    expect(summary.parentElement?.hasAttribute("open")).toBe(false);
    expect(within(panel).queryByRole("button")).toBeNull();
  });

  it("keeps the false success rejected and distinguishes the held request from the accepted correction", () => {
    render(<RecordedTravosEvidence />);
    const panel = screen.getByRole("region", { name: "Recorded evidence" });
    const summary = within(panel).getByText("Inspect recorded outcomes");
    fireEvent.click(summary);
    expect(summary.parentElement?.hasAttribute("open")).toBe(true);
    const rejection = within(panel).getByRole("article", { name: "Worker success claim" });
    const completion = within(panel).getByRole("article", { name: "Mission completion request" });
    const correction = within(panel).getByRole("article", { name: "Explicitly requested correction" });

    expect(within(rejection).getByText("succeeded")).toBeDefined();
    expect(within(rejection).getByText("The required artifact was missing.")).toBeDefined();
    expect(within(rejection).getByText("Rejected")).toBeDefined();
    expect(within(rejection).queryByText("Accepted")).toBeNull();
    expect(within(completion).getByText("Required tasks were not all complete.")).toBeDefined();
    expect(within(completion).getByText("Held")).toBeDefined();
    expect(within(correction).getByText("succeeded")).toBeDefined();
    expect(within(correction).getByText("Overall verification passed.")).toBeDefined();
    expect(within(correction).getByText("Accepted")).toBeDefined();
    expect(within(panel).getByText(/Original rejection preserved unchanged/)).toBeDefined();
    expect(within(panel).getByText("completed")).toBeDefined();
    expect(within(panel).getByText(/Exact artifact contents and individual acceptance checks are outside this public summary/)).toBeDefined();
  });
});
