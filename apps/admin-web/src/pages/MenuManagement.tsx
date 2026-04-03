/**
 * Menu management — matches design-system admin-products.html: table + add form.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { addMenuItem, addMenuItemWithUpload, fetchAdminMenu, patchMenuItem, uploadMenuItemImage } from "../api/menu";
import { menuImageSrc } from "../lib/imageUrl";
import { colors, radius } from "../styles/tokens";
import type { MenuItem } from "../types/menu";

const BADGE: Record<string, { bg: string; color: string }> = {
  default: { bg: colors.teal50, color: colors.teal700 }
};

function categoryBadge(cat: string) {
  const key = cat.toLowerCase();
  if (key.includes("main") || key.includes("pizza")) return { bg: colors.amber100, color: colors.amber600 };
  if (key.includes("drink")) return { bg: colors.blue50, color: colors.blue500 };
  if (key.includes("starter") || key.includes("starters")) return { bg: colors.teal50, color: colors.teal700 };
  if (key.includes("salad")) return { bg: colors.green100, color: colors.green600 };
  return BADGE.default;
}

type Props = { token: string };

export default function MenuManagement({ token }: Props) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const data = await fetchAdminMenu(token);
    setItems(data);
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        await load();
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Load failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const categories = useMemo(() => {
    const s = new Set(items.map((i) => i.category));
    return ["", ...Array.from(s).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (catFilter && i.category !== catFilter) return false;
      if (!q) return true;
      return `${i.name} ${i.category}`.toLowerCase().includes(q);
    });
  }, [items, search, catFilter]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const p = parseFloat(price);
    if (!name.trim() || Number.isNaN(p)) return;
    setSaving(true);
    setError(null);
    try {
      const created = imageFile
        ? await addMenuItemWithUpload(token, {
            category: category.trim() || "General",
            name: name.trim(),
            price: p,
            description: description.trim() || undefined,
            imageFile
          })
        : await addMenuItem(token, {
            category: category.trim() || "General",
            name: name.trim(),
            price: p,
            description: description.trim() || undefined
          });
      setItems((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setImageFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(item: MenuItem) {
    try {
      const updated = await patchMenuItem(token, item.id, { isAvailable: !item.isAvailable });
      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function onPickRowImage(item: MenuItem, file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      const updated = await uploadMenuItemImage(token, item.id, file);
      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: colors.slate900 }}>Menu Management</div>
        <div style={{ fontSize: 14, color: colors.slate500, marginTop: 4 }}>Add, edit, and organize your restaurant menu</div>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", color: "#b91c1c", padding: 12, borderRadius: radius.md, marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(300px, 400px)",
          gap: 24,
          alignItems: "start"
        }}
        className="admin-menu-grid"
      >
        <style>{`
          @media (max-width: 900px) {
            .admin-menu-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* Products panel */}
        <div style={{ background: colors.white, borderRadius: radius.lg, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              padding: "20px 22px",
              borderBottom: `1px solid ${colors.slate100}`
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
              All items <span style={{ color: colors.slate400, fontWeight: 400 }}>({items.length})</span>
            </h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="search"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: radius.md,
                  border: `1px solid ${colors.slate200}`,
                  fontSize: 13,
                  minWidth: 160
                }}
              />
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                style={{
                  padding: "8px 32px 8px 12px",
                  borderRadius: radius.md,
                  border: `1px solid ${colors.slate200}`,
                  fontSize: 13,
                  background: colors.white
                }}
              >
                <option value="">All categories</option>
                {categories.filter(Boolean).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p style={{ padding: 24, color: colors.slate500 }}>Loading…</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "12px 16px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: colors.slate400,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        borderBottom: `1px solid ${colors.slate100}`,
                        background: colors.slate50
                      }}
                    >
                      Item
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "12px 16px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: colors.slate400,
                        textTransform: "uppercase",
                        borderBottom: `1px solid ${colors.slate100}`,
                        background: colors.slate50
                      }}
                    >
                      Price
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "12px 16px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: colors.slate400,
                        textTransform: "uppercase",
                        borderBottom: `1px solid ${colors.slate100}`,
                        background: colors.slate50
                      }}
                    >
                      Category
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "12px 16px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: colors.slate400,
                        textTransform: "uppercase",
                        borderBottom: `1px solid ${colors.slate100}`,
                        background: colors.slate50
                      }}
                    >
                      Image
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "12px 16px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: colors.slate400,
                        textTransform: "uppercase",
                        borderBottom: `1px solid ${colors.slate100}`,
                        background: colors.slate50
                      }}
                    >
                      Available
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const b = categoryBadge(item.category);
                    return (
                      <tr
                        key={item.id}
                        style={{
                          opacity: item.isAvailable ? 1 : 0.55,
                          borderBottom: `1px solid ${colors.slate100}`
                        }}
                      >
                        <td style={{ padding: "14px 16px", fontSize: 14, verticalAlign: "middle" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 10,
                                flexShrink: 0,
                                overflow: "hidden",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 22,
                                background: `linear-gradient(135deg, ${colors.teal50}, ${colors.slate100})`
                              }}
                            >
                              {menuImageSrc(item.imageUrl) ? (
                                <img
                                  src={menuImageSrc(item.imageUrl)!}
                                  alt=""
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              ) : (
                                "🍽"
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{item.name}</div>
                              {item.description && (
                                <div style={{ fontSize: 12, color: colors.slate400 }}>{item.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", fontWeight: 600 }}>₹{item.price.toFixed(0)}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "5px 12px",
                              borderRadius: 9999,
                              fontSize: 12,
                              fontWeight: 600,
                              background: b.bg,
                              color: b.color
                            }}
                          >
                            {item.category}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 12 }}>
                          <label
                            style={{
                              cursor: "pointer",
                              color: colors.teal600,
                              fontWeight: 600,
                              textDecoration: "underline"
                            }}
                          >
                            {item.imageUrl ? "Replace" : "Upload"}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/gif"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                onPickRowImage(item, e.target.files?.[0]);
                                e.target.value = "";
                              }}
                            />
                          </label>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={item.isAvailable}
                            onClick={() => toggleAvailability(item)}
                            style={{
                              width: 40,
                              height: 22,
                              borderRadius: 11,
                              border: "none",
                              cursor: "pointer",
                              position: "relative",
                              background: item.isAvailable ? colors.teal500 : colors.slate200,
                              transition: "background 0.2s"
                            }}
                          >
                            <span
                              style={{
                                position: "absolute",
                                top: 2,
                                left: item.isAvailable ? 20 : 2,
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                background: colors.white,
                                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                transition: "left 0.2s"
                              }}
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add form */}
        <div
          style={{
            background: colors.white,
            borderRadius: radius.lg,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            padding: 24
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>+ Add new item</div>
          <form onSubmit={handleAdd}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: colors.slate600, marginBottom: 6 }}>
                Item name <span style={{ color: colors.coral400 }}>*</span>
              </label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mushroom Risotto"
                required
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: radius.md,
                  border: `1.5px solid ${colors.slate200}`,
                  fontSize: 14,
                  boxSizing: "border-box"
                }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: colors.slate600, marginBottom: 6 }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ingredients, style notes…"
                rows={3}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: radius.md,
                  border: `1.5px solid ${colors.slate200}`,
                  fontSize: 14,
                  resize: "vertical",
                  boxSizing: "border-box",
                  fontFamily: "inherit"
                }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: colors.slate600, marginBottom: 6 }}>
                Photo <span style={{ fontWeight: 400, color: colors.slate400 }}>(optional, max 5MB)</span>
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                style={{ fontSize: 13 }}
              />
              {imageFile && (
                <div style={{ fontSize: 12, color: colors.slate500, marginTop: 6 }}>Selected: {imageFile.name}</div>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: colors.slate600, marginBottom: 6 }}>
                  Price (₹) <span style={{ color: colors.coral400 }}>*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="320"
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: radius.md,
                    border: `1.5px solid ${colors.slate200}`,
                    fontSize: 14,
                    boxSizing: "border-box"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: colors.slate600, marginBottom: 6 }}>
                  Category <span style={{ color: colors.coral400 }}>*</span>
                </label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Starters, Main…"
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: radius.md,
                    border: `1.5px solid ${colors.slate200}`,
                    fontSize: 14,
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%",
                padding: "14px",
                fontSize: 15,
                fontWeight: 600,
                border: "none",
                borderRadius: radius.md,
                background: colors.teal600,
                color: colors.white,
                cursor: saving ? "wait" : "pointer"
              }}
            >
              {saving ? "Saving…" : "Add to menu"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
