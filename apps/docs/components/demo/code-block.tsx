import { highlight } from "@/lib/highlighter";
import { CopyButton } from "./copy-button";
import styles from "./code-block.module.css";

export function CodeBlock({
  code,
  lang = "tsx",
  title,
  copyable = true,
}: {
  code: string;
  lang?: string;
  title?: string;
  copyable?: boolean;
}) {
  // Runs on the server: the highlighted markup ships as HTML and no Shiki
  // bytes reach the client. The trade is that this cannot re-highlight on
  // theme change — which is exactly why shikiOptions emits both themes as CSS
  // variables instead of baking one in.
  const html = highlight(code, lang);

  return (
    <figure className={styles.root}>
      {title ? <figcaption className={styles.title}>{title}</figcaption> : null}
      <div className={styles.body}>
        <div className={styles.scroll} dangerouslySetInnerHTML={{ __html: html }} />
        {copyable ? <CopyButton className={styles.copy} /> : null}
      </div>
    </figure>
  );
}
