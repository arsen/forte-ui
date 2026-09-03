import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * `out/robots.txt`.
 *
 * The site had none, which is not the same as having a permissive one: a
 * missing file is a 404 that every crawler interprets for itself, and it is
 * also the only conventional place to advertise the sitemap. Nothing here is
 * disallowed — the whole site is public documentation, and the generated
 * `opengraph-image` routes have to stay reachable or the share cards they
 * back cannot be fetched.
 */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
