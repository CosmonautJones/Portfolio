/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PROJECTS } from "@/lib/constants";
import TableSensePage from "../page";

describe("TableSense project access", () => {
  it("launches the actual Flutter app and links its source while keeping the clock distinct", () => {
    render(<TableSensePage />);
    expect(screen.getByRole("link", { name: "Play TableSense" }).getAttribute("href")).toBe("https://cosmonautjones.github.io/poker-pokr/");
    expect(screen.getByRole("link", { name: "Read the actual source" }).getAttribute("href")).toBe("https://github.com/CosmonautJones/poker-pokr");
    expect(screen.getByRole("link", { name: "Poker-night blind clock" }).getAttribute("href")).toBe("/work/blind-clock");
    expect(screen.getByText(/working practice prototype/)).toBeDefined();
    expect(screen.getByText(/does not claim every mode/)).toBeDefined();
    const project = PROJECTS.find((item) => item.title === "TableSense");
    expect(project).toMatchObject({ liveUrl: "https://cosmonautjones.github.io/poker-pokr/", githubUrl: "https://github.com/CosmonautJones/poker-pokr", playground: true });
    expect(project?.demoUrl).toBeUndefined();
  });
});
