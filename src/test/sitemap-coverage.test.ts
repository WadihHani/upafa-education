import { describe, it, expect } from "vitest";
import { computeCoverage, extractRoutesFromApp, isPrivate } from "../../scripts/sitemap-coverage";

describe("sitemap coverage", () => {
  it("extracts route paths from JSX source", () => {
    const src = `<Route path="/about" /><Route path="/news/:categoryKey" />`;
    expect(extractRoutesFromApp(src)).toEqual(["/about", "/news/:categoryKey"]);
  });

  it("classifies private routes", () => {
    expect(isPrivate("/admin")).toBe(true);
    expect(isPrivate("/admin/users")).toBe(true);
    expect(isPrivate("/portal/student")).toBe(true);
    expect(isPrivate("/login")).toBe(true);
    expect(isPrivate("/unsubscribe")).toBe(true);
    expect(isPrivate("/about")).toBe(false);
    expect(isPrivate("/programs/bachelor")).toBe(false);
  });

  it("every public app route is present in public/sitemap.xml", async () => {
    const r = await computeCoverage();
    expect(r.unexpandedDynamic, "dynamic routes need expansion rules").toEqual([]);
    expect(r.missing, "public routes missing from sitemap").toEqual([]);
    expect(r.leaked, "private routes must not appear in sitemap").toEqual([]);
  });
});
