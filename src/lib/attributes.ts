import { AttributeKind, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const ATTRIBUTE_KINDS = [
  "GENDER",
  "COLOUR",
  "MATERIAL",
  "SHAPE",
  "SIZE",
  "ORIGIN",
] as const;

export type Kind = (typeof ATTRIBUTE_KINDS)[number];

export function isKind(value: string): value is Kind {
  return (ATTRIBUTE_KINDS as readonly string[]).includes(value);
}

/**
 * Collapse a word to its comparison key.
 *
 * "Cat Eye", "cat-eye", "CAT  EYE" and "Cat_Eye" are the same entry. Accents
 * are stripped too, so "Rosé" matches "Rose" — the shop types both.
 */
export function normalise(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Damerau-Levenshtein distance, capped.
 *
 * Counts a transposition as ONE edit, not two — "aviatro" for "Aviator" is a
 * single slip of the fingers and has to score the same as a dropped letter, or
 * the commonest typo of all would never fold into the word it meant.
 *
 * Bails out as soon as the best possible result exceeds `max`, which keeps it
 * cheap enough to run against the whole vocabulary on every keystroke. Three
 * rows are kept (the transposition check needs the row before last), never the
 * full matrix.
 */
function editDistance(a: string, b: string, max: number): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let twoBack: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    let rowBest = curr[0];

    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let best = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);

      // Transposition: the previous two characters are this pair, swapped.
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        best = Math.min(best, twoBack[j - 2] + 1);
      }

      curr[j] = best;
      if (best < rowBest) rowBest = best;
    }

    // Every remaining row can only add to the best value on this one.
    if (rowBest > max) return max + 1;
    twoBack = prev;
    prev = curr;
    curr = new Array<number>(b.length + 1);
  }

  return prev[b.length];
}

/** How forgiving to be, by word length. One typo in "red", three in "cellulose acetate". */
function tolerance(length: number): number {
  if (length <= 4) return 1;
  if (length <= 8) return 2;
  return 3;
}

export type Candidate = { id: string; label: string; slug: string; usageCount: number };

export type MatchResult = {
  /** An existing entry the input should collapse into, if there is a confident one. */
  exact: Candidate | null;
  /** Ranked suggestions to show under the input. */
  suggestions: Candidate[];
};

/**
 * Resolve typed text against a vocabulary.
 *
 * The ranking is deliberately ordered by how much evidence each signal carries:
 * an identical normalised key is the same word; a prefix match is someone
 * part-way through typing it; a substring match is a longer phrase containing
 * it; and only then do we fall back to edit distance for genuine typos.
 *
 * `exact` is only set for an identical key or a very close misspelling, because
 * silently folding "Blue" into "Black" would be worse than creating a new word.
 */
export function matchVocabulary(input: string, vocabulary: Candidate[]): MatchResult {
  const key = normalise(input);
  if (!key) return { exact: null, suggestions: [] };

  const limit = tolerance(key.length);
  const scored: { entry: Candidate; rank: number; distance: number }[] = [];
  let prefixMatches = 0;

  for (const entry of vocabulary) {
    if (entry.slug === key) {
      return { exact: entry, suggestions: [entry] };
    }

    if (entry.slug.startsWith(key)) {
      prefixMatches += 1;
      scored.push({ entry, rank: 1, distance: 0 });
      continue;
    }
    if (entry.slug.includes(key) || key.includes(entry.slug)) {
      scored.push({ entry, rank: 2, distance: 0 });
      continue;
    }

    const distance = editDistance(key, entry.slug, limit);
    if (distance <= limit) scored.push({ entry, rank: 3, distance });
  }

  scored.sort(
    (a, b) =>
      a.rank - b.rank ||
      a.distance - b.distance ||
      b.entry.usageCount - a.entry.usageCount ||
      a.entry.label.localeCompare(b.entry.label)
  );

  // When to treat typed text as an existing word rather than a new one:
  //
  //   · an unambiguous prefix — someone part-way through typing "Acetate"
  //     means Acetate, but "bl" could be Black or Blue, so that stays open;
  //   · a single edit on a word long enough for one slip to be unambiguous.
  //
  // Everything looser stays a suggestion the person has to accept, so "Blue"
  // can never silently become "Black".
  const best = scored[0];
  let exact: Candidate | null = null;

  if (best) {
    if (best.rank === 1 && prefixMatches === 1 && key.length >= 3) {
      exact = best.entry;
    } else if (best.rank === 3 && best.distance === 1 && key.length >= 5) {
      exact = best.entry;
    }
  }

  return { exact, suggestions: scored.slice(0, 8).map((s) => s.entry) };
}

/** Title-case a freshly coined word so the list stays visually consistent. */
export function tidyLabel(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) =>
      // Leave things like "TR90", "USA" and "18K" alone.
      /\d/.test(word) || word === word.toUpperCase()
        ? word
        : word[0].toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
}

export function listVocabulary(kind: Kind) {
  return db.attributeValue.findMany({
    where: { kind: kind as AttributeKind },
    orderBy: [{ usageCount: "desc" }, { label: "asc" }],
    select: { id: true, label: true, slug: true, usageCount: true },
  });
}

/**
 * Find or create a vocabulary entry for typed text, and return the label to
 * store on the product.
 *
 * Creation races on the unique (kind, slug) pair — two uploads committing the
 * same new colour at once — are resolved by reading back the winner rather
 * than failing the upload.
 */
export async function resolveValue(kind: Kind, input: string): Promise<string | null> {
  const label = tidyLabel(input);
  if (!label) return null;

  const slug = normalise(label);
  if (!slug) return null;

  const vocabulary = await listVocabulary(kind);
  const { exact } = matchVocabulary(label, vocabulary);

  if (exact) {
    await db.attributeValue.update({
      where: { id: exact.id },
      data: { usageCount: { increment: 1 } },
    });
    return exact.label;
  }

  try {
    const created = await db.attributeValue.create({
      data: { kind: kind as AttributeKind, label, slug, usageCount: 1 },
    });
    return created.label;
  } catch (err) {
    if ((err as Prisma.PrismaClientKnownRequestError)?.code === "P2002") {
      const existing = await db.attributeValue.findUnique({
        where: { kind_slug: { kind: kind as AttributeKind, slug } },
      });
      if (existing) {
        await db.attributeValue.update({
          where: { id: existing.id },
          data: { usageCount: { increment: 1 } },
        });
        return existing.label;
      }
    }
    throw err;
  }
}
