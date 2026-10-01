/*
 * The page check-overflow.mjs loads: ONE card, flush against the inline-end
 * edge of the viewport, with an AnimatedBorder in it. One per page because
 * the thing being measured is the document's scroll width, and a second
 * border on the page would make a failure impossible to attribute.
 *
 * Driven by the query string so the script can walk the cases without a
 * build per case:
 *
 *   variant  beam | shine | rotate          (default beam)
 *   reverse  1 → travel the other way round
 *   width    full → the card spans the viewport, so the light crosses BOTH
 *            edges; otherwise a 16rem card pushed to the inline end
 *   dir      rtl → the inline end is the LEFT edge, which is where a
 *            right-to-left document's scrollable overflow lives
 *
 * The real component from src, through Vite's CSS Modules, with the real
 * theme — a hand-written copy of the markup would test the copy.
 */
import { createRoot } from "react-dom/client";
import "../../src/styles/theme.css";
import { AnimatedBorder, type AnimatedBorderVariant } from "../../src/components/animated-border";
import { Card } from "../../src/components/card";

const params = new URLSearchParams(location.search);
const variant = (params.get("variant") ?? "beam") as AnimatedBorderVariant;
const full = params.get("width") === "full";
document.documentElement.dir = params.get("dir") === "rtl" ? "rtl" : "ltr";

createRoot(document.getElementById("root")!).render(
  <Card.Root
    data-fixture-host=""
    style={{
      inlineSize: full ? "100%" : "16rem",
      marginInlineStart: full ? undefined : "auto",
      boxSizing: "border-box",
    }}
  >
    <AnimatedBorder variant={variant} reverse={params.get("reverse") === "1"} />
    <Card.Header>
      <Card.Title>Pro</Card.Title>
      <Card.Description>Everything in Starter, plus unlimited projects.</Card.Description>
    </Card.Header>
  </Card.Root>,
);
