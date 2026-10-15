import type { Metadata } from "next";
import { Phone, Clock, MapPin } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { STORES } from "@/lib/stores";

export const metadata: Metadata = {
  title: "Find a Store",
  description: "Six Broadway Opticals stores across Delhi NCR. Free eye tests and fittings at all of them.",
};

export default function StoresPage() {
  return (
    <>
      <PageHeader
        eyebrow="Find a Store"
        title={
          <>
            Six counters across <em>Delhi NCR.</em>
          </>
        }
        blurb="Every store offers a complimentary eye test, lens consultation and frame fitting — walk in, or call ahead and we'll keep a slot."
      />

      <ul className="mx-auto grid max-w-[1500px] gap-5 px-5 pb-24 md:grid-cols-2 lg:grid-cols-3 lg:px-10">
        {STORES.map((store) => (
          <li
            key={store.name}
            className={`border p-7 ${
              "flagship" in store && store.flagship
                ? "deco-frame border-brass/50 bg-paper-raised"
                : "border-line bg-paper-raised"
            }`}
          >
            {"flagship" in store && store.flagship && (
              <p className="label mb-4 text-brass">Flagship · Since 1974</p>
            )}
            <h2 className="display text-2xl">{store.name}</h2>

            <dl className="mt-5 space-y-3.5 text-sm text-ink-soft">
              <div className="flex gap-3">
                <dt className="sr-only">Address</dt>
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brass" strokeWidth={1.5} />
                <dd className="leading-relaxed">{store.address}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="sr-only">Phone</dt>
                <Phone className="h-4 w-4 shrink-0 text-brass" strokeWidth={1.5} />
                <dd>
                  <a href={`tel:${store.phone.replace(/\s/g, "")}`} className="hover:text-ink">
                    {store.phone}
                  </a>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="sr-only">Hours</dt>
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brass" strokeWidth={1.5} />
                <dd className="leading-relaxed">{store.hours}</dd>
              </div>
            </dl>

            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(
                `Broadway Opticals ${store.address}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="label link-rule mt-6 inline-block text-ink-soft"
            >
              Get directions →
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
