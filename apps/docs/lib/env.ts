/**
 * The one place the docs app reads `process.env`.
 *
 * Every build-time variable the site uses is named here, typed here, and
 * imported from here — so "what does this site read from its environment"
 * is this file, and `firebaseConfig` is the identifier to search for rather
 * than seven variable names. Anything a component needs from the env goes
 * through an export of this module, never a direct `process.env` read.
 *
 * Each key is spelled out as a literal `process.env.NAME` rather than looked
 * up in a loop: Next inlines a `NEXT_PUBLIC_*` variable only where it sees
 * the literal, and a computed read would be `undefined` in the exported
 * HTML. The literals are also the only reason these keys are public at all
 * — the site is a static export, so the values are baked into the JS at
 * `next build` and there is no server to read them later.
 */

/**
 * The Firebase web config. Optional as a whole: a checkout without a
 * `.env.local` — a fork, a fresh clone — builds a site that tracks nothing,
 * which is the point of keeping the config out of the source.
 *
 * `undefined` rather than a partial object when the measurement id is
 * absent: Analytics cannot work without it, and one field to check beats
 * seven, so the consumer's guard is `if (firebaseConfig)` and nothing else.
 * The remaining fields are typed as `string` because Firebase's
 * `initializeApp` wants strings; an unset one is passed through as an
 * empty string and fails loudly in the console, where a typo in
 * `.env.local` is visible, instead of typing every field as optional and
 * pushing the check into the consumer.
 */
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

export const firebaseConfig: FirebaseConfig | undefined = measurementId
  ? {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
      measurementId,
    }
  : undefined;

/**
 * Whether this is a production build. Read here so the `NODE_ENV` literal
 * lives beside the other env reads, and so a component asks a named
 * question rather than comparing a string.
 */
export const isProduction: boolean = process.env.NODE_ENV === "production";
