import Image from "next/image";

/**
 * Wordmark Offerra s teplým glow — port appkového `logo.tsx`. Appka
 * skladá glow zo 6 priesvitných vrstiev (RN nemá natívne blur bez
 * `expo-blur`), web má skutočné CSS `filter: blur()`, takže stačí
 * jedna vrstva. Dva obrázky (svetlý/tmavý) rovnako ako appka — wordmark
 * je kreslený, nie text, `tintColor`/`filter` by prefarbil aj teplé
 * podčiarknutie, ktoré sa meniť nemá.
 */
export function Logo({ width = 104, height = 26 }: { width?: number; height?: number }) {
  return (
    <span className="relative inline-flex items-center justify-center" style={{ width, height }}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[-40%] rounded-full bg-accent opacity-40 blur-2xl"
      />
      <Image
        src="/brand/wordmark.png"
        alt="Offerra"
        width={width}
        height={height}
        className="relative dark:hidden"
        priority
      />
      <Image
        src="/brand/wordmark-dark.png"
        alt="Offerra"
        width={width}
        height={height}
        className="relative hidden dark:block"
        priority
      />
    </span>
  );
}
