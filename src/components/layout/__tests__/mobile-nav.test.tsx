/** @vitest-environment jsdom */
import React from "react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { MobileNav } from "../mobile-nav";

describe("MobileNav", () => {
  afterEach(cleanup);

  it("opens with an accessible navigation name and description", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    expect(screen.getByRole("dialog", { name: "Site navigation" })).toBeDefined();
    expect(screen.getByText("Choose a page to continue exploring the portfolio.")).toBeDefined();
  });
});
