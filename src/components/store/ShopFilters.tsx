"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X, Check } from "lucide-react";
import { titleCase } from "@/lib/utils";

type Facets = {
  categories: { name: string; slug: string }[];
  brands: { name: string; slug: string }[];
};

const SHAPES = ["AVIATOR", "WAYFARER", "ROUND", "SQUARE", "RECTANGLE", "CAT_EYE", "OVAL", "GEOMETRIC", "SPORT"];
const MATERIALS = ["ACETATE", "METAL", "TITANIUM", "TR90", "COMBINATION", "WOOD"];
const FRAME_TYPES = ["FULL_RIM", "HALF_RIM", "RIMLESS"];
const GENDERS = ["MEN", "WOMEN", "KIDS", "UNISEX"];
const PRICE_BANDS = [
  { label: "Under ₹5,000", min: 0, max: 5000 },
  { label: "₹5,000 – ₹15,000", min: 5000, max: 15000 },
  { label: "₹15,000 – ₹30,000", min: 15000, max: 30000 },
  { label: "Above ₹30,000", min: 30000, max: undefined },
];

/**
 * One filter model, two presentations:
 *   "bar"     — the trigger button + its drawer, shown on small screens
 *   "sidebar" — the always-open desktop column
 * The page renders each variant once, so there is never a duplicated panel.
 */
export function ShopFilters({
  facets,
  variant,
}: {
  facets: Facets;
  variant: "bar" | "sidebar";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  /**
   * Every filter change rewrites the URL, which is what re-runs the server
   * query. Keeping state in the URL means a filtered view is shareable, works
   * with the back button, and survives a reload.
   */
  const apply = (mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    next.delete("page"); // a narrower result set invalidates the old page number
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const toggle = (key: string, value: string) =>
    apply((next) => {
      const current = next.getAll(key);
      next.delete(key);
      const remaining = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      remaining.forEach((v) => next.append(key, v));
    });

  const setPrice = (band: (typeof PRICE_BANDS)[number]) =>
    apply((next) => {
      const alreadyOn = next.get("minPrice") === String(band.min);
      next.delete("minPrice");
      next.delete("maxPrice");
      if (!alreadyOn) {
        next.set("minPrice", String(band.min));
        if (band.max != null) next.set("maxPrice", String(band.max));
      }
    });

  const activeCount =
    ["brand", "gender", "shape", "material", "frameType"].reduce(
      (sum, key) => sum + params.getAll(key).length,
      0
    ) +
    (params.get("category") ? 1 : 0) +
    (params.get("minPrice") ? 1 : 0);

  const clearAll = () => {
    const next = new URLSearchParams();
    const q = params.get("q");
    if (q) next.set("q", q);
    router.push(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false });
  };

  const panel = (
    <div className="space-y-8">
      {activeCount > 0 && (
        <button onClick={clearAll} className="label flex items-center gap-2 text-clay">
          <X className="h-3 w-3" strokeWidth={2} />
          Clear all ({activeCount})
        </button>
      )}

      <Group title="Category">
        {facets.categories.map((category) => (
          <Option
            key={category.slug}
            label={category.name}
            checked={params.get("category") === category.slug}
            onChange={() =>
              apply((next) => {
                if (next.get("category") === category.slug) next.delete("category");
                else next.set("category", category.slug);
              })
            }
          />
        ))}
      </Group>

      <Group title="Price">
        {PRICE_BANDS.map((band) => (
          <Option
            key={band.label}
            label={band.label}
            checked={params.get("minPrice") === String(band.min)}
            onChange={() => setPrice(band)}
          />
        ))}
      </Group>

      <Group title="For">
        {GENDERS.map((gender) => (
          <Option
            key={gender}
            label={titleCase(gender)}
            checked={params.getAll("gender").includes(gender)}
            onChange={() => toggle("gender", gender)}
          />
        ))}
      </Group>

      <Group title="Frame Shape">
        {SHAPES.map((shape) => (
          <Option
            key={shape}
            label={titleCase(shape)}
            checked={params.getAll("shape").includes(shape)}
            onChange={() => toggle("shape", shape)}
          />
        ))}
      </Group>

      {facets.brands.length > 0 && (
        <Group title="Brand">
          {facets.brands.map((brand) => (
            <Option
              key={brand.slug}
              label={brand.name}
              checked={params.getAll("brand").includes(brand.slug)}
              onChange={() => toggle("brand", brand.slug)}
            />
          ))}
        </Group>
      )}

      <Group title="Rim">
        {FRAME_TYPES.map((type) => (
          <Option
            key={type}
            label={titleCase(type)}
            checked={params.getAll("frameType").includes(type)}
            onChange={() => toggle("frameType", type)}
          />
        ))}
      </Group>

      <Group title="Material">
        {MATERIALS.map((material) => (
          <Option
            key={material}
            label={material === "TR90" ? "TR90" : titleCase(material)}
            checked={params.getAll("material").includes(material)}
            onChange={() => toggle("material", material)}
          />
        ))}
      </Group>
    </div>
  );

  if (variant === "sidebar") {
    return <aside>{panel}</aside>;
  }

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="label flex items-center gap-2 border border-line px-5 py-3"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
        Filters {activeCount > 0 && <span className="text-brass">({activeCount})</span>}
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-[80]">
            <div className="absolute inset-0 bg-ink/45 animate-fade" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-paper animate-slide-left">
            <header className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="label-lg">Filters</h2>
              <button onClick={() => setMobileOpen(false)} aria-label="Close filters" className="p-1">
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-6">{panel}</div>
            <div className="border-t border-line p-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="btn-ink label w-full py-4"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="label w-full border-b border-line pb-2.5 text-ink">{title}</legend>
      <div className="mt-3.5 space-y-2.5">{children}</div>
    </fieldset>
  );
}

function Option({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 text-sm text-ink-soft transition-colors hover:text-ink">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center border transition-colors ${
          checked ? "border-brass bg-brass" : "border-line group-hover:border-ink-muted"
        }`}
      >
        {checked && <Check className="h-3 w-3 text-ink" strokeWidth={3} />}
      </span>
      {label}
    </label>
  );
}
