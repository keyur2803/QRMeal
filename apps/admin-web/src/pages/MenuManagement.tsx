/**
 * Menu management — exact match to admin-products.html design.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { addMenuItem, addMenuItemWithUpload, deleteMenuItem, fetchAdminMenu, patchMenuItem, uploadMenuItemImage } from "../api/menu";
import { menuImageSrc } from "../lib/imageUrl";
import type { MenuItem } from "../types/menu";
import ConfirmModal from "../components/ConfirmModal";

const AVAILABLE_TAGS = [
  { id: "Vegetarian", label: "Vegetarian", icon: "🌿" },
  { id: "Vegan", label: "Vegan", icon: "🌱" },
  { id: "Gluten-free", label: "Gluten-free", icon: "🌾" },
  { id: "Dairy-free", label: "Dairy-free", icon: "🥛" },
  { id: "Spicy", label: "Spicy", icon: "🌶️" },
  { id: "Chef's Pick", label: "Chef's Pick", icon: "⭐" },
  { id: "Bestseller", label: "Bestseller", icon: "🏆" }
];

function categoryBadgeClass(cat: string) {
  const key = cat.toLowerCase();
  if (key.includes("main") || key.includes("pizza")) return "badge-amber";
  if (key.includes("drink")) return "badge-blue";
  if (key.includes("starter")) return "badge-teal";
  if (key.includes("salad")) return "badge-green";
  if (key.includes("dessert")) return "badge-slate";
  return "badge-teal";
}

type Props = { token: string };

export default function MenuManagement({ token }: Props) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All Categories");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [calories, setCalories] = useState("");
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [customization1, setCustomization1] = useState("");
  const [customization2, setCustomization2] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [confirm, setConfirm] = useState<null | { kind: "edit" | "delete"; item: MenuItem }>(null);

  function startEdit(item: MenuItem) {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description || "");
    setPrice(String(item.price));
    setCategory(item.category);
    setPrepTime(item.prepTime || "");
    setCalories(item.calories || "");
    setDietaryTags(item.dietaryTags || []);
    setCustomization1(item.customizations?.[0] || "");
    setCustomization2(item.customizations?.[1] || "");
    setImageFile(null);
  }

  function cancelEdit() {
    setEditingItem(null);
    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setPrepTime("");
    setCalories("");
    setDietaryTags([]);
    setCustomization1("");
    setCustomization2("");
    setImageFile(null);
  }

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
    return () => { cancelled = true; };
  }, [load]);

  const categories = useMemo(() => {
    const s = new Set(items.map((i) => i.category));
    return ["All Categories", ...Array.from(s).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (catFilter !== "All Categories" && i.category !== catFilter) return false;
      if (!q) return true;
      return (`${i.name} ${i.category}`).toLowerCase().includes(q);
    });
  }, [items, search, catFilter]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const p = parseFloat(price);
    if (!name.trim() || Number.isNaN(p) || !prepTime.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const customizations = [customization1.trim(), customization2.trim()].filter(Boolean);
      
      if (editingItem) {
        const updated = await patchMenuItem(token, editingItem.id, {
          name: name.trim(),
          category: category.trim() || "General",
          price: p,
          description: description.trim() || null,
          prepTime: prepTime.trim(),
          calories: calories.trim() || null,
          dietaryTags,
          customizations
        });
        let finalItem = updated;
        if (imageFile) {
          finalItem = await uploadMenuItemImage(token, editingItem.id, imageFile);
        }
        setItems((prev) => prev.map((x) => (x.id === finalItem.id ? finalItem : x)).sort((a, b) => a.name.localeCompare(b.name)));
        cancelEdit();
      } else {
        const basePayload = {
          category: category.trim() || "General",
          name: name.trim(),
          price: p,
          description: description.trim() || undefined,
          prepTime: prepTime.trim(),
          calories: calories.trim() || null,
          dietaryTags,
          customizations
        };
        const created = imageFile
          ? await addMenuItemWithUpload(token, { ...basePayload, imageFile })
          : await addMenuItem(token, basePayload);
        setItems((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        cancelEdit(); // resets form cleanly
      }
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

  async function handleDeleteConfirmed(item: MenuItem) {
    try {
      setError(null);
      await deleteMenuItem(token, item.id);
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      if (editingItem?.id === item.id) cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Menu Management</div>
          <div className="page-subtitle">Add, edit, and organize your restaurant menu</div>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", color: "#b91c1c", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      <div className="content-split">
        {/* Products List Panel */}
        <div className="products-panel">
          <div className="panel-head">
            <h3>All Menu Items <span style={{ color: "var(--slate-400)", fontWeight: 400 }}>({items.length})</span></h3>
            <div className="filter-row">
              <div className="search-box" style={{ padding: "8px 14px" }}>
                <span className="icon" style={{ fontSize: 14 }}>🔍</span>
                <input 
                  type="text" 
                  placeholder="Search items..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, width: 100 }}
                />
              </div>
              <select className="input" value={catFilter} onChange={(e) => setCatFilter(e.target.value)} style={{ width: "auto", padding: "8px 36px 8px 12px", fontSize: 13 }}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          
          {loading ? (
             <div style={{ padding: 24, textAlign: 'center', color: 'var(--slate-400)' }}>Loading menu items...</div>
          ) : (
            <table className="product-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id} style={{ opacity: item.isAvailable ? 1 : 0.5 }}>
                    <td>
                      <div className="prod-cell">
                        <div className="prod-img">
                          {menuImageSrc(item.imageUrl) ? (
                            <img src={menuImageSrc(item.imageUrl)!} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
                          ) : (
                            "🍽️"
                          )}
                        </div>
                        <div>
                          <div className="prod-name">{item.name}</div>
                          <div className="prod-cat truncate" style={{ maxWidth: 200, WebkitLineClamp: 1, textOverflow: "ellipsis" }}>
                            {item.description || "No description"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>${item.price.toFixed(2)}</td>
                    <td><span className={`badge ${categoryBadgeClass(item.category)}`}>{item.category}</span></td>
                    <td>
                      <div className={`toggle ${item.isAvailable ? 'on' : 'off'}`} onClick={() => toggleAvailability(item)}></div>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="act-btn" onClick={() => setConfirm({ kind: "edit", item })}>✏️</button>
                        <button className="act-btn delete" onClick={() => setConfirm({ kind: "delete", item })}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add/Edit Product Form */}
        <div className="form-panel">
          <div className="form-title">
            {editingItem ? '✏️ Edit Item' : '➕ Add New Item'}
          </div>

          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label className="form-label">Item Name <span className="req">*</span></label>
              <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Mushroom Risotto" required />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the dish, ingredients, cooking style..."></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price <span className="req">*</span></label>
                <input type="number" step="0.01" className="input" value={price} onChange={e => setPrice(e.target.value)} placeholder="$0.00" required />
              </div>
              <div className="form-group">
                <label className="form-label">Category <span className="req">*</span></label>
                <input type="text" className="input" value={category} onChange={e => setCategory(e.target.value)} placeholder="Pizza, Pasta..." required list="cat-opts" />
                <datalist id="cat-opts">
                  {categories.filter(c => c !== "All Categories").map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Prep Time <span className="req">*</span></label>
                <input type="text" className="input" value={prepTime} onChange={e => setPrepTime(e.target.value)} placeholder="e.g., 15 min" required />
              </div>
              <div className="form-group">
                <label className="form-label">Calories</label>
                <input type="text" className="input" value={calories} onChange={e => setCalories(e.target.value)} placeholder="e.g., 520 cal" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Item Photo</label>
              <label className="upload-zone" style={{ display: 'block' }}>
                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                <div className="upload-icon">📸</div>
                <div className="upload-text">
                  {imageFile ? imageFile.name : <>Drag & drop or <strong>browse</strong></>}
                </div>
                {!imageFile && <div style={{ fontSize: 11, color: "var(--slate-400)", marginTop: 4 }}>PNG, JPG up to 5MB</div>}
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Dietary Tags</label>
              <div className="tag-grid">
                {AVAILABLE_TAGS.map(t => {
                  const sel = dietaryTags.includes(t.id);
                  return (
                    <span 
                      key={t.id} 
                      className={`tag-option ${sel ? 'sel' : ''}`}
                      onClick={() => setDietaryTags(prev => sel ? prev.filter(x => x !== t.id) : [...prev, t.id])}
                    >
                      {t.icon} {t.label}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Customization Options</label>
              <input type="text" className="input" value={customization1} onChange={e => setCustomization1(e.target.value)} placeholder="e.g., Size: Small, Medium, Large" style={{ marginBottom: 8 }} />
              <input type="text" className="input" value={customization2} onChange={e => setCustomization2(e.target.value)} placeholder="e.g., Add-ons: Extra Cheese (+$2), Bacon (+$3)" />
            </div>

            <div className="form-actions">
              <button disabled={saving} type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                {saving ? "Saving..." : editingItem ? "Save Item" : "Add Item"}
              </button>
              {editingItem && (
                 <button type="button" onClick={cancelEdit} className="btn btn-secondary">Cancel</button>
              )}
            </div>
          </form>
        </div>
      </div>

      <ConfirmModal
        open={confirm !== null}
        title={
          confirm?.kind === "delete"
            ? "Delete menu item?"
            : "Edit menu item?"
        }
        message={
          confirm?.kind === "delete"
            ? `This will permanently delete “${confirm.item.name}”.`
            : `Open “${confirm?.item.name}” in edit mode?`
        }
        confirmText={confirm?.kind === "delete" ? "Delete" : "Edit"}
        danger={confirm?.kind === "delete"}
        onClose={() => setConfirm(null)}
        onConfirm={async () => {
          const next = confirm;
          setConfirm(null);
          if (!next) return;
          if (next.kind === "edit") {
            startEdit(next.item);
            return;
          }
          await handleDeleteConfirmed(next.item);
        }}
      />
    </>
  );
}
