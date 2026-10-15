"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, MapPin } from "lucide-react";

type Address = {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

export function AddressManager({ initial }: { initial: Address[] }) {
  const [addresses, setAddresses] = useState(initial);
  const [adding, setAdding] = useState(initial.length === 0);
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") ?? ""),
        phone: String(form.get("phone") ?? ""),
        line1: String(form.get("line1") ?? ""),
        line2: String(form.get("line2") ?? ""),
        city: String(form.get("city") ?? ""),
        state: String(form.get("state") ?? ""),
        pincode: String(form.get("pincode") ?? ""),
        isDefault: form.get("isDefault") === "on",
      }),
    });

    const data = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      toast.error(data.error ?? "Could not save the address.");
      return;
    }

    // Saving a new default demotes the old one server-side; mirror that here
    // so the list doesn't briefly show two defaults.
    setAddresses((prev) =>
      data.address.isDefault
        ? [data.address, ...prev.map((a) => ({ ...a, isDefault: false }))]
        : [...prev, data.address]
    );
    setAdding(false);
    toast.success("Address saved");
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not remove the address.");
      return;
    }
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success("Address removed");
  };

  return (
    <div className="space-y-8">
      {addresses.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <li key={address.id} className="relative border border-line bg-paper-raised p-6">
              {address.isDefault && (
                <span className="label absolute right-4 top-4 text-brass">Default</span>
              )}
              <MapPin className="h-4 w-4 text-brass" strokeWidth={1.5} />
              <p className="mt-3 font-display text-lg">{address.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {address.line1}
                {address.line2 && <>, {address.line2}</>}
                <br />
                {address.city}, {address.state} {address.pincode}
                <br />
                {address.phone}
              </p>
              <button
                onClick={() => handleDelete(address.id)}
                className="label mt-5 flex items-center gap-2 text-ink-muted transition-colors hover:text-clay"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <form onSubmit={handleAdd} className="border border-line bg-paper-raised p-7">
          <h2 className="label-lg">New Address</h2>
          <hr className="rule-deco mt-4 mb-6" />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="name" label="Full name" required />
            <Field name="phone" label="Phone" type="tel" required />
            <div className="sm:col-span-2">
              <Field name="line1" label="Address" required />
            </div>
            <div className="sm:col-span-2">
              <Field name="line2" label="Apartment, landmark (optional)" />
            </div>
            <Field name="city" label="City" required />
            <Field name="state" label="State" required />
            <Field name="pincode" label="PIN code" inputMode="numeric" maxLength={6} required />
          </div>

          <label className="mt-6 flex items-center gap-3 text-sm text-ink-soft">
            <input type="checkbox" name="isDefault" className="h-4 w-4 accent-[#B08D4F]" />
            Make this my default address
          </label>

          <div className="mt-7 flex flex-wrap gap-3">
            <button type="submit" disabled={submitting} className="btn-ink label px-9 py-3.5">
              {submitting ? "Saving…" : "Save Address"}
            </button>
            {addresses.length > 0 && (
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="btn-outline label px-9 py-3.5"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="label flex w-full items-center justify-center gap-2.5 border border-dashed border-line py-8 text-ink-muted transition-colors hover:border-brass hover:text-brass"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Add a New Address
        </button>
      )}
    </div>
  );
}

function Field({
  name,
  label,
  ...props
}: { name: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="label text-ink-muted">{label}</span>
      <input name={name} className="field mt-1.5" {...props} />
    </label>
  );
}
