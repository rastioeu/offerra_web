import Image from "next/image";

/**
 * Avatar — port appkového `avatar.tsx`. Fotka, a keď chýba, DETERMINISTICKY
 * vygenerovaný geometrický obrazec z prezývky (rovnaký hash, rovnaké
 * súbory `a01.png`–`a12.png`, CC0, DiceBear „Shapes" — appka: „ponuky sú
 * pseudonymné, cudzia tvár by predstierala konkrétneho človeka").
 */
const GENERATED_COUNT = 12;

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function Avatar({
  name,
  uri,
  size = 40,
  ring = false,
}: {
  name: string;
  uri?: string | null;
  size?: number;
  /** Teplý prstenec s podsvietením — na profilovke, nie v zoznamoch. */
  ring?: boolean;
}) {
  const index = (hash(name) % GENERATED_COUNT) + 1;
  const src = uri || `/avatars/a${String(index).padStart(2, "0")}.png`;

  const img = (
    <Image
      src={src}
      alt={uri ? `Fotka: ${name}` : `Avatar: ${name}`}
      width={size}
      height={size}
      className="rounded-full bg-surface-pressed object-cover"
    />
  );

  if (!ring) return img;
  return (
    <span
      className="inline-flex rounded-full border-2 border-accent p-[3px]"
      style={{ boxShadow: "var(--shadow-glow)" }}
    >
      {img}
    </span>
  );
}
