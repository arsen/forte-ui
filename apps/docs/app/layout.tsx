import type { Metadata } from "next";
import "@dofortech/pretty-ui/theme.css";
import "./globals.css";
import { TooltipProvider } from "@/components/tooltip-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: { default: "pretty-ui", template: "%s · pretty-ui" },
  description:
    "An accessible React component library built on Base UI. One CSS variable re-themes the entire system, motion respects every user preference, and nothing ships a runtime.",
};

// Runs before first paint so the page never flashes the wrong theme. Kept
// deliberately tiny and inlined — an external script would defeat the purpose.
const noFlashScript = `(function(){try{var t=localStorage.getItem('pui-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body>
        {/* A shared provider means a row of icon buttons opens instantly after
          * the first tooltip, instead of re-waiting the delay on each one. */}
        <TooltipProvider>
          <a className="skipLink" href="#main">Skip to content</a>
          <div className="layout">
            <header className="header">
              <a className="brand" href="/">
                <span className="brandMark pui-hc-decorative" aria-hidden="true" />
                pretty-ui
              </a>
              <div className="headerActions">
                <a
                  className="headerLink"
                  href="https://github.com/dofortech/pretty-ui"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
                <ThemeToggle />
              </div>
            </header>
            <div className="shell">
              <Sidebar />
              <main className="content" id="main">{children}</main>
              <div className="toc" />
            </div>
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
