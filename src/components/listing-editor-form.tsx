"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { archiveListingAction, publishListingAction, saveListingAction } from "@/app/moje-inzeraty/[id]/upravit/actions";
import { CityPicker } from "@/components/city-picker";
import { DeadlinePicker } from "@/components/deadline-picker";
import { StreetPicker } from "@/components/street-picker";
import { getPropertyLabel, getTransactionLabel } from "@/lib/labels";
import { formFromProperty, type ListingForm } from "@/lib/listing-form";
import { getFurnishingLabel, getUtilitiesLabel, type Property, type PropertyType, type TransactionType } from "@/lib/property";
import { t } from "@/i18n";

const TRANSACTIONS: TransactionType[] = ["SALE", "RENT"];
const PROPERTY_TYPES: PropertyType[] = ["APARTMENT", "HOUSE", "LAND", "COMMERCIAL", "OTHER"];

function inputCls() {
  return "w-full rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-text-primary focus:border-accent-deep focus:outline-none";
}

export function ListingEditorForm({ property }: { property: Property }) {
  const router = useRouter();
  const [form, setForm] = useState<ListingForm>(() => formFromProperty(property));
  const [saving, startSaving] = useTransition();
  const [publishing, startPublishing] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const transactionLabel = getTransactionLabel(t);
  const propertyLabel = getPropertyLabel(t);
  const furnishingLabel = getFurnishingLabel(t);
  const utilitiesLabel = getUtilitiesLabel(t);
  const isRent = form.transaction_type === "RENT";
  const isFlat = form.property_type === "APARTMENT";

  function set<K extends keyof ListingForm>(key: K, value: ListingForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function save() {
    setError(null);
    startSaving(async () => {
      try {
        await saveListingAction(property.id, form);
        setSavedAt(Date.now());
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Uloženie zlyhalo");
      }
    });
  }

  function publish() {
    setError(null);
    startPublishing(async () => {
      try {
        await saveListingAction(property.id, form);
        await publishListingAction(property.id);
        router.push(`/inzerat/${property.id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Zverejnenie zlyhalo");
      }
    });
  }

  function archive() {
    if (!window.confirm("Stiahnuť inzerát z ponuky?")) return;
    startSaving(async () => {
      try {
        await archiveListingAction(property.id);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Zlyhalo");
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-primary">Typ obchodu</span>
        <div className="flex gap-2">
          {TRANSACTIONS.map((tr) => (
            <button
              key={tr}
              type="button"
              onClick={() => set("transaction_type", tr)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                form.transaction_type === tr
                  ? "border-accent-deep bg-accent-soft text-accent-deep"
                  : "border-border bg-surface text-text-secondary"
              }`}
            >
              {transactionLabel[tr]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-primary">Typ nehnuteľnosti</label>
        <select
          value={form.property_type}
          onChange={(e) => set("property_type", e.target.value as PropertyType)}
          className={inputCls() + " w-fit"}
        >
          {PROPERTY_TYPES.map((pt) => (
            <option key={pt} value={pt}>
              {propertyLabel[pt]}
            </option>
          ))}
        </select>
      </div>

      <Field label="Názov inzerátu" value={form.title} onChange={(v) => set("title", v)} placeholder="napr. 3-izbový byt, Ružinov" />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-primary">Popis</label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={5}
          className={inputCls()}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">Mesto</label>
          <CityPicker
            value={form.city}
            onPick={(picked) => {
              setForm((f) => ({
                ...f,
                city: picked.city,
                district: picked.district,
                region: picked.region,
                latitude: picked.latitude,
                longitude: picked.longitude,
              }));
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-primary">Ulica (nepovinné)</label>
          <StreetPicker
            city={form.city}
            district={form.district}
            value={form.street}
            onChange={(v) => set("street", v)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {form.property_type !== "LAND" ? (
          <Field label="Počet izieb" value={form.rooms} onChange={(v) => set("rooms", v)} inputMode="numeric" />
        ) : null}
        <Field label="Výmera (m²)" value={form.area} onChange={(v) => set("area", v)} inputMode="numeric" />
        <Field
          label={isRent ? "Nájom (€/mesiac, nepovinné)" : "Orientačná cena (€, nepovinné)"}
          value={form.price}
          onChange={(v) => set("price", v)}
          inputMode="decimal"
        />
      </div>

      {isFlat ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Byt — podrobnosti</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Poschodie" value={form.floor} onChange={(v) => set("floor", v)} inputMode="numeric" />
            <Field label="Poschodí spolu" value={form.floorsTotal} onChange={(v) => set("floorsTotal", v)} inputMode="numeric" />
            <Field label="Mesačné náklady (€)" value={form.monthlyCosts} onChange={(v) => set("monthlyCosts", v)} inputMode="numeric" />
          </div>
          <BoolChoice label="Výťah" value={form.hasElevator} onChange={(v) => set("hasElevator", v)} />
        </div>
      ) : null}

      {isRent ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Prenájom — podmienky</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Zábezpeka (€)" value={form.deposit} onChange={(v) => set("deposit", v)} inputMode="numeric" />
            <Field label="Zábezpeka (počet nájmov)" value={form.depositMonths} onChange={(v) => set("depositMonths", v)} inputMode="numeric" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">Dostupné od</label>
              <input
                type="date"
                value={form.availableFrom ?? ""}
                onChange={(e) => set("availableFrom", e.target.value || null)}
                className={inputCls()}
              />
            </div>
            <Field label="Min. dĺžka nájmu (mesiacov)" value={form.minLease} onChange={(v) => set("minLease", v)} inputMode="numeric" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-primary">Zariadenie</span>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(furnishingLabel) as (keyof typeof furnishingLabel)[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => set("furnishing", k)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                    form.furnishing === k ? "border-accent-deep bg-accent-soft text-accent-deep" : "border-border bg-surface text-text-secondary"
                  }`}
                >
                  {furnishingLabel[k]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-text-primary">Energie v cene</span>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(utilitiesLabel) as (keyof typeof utilitiesLabel)[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => set("utilities", k)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                    form.utilities === k ? "border-accent-deep bg-accent-soft text-accent-deep" : "border-border bg-surface text-text-secondary"
                  }`}
                >
                  {utilitiesLabel[k]}
                </button>
              ))}
            </div>
          </div>
          <BoolChoice label="Internet v cene" value={form.internet} onChange={(v) => set("internet", v)} />
          <BoolChoice label="Zvieratá povolené" value={form.pets} onChange={(v) => set("pets", v)} />
        </div>
      ) : null}

      <DeadlinePicker defaultValue={form.offer_deadline} onChange={(v) => set("offer_deadline", v)} />

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-xl border border-border-strong bg-surface px-5 py-2.5 text-sm font-semibold text-text-primary hover:bg-surface-pressed disabled:opacity-60"
        >
          {saving ? "Ukladám…" : "Uložiť"}
        </button>
        {property.status === "DRAFT" ? (
          <button
            type="button"
            onClick={publish}
            disabled={publishing}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:opacity-90 disabled:opacity-60"
          >
            {publishing ? "Zverejňujem…" : "Zverejniť"}
          </button>
        ) : property.status === "ACTIVE" ? (
          <button
            type="button"
            onClick={archive}
            className="rounded-xl border border-danger bg-surface px-5 py-2.5 text-sm font-semibold text-danger hover:bg-danger/10"
          >
            Stiahnuť z ponuky
          </button>
        ) : null}
        {savedAt ? <span className="text-sm text-text-muted">Uložené.</span> : null}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "numeric" | "decimal";
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-primary">{label}</label>
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls()}
      />
    </div>
  );
}

function BoolChoice({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean | null) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-text-primary">{label}</span>
      <div className="flex gap-2">
        {[
          { v: true as const, label: "Áno" },
          { v: false as const, label: "Nie" },
        ].map((o) => (
          <button
            key={String(o.v)}
            type="button"
            onClick={() => onChange(o.v)}
            className={`rounded-full border px-3 py-1 text-sm font-medium ${
              value === o.v ? "border-accent-deep bg-accent-soft text-accent-deep" : "border-border bg-surface text-text-secondary"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
