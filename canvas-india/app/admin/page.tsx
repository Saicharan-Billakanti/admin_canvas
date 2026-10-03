"use client";

import { useEffect, useState, useCallback } from "react";

interface Row {
  id: string;
  productCode: string;
  productName: string;
  category: string;
  shape: string | null;
  size: string;
  allowCustomSize: boolean;
  customSizeLimit: string | null;
  finish: string | null;
  price: number;
  compareAtPrice: number | null;
  startingStock: number;
  description: string | null;
  mainImageUrl: string;
  additionalImageUrls: string | null;
  createdAt: string;
}

interface AdminData {
  rows: Row[];
  total: number;
  distinctProducts: number;
}

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const EditModal = ({ row, onClose, onSave }: { row: Row, onClose: () => void, onSave: (r: Row) => void }) => {
  const [formData, setFormData] = useState<Row>(row);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/rows/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      onSave(updated);
    } catch {
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
      <div className="ci-card" style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", padding: "2rem" }}>
        <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem", fontWeight: 700 }}>Edit Variant ({formData.productCode})</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label className="ci-label">Product Name</label>
            <input required className="ci-input" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="ci-label">Price (₹)</label>
              <input required type="number" step="0.01" className="ci-input" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="ci-label">Compare-at (₹)</label>
              <input type="number" step="0.01" className="ci-input" value={formData.compareAtPrice ?? ""} onChange={e => setFormData({...formData, compareAtPrice: e.target.value ? parseFloat(e.target.value) : null})} />
            </div>
            <div>
              <label className="ci-label">Size</label>
              <input required className="ci-input" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} />
            </div>
            <div>
              <label className="ci-label">Starting Stock</label>
              <input required type="number" className="ci-input" value={formData.startingStock} onChange={e => setFormData({...formData, startingStock: parseInt(e.target.value, 10)})} />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                <input type="checkbox" checked={formData.allowCustomSize} onChange={(e) => setFormData({...formData, allowCustomSize: e.target.checked})} style={{ width: "16px", height: "16px" }} />
                Enable "Custom Size" input for customers
              </label>
            </div>
            {formData.allowCustomSize && (
              <div style={{ gridColumn: "span 2" }}>
                <label className="ci-label">Custom Size Upper Limit (Optional)</label>
                <input className="ci-input" value={formData.customSizeLimit ?? ""} onChange={e => setFormData({...formData, customSizeLimit: e.target.value || null})} />
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button type="submit" className="ci-btn ci-btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
            <button type="button" className="ci-btn ci-btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<Row | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/rows");
      if (!res.ok) throw new Error("Failed to load data");
      const json = await res.json();
      setData(json);
    } catch {
      setError("Could not load submissions. Is the database connected?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }
    setDeletingId(id);
    setDeleteConfirm(null);
    try {
      await fetch(`/api/admin/rows/${id}`, { method: "DELETE" });
      setData((prev) =>
        prev
          ? {
              ...prev,
              rows: prev.rows.filter((r) => r.id !== id),
              total: prev.total - 1,
              distinctProducts: new Set(
                prev.rows.filter((r) => r.id !== id).map((r) => r.productCode)
              ).size,
            }
          : null
      );
    } catch {
      alert("Failed to delete row");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `canvas-india-catalog-${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleEditSave = (updatedRow: Row) => {
    setData((prev) => prev ? {
      ...prev,
      rows: prev.rows.map(r => r.id === updatedRow.id ? updatedRow : r)
    } : null);
    setEditingRow(null);
  };

  return (
    <main style={{ padding: "2rem 1.25rem 4rem", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div className="flex items-center gap-3 mb-2">
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "linear-gradient(135deg, var(--color-accent), #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
              boxShadow: "0 4px 12px rgba(108,99,255,0.4)",
            }}
          >
            🗂️
          </div>
          <div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                background: "linear-gradient(135deg, #fff 30%, var(--color-accent-light))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Admin Panel
            </h1>
            <p className="text-muted text-sm">Canvas India — Product Catalog</p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem" }}>
            <a href="/" className="ci-btn ci-btn-secondary">
              ← Submission Form
            </a>
            <button
              id="export-btn"
              className="ci-btn ci-btn-success"
              onClick={handleExport}
              disabled={exporting || !data?.total}
            >
              {exporting ? "⏳ Exporting…" : "📥 Download Excel"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {data && (
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <div className="stat-chip">
            <span className="stat-chip-value">{data.total}</span>
            <span className="stat-chip-label">Total Variants</span>
          </div>
          <div className="stat-chip">
            <span className="stat-chip-value">{data.distinctProducts}</span>
            <span className="stat-chip-label">Distinct Products</span>
          </div>
          <div className="stat-chip">
            <span className="stat-chip-value">
              {data.rows.length > 0
                ? formatDate(data.rows[0].createdAt).split(",")[0]
                : "—"}
            </span>
            <span className="stat-chip-label">Latest Submission</span>
          </div>
        </div>
      )}

      {/* States */}
      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "4rem",
            color: "var(--color-muted)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              width: 32,
              height: 32,
              border: "3px solid rgba(108,99,255,0.3)",
              borderTopColor: "var(--color-accent)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              marginBottom: "1rem",
            }}
          />
          <p>Loading submissions…</p>
        </div>
      )}

      {error && (
        <div className="ci-banner ci-banner-error mb-4">
          <span>⛔</span>
          <span>{error}</span>
        </div>
      )}

      {!loading && data && data.rows.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "4rem",
            color: "var(--color-muted)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
          <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>No submissions yet</p>
          <p className="text-sm mt-2">
            Products submitted via the{" "}
            <a href="/" style={{ color: "var(--color-accent-light)" }}>
              form
            </a>{" "}
            will appear here.
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && data && data.rows.length > 0 && (
        <div className="ci-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Shape</th>
                  <th>Size</th>
                  <th>Custom Size?</th>
                  <th>Size Limit</th>
                  <th>Finish</th>
                  <th>Price</th>
                  <th>Compare-at</th>
                  <th>Stock</th>
                  <th>Image</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <code
                        style={{
                          background: "rgba(108,99,255,0.1)",
                          padding: "2px 6px",
                          borderRadius: 4,
                          fontSize: "0.78rem",
                          color: "var(--color-accent-light)",
                        }}
                      >
                        {row.productCode}
                      </code>
                    </td>
                    <td title={row.productName}>{row.productName}</td>
                    <td>
                      <span
                        style={{
                          background: "rgba(255,255,255,0.07)",
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontSize: "0.76rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.category}
                      </span>
                    </td>
                    <td>{row.shape ?? <span className="text-muted">—</span>}</td>
                    <td>{row.size}</td>
                    <td>{row.allowCustomSize ? <span className="text-success">Yes</span> : <span className="text-muted">No</span>}</td>
                    <td>{row.customSizeLimit ?? <span className="text-muted">—</span>}</td>
                    <td title={row.finish ?? ""}>{row.finish ?? <span className="text-muted">—</span>}</td>
                    <td style={{ fontWeight: 600, color: "var(--color-success)" }}>
                      {formatINR(row.price)}
                    </td>
                    <td>
                      {row.compareAtPrice != null ? (
                        <span style={{ textDecoration: "line-through", color: "var(--color-muted)" }}>
                          {formatINR(row.compareAtPrice)}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>{row.startingStock}</td>
                    <td>
                      <a
                        href={row.mainImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "var(--color-accent-light)",
                          fontSize: "0.78rem",
                          textDecoration: "none",
                        }}
                        title={row.mainImageUrl}
                      >
                        🔗 View
                      </a>
                    </td>
                    <td style={{ color: "var(--color-muted)", fontSize: "0.78rem" }}>
                      {formatDate(row.createdAt)}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className="ci-btn ci-btn-secondary"
                          onClick={() => setEditingRow(row)}
                          style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                        >
                          ✎ Edit
                        </button>
                        <button
                          className="ci-btn ci-btn-danger"
                          onClick={() => handleDelete(row.id)}
                          disabled={deletingId === row.id}
                          title={deleteConfirm === row.id ? "Click again to confirm" : "Delete this row"}
                          style={{
                            padding: "0.25rem 0.5rem",
                            fontSize: "0.75rem",
                            borderColor: deleteConfirm === row.id ? "var(--color-error)" : undefined,
                            background: deleteConfirm === row.id ? "rgba(239,68,68,0.25)" : undefined,
                          }}
                        >
                          {deletingId === row.id
                            ? "…"
                            : deleteConfirm === row.id
                            ? "Confirm?"
                            : "✕ Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingRow && (
        <EditModal 
          row={editingRow} 
          onClose={() => setEditingRow(null)} 
          onSave={handleEditSave} 
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
