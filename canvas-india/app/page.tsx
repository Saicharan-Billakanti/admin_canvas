"use client";

import { useState, useCallback } from "react";
import {
  CATEGORIES,
  SHAPES,
  MATERIALS,
  FINISHES,
} from "@/app/lib/validation";

const SHAPE_CATEGORIES = ["Canvas", "Acrylic"] as const;

const PRESET_SIZES = [
  '8" x 8"',
  '11" x 14"',
  '12" x 12"',
  '16" x 16"',
  '18" x 24"',
  '16" x 20"',
  '24" x 36"',
  '30" x 40"',
];

interface Variant {
  shape: string;
  size: string;
  material: string;
  finish: string;
  price: string;
  compareAtPrice: string;
  startingStock: string;
}

interface FieldErrors {
  productCode?: string[];
  productName?: string[];
  category?: string[];
  mainImageUrl?: string[];
  variants?: Record<number, Record<string, string[]>>;
  _form?: string[];
}

const emptyVariant = (): Variant => ({
  shape: "",
  size: "",
  material: "",
  finish: "",
  price: "",
  compareAtPrice: "",
  startingStock: "",
});

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <div className="ci-error-msg">
      <span>⚠</span>
      {errors[0]}
    </div>
  );
}

export default function HomePage() {
  const [productCode, setProductCode] = useState("");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [additionalImageUrls, setAdditionalImageUrls] = useState("");
  const [variants, setVariants] = useState<Variant[]>([emptyVariant()]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const showShape = SHAPE_CATEGORIES.includes(
    category as (typeof SHAPE_CATEGORIES)[number]
  );

  const addVariant = () => setVariants((v) => [...v, emptyVariant()]);

  const removeVariant = (idx: number) =>
    setVariants((v) => v.filter((_, i) => i !== idx));

  const updateVariant = useCallback(
    (idx: number, field: keyof Variant, value: string) => {
      setVariants((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], [field]: value };
        return next;
      });
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);
    setSubmitting(true);

    const payload = {
      productCode: productCode.trim(),
      productName: productName.trim(),
      category,
      description: description.trim() || null,
      mainImageUrl: mainImageUrl.trim(),
      additionalImageUrls: additionalImageUrls.trim() || null,
      variants: variants.map((v) => ({
        shape: v.shape || null,
        size: v.size.trim(),
        material: v.material || null,
        finish: v.finish || null,
        price: v.price === "" ? undefined : parseFloat(v.price),
        compareAtPrice:
          v.compareAtPrice === "" ? null : parseFloat(v.compareAtPrice),
        startingStock: v.startingStock === "" ? undefined : parseInt(v.startingStock, 10),
      })),
    };

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422 && data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ _form: [data.message ?? "Submission failed. Please try again."] });
        }
        return;
      }

      // Success — reset form
      setSuccess(true);
      setProductCode("");
      setProductName("");
      setCategory("");
      setDescription("");
      setMainImageUrl("");
      setAdditionalImageUrls("");
      setVariants([emptyVariant()]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErrors({ _form: ["Network error. Please check your connection and try again."] });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-shell">
      {/* Header */}
      <header className="page-header">
        <div className="page-logo">
          <div className="page-logo-icon">🖼️</div>
          <span
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              letterSpacing: "0.02em",
              color: "var(--color-text)",
            }}
          >
            Canvas India
          </span>
        </div>
        <h1 className="page-title">Product Catalog Submission</h1>
        <p className="page-subtitle">
          Fill in the product details below. Add as many size/finish variants as
          needed.
        </p>
      </header>

      {/* Success banner */}
      {success && (
        <div className="ci-banner ci-banner-success mb-4">
          <span style={{ fontSize: "1.1rem" }}>✅</span>
          <div>
            <strong>Product submitted successfully!</strong>
            <br />
            <span style={{ fontSize: "0.82rem" }}>
              Your product variants have been saved to the catalog.
            </span>
          </div>
        </div>
      )}

      {/* Form-level error */}
      {errors._form && (
        <div className="ci-banner ci-banner-error mb-4">
          <span style={{ fontSize: "1rem" }}>⛔</span>
          <span>{errors._form[0]}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* ── Product Details Card ── */}
        <div className="ci-card mb-4">
          <div className="ci-card-header">
            <span style={{ fontSize: "1.15rem" }}>📋</span>
            <span
              style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "0.01em" }}
            >
              Product Details
            </span>
          </div>
          <div className="ci-card-body space-y-4">
            <div className="grid-2">
              {/* Product Code */}
              <div>
                <label className="ci-label" htmlFor="productCode">
                  Product Code <span className="required">*</span>
                </label>
                <input
                  id="productCode"
                  className={`ci-input font-mono ${errors.productCode ? "error" : ""}`}
                  placeholder="e.g. CNV-001"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  autoComplete="off"
                />
                <FieldError errors={errors.productCode} />
              </div>

              {/* Product Name */}
              <div>
                <label className="ci-label" htmlFor="productName">
                  Product Name <span className="required">*</span>
                </label>
                <input
                  id="productName"
                  className={`ci-input ${errors.productName ? "error" : ""}`}
                  placeholder="e.g. Botanical Garden Canvas"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
                <FieldError errors={errors.productName} />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="ci-label" htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                className={`ci-select ${errors.category ? "error" : ""}`}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">— Select a category —</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <FieldError errors={errors.category} />
            </div>

            {/* Description */}
            <div>
              <label className="ci-label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                className="ci-textarea"
                placeholder="Optional product description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Images Card ── */}
        <div className="ci-card mb-4">
          <div className="ci-card-header">
            <span style={{ fontSize: "1.15rem" }}>🖼️</span>
            <span
              style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "0.01em" }}
            >
              Images
            </span>
          </div>
          <div className="ci-card-body space-y-4">
            <div>
              <label className="ci-label" htmlFor="mainImageUrl">
                Main Image URL <span className="required">*</span>
              </label>
              <input
                id="mainImageUrl"
                type="url"
                className={`ci-input ${errors.mainImageUrl ? "error" : ""}`}
                placeholder="https://res.cloudinary.com/..."
                value={mainImageUrl}
                onChange={(e) => setMainImageUrl(e.target.value)}
              />
              <FieldError errors={errors.mainImageUrl} />
            </div>

            <div>
              <label className="ci-label" htmlFor="additionalImageUrls">
                Additional Image URLs
              </label>
              <input
                id="additionalImageUrls"
                type="text"
                className="ci-input"
                placeholder="Comma-separated URLs: https://..., https://..."
                value={additionalImageUrls}
                onChange={(e) => setAdditionalImageUrls(e.target.value)}
              />
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-muted)",
                  marginTop: "0.3rem",
                }}
              >
                Separate multiple Cloudinary URLs with commas
              </div>
            </div>
          </div>
        </div>

        {/* ── Variants Card ── */}
        <div className="ci-card mb-4">
          <div className="ci-card-header">
            <span style={{ fontSize: "1.15rem" }}>📐</span>
            <span
              style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "0.01em" }}
            >
              Sizes &amp; Variants
            </span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: "0.75rem",
                color: "var(--color-muted)",
              }}
            >
              {variants.length} variant{variants.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="ci-card-body">
            <div className="space-y-4">
              {variants.map((variant, idx) => {
                const vErr = (errors.variants as any)?.[idx] ?? {};
                return (
                  <div key={idx} className="variant-block">
                    <div className="variant-block-header">
                      <span className="variant-num-badge">Variant {idx + 1}</span>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          className="ci-btn ci-btn-danger"
                          onClick={() => removeVariant(idx)}
                          aria-label={`Remove variant ${idx + 1}`}
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>

                    {/* Shape Section */}
                    {showShape && (
                      <div className="mb-4">
                        <label className="ci-label">Shape</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                          {SHAPES.map((s) => (
                            <button
                              key={s}
                              type="button"
                              className={`ci-pill ${variant.shape === s ? "active" : ""}`}
                              onClick={() => updateVariant(idx, "shape", s)}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                        <FieldError errors={vErr.shape} />
                      </div>
                    )}

                    {/* Size Section */}
                    <div className="mb-4">
                      <label className="ci-label">Size <span className="required">*</span></label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                        {PRESET_SIZES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={`ci-pill ${variant.size === s ? "active" : ""}`}
                            onClick={() => updateVariant(idx, "size", s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      
                      {/* Custom Size Option */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text)" }}>Custom Size:</span>
                        <input
                          type="text"
                          className={`ci-input ${vErr.size && !PRESET_SIZES.includes(variant.size) ? "error" : ""}`}
                          style={{ width: "200px" }}
                          placeholder='e.g. 10" x 15"'
                          value={!PRESET_SIZES.includes(variant.size) ? variant.size : ""}
                          onChange={(e) => updateVariant(idx, "size", e.target.value)}
                          onFocus={() => {
                            if (PRESET_SIZES.includes(variant.size)) updateVariant(idx, "size", "");
                          }}
                        />
                      </div>
                      <FieldError errors={vErr.size} />
                    </div>

                    <div className="grid-3">
                      {/* Material */}
                      <div>
                        <label
                          className="ci-label"
                          htmlFor={`material-${idx}`}
                        >
                          Material
                        </label>
                        <select
                          id={`material-${idx}`}
                          className={`ci-select ${vErr.material ? "error" : ""}`}
                          value={variant.material}
                          onChange={(e) =>
                            updateVariant(idx, "material", e.target.value)
                          }
                        >
                          <option value="">— Select —</option>
                          {MATERIALS.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                        <FieldError errors={vErr.material} />
                      </div>

                    <div className="grid-3 mt-3">
                      {/* Finish */}
                      <div>
                        <label
                          className="ci-label"
                          htmlFor={`finish-${idx}`}
                        >
                          Finish / Style
                        </label>
                        <select
                          id={`finish-${idx}`}
                          className={`ci-select ${vErr.finish ? "error" : ""}`}
                          value={variant.finish}
                          onChange={(e) =>
                            updateVariant(idx, "finish", e.target.value)
                          }
                        >
                          <option value="">— Select —</option>
                          {FINISHES.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                        <FieldError errors={vErr.finish} />
                      </div>

                      {/* Price */}
                      <div>
                        <label
                          className="ci-label"
                          htmlFor={`price-${idx}`}
                        >
                          Price (₹) <span className="required">*</span>
                        </label>
                        <input
                          id={`price-${idx}`}
                          type="number"
                          min="0"
                          step="0.01"
                          className={`ci-input ${vErr.price ? "error" : ""}`}
                          placeholder="0.00"
                          value={variant.price}
                          onChange={(e) =>
                            updateVariant(idx, "price", e.target.value)
                          }
                        />
                        <FieldError errors={vErr.price} />
                      </div>

                      {/* Compare-at */}
                      <div>
                        <label
                          className="ci-label"
                          htmlFor={`compareAtPrice-${idx}`}
                        >
                          Compare-at (₹)
                        </label>
                        <input
                          id={`compareAtPrice-${idx}`}
                          type="number"
                          min="0"
                          step="0.01"
                          className={`ci-input ${vErr.compareAtPrice ? "error" : ""}`}
                          placeholder="Original price (optional)"
                          value={variant.compareAtPrice}
                          onChange={(e) =>
                            updateVariant(idx, "compareAtPrice", e.target.value)
                          }
                        />
                        <FieldError errors={vErr.compareAtPrice} />
                      </div>
                    </div>

                    <div style={{ maxWidth: "240px" }} className="mt-3">
                      <label
                        className="ci-label"
                        htmlFor={`startingStock-${idx}`}
                      >
                        Starting Stock <span className="required">*</span>
                      </label>
                      <input
                        id={`startingStock-${idx}`}
                        type="number"
                        min="0"
                        step="1"
                        className={`ci-input ${vErr.startingStock ? "error" : ""}`}
                        placeholder="e.g. 50"
                        value={variant.startingStock}
                        onChange={(e) =>
                          updateVariant(idx, "startingStock", e.target.value)
                        }
                      />
                      <FieldError errors={vErr.startingStock} />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="ci-btn ci-btn-secondary mt-4"
              onClick={addVariant}
            >
              <span style={{ fontSize: "1.1rem" }}>+</span>
              Add Another Size / Finish
            </button>
          </div>
        </div>

        {/* Submit */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: "0.5rem",
          }}
        >
          <button
            type="submit"
            className="ci-btn ci-btn-primary"
            id="submit-btn"
            disabled={submitting}
            style={{ minWidth: "200px", fontSize: "1rem" }}
          >
            {submitting ? (
              <>
                <span className="spinner" />
                Saving…
              </>
            ) : (
              <>
                <span>🚀</span>
                Submit Product
              </>
            )}
          </button>
        </div>
      </form>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: "3rem",
          fontSize: "0.78rem",
          color: "var(--color-muted)",
        }}
      >
        Canvas India &mdash; Internal Catalog Tool &bull;{" "}
        <a
          href="/admin"
          style={{
            color: "var(--color-accent-light)",
            textDecoration: "none",
          }}
        >
          Admin Panel →
        </a>
      </div>

      <style>{`
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
