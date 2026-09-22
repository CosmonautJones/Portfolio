import { afterEach, describe, expect, it, vi } from "vitest";
import { loadGoogleFont } from "@/lib/og-font";

const CSS = `@font-face {
  font-family: 'Archivo';
  src: url(https://fonts.gstatic.com/s/archivo/v1/archivo.ttf) format('truetype');
}`;

describe("loadGoogleFont", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("requests a subset for the given text and returns the font bytes", async () => {
    const bytes = new ArrayBuffer(8);
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(CSS, { status: 200 }))
      .mockResolvedValueOnce(new Response(bytes, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const font = await loadGoogleFont("Archivo:wdth,wght@118,800", "Travis Jones");

    expect(font?.byteLength).toBe(8);
    const cssUrl = String(fetchMock.mock.calls[0][0]);
    expect(cssUrl).toContain("family=Archivo:wdth,wght@118,800");
    expect(cssUrl).toContain(`text=${encodeURIComponent("Travis Jones")}`);
    expect(String(fetchMock.mock.calls[1][0])).toBe("https://fonts.gstatic.com/s/archivo/v1/archivo.ttf");
  });

  it("returns null and logs when the stylesheet has no usable font", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("/* nothing */", { status: 200 })));

    expect(await loadGoogleFont("Archivo", "x")).toBeNull();
    expect(error).toHaveBeenCalled();
  });

  it("returns null and logs when the network fails", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    expect(await loadGoogleFont("Archivo", "x")).toBeNull();
    expect(error).toHaveBeenCalled();
  });

  it("returns null when the font file request is not ok", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response(CSS, { status: 200 }))
        .mockResolvedValueOnce(new Response("nope", { status: 404 }))
    );

    expect(await loadGoogleFont("Archivo", "x")).toBeNull();
    expect(error).toHaveBeenCalled();
  });
});
