/**
 * Menu Management Page
 * Handles menu item CRUD operations with secure cookie auth and modular CSS.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { 
  addMenuItem, 
  addMenuItemWithUpload, 
  deleteMenuItem, 
  fetchAdminMenu, 
  patchMenuItem, 
  uploadMenuItemImage 
} from "../api/menu";
import { menuImageSrc } from "../lib/imageUrl";
import type { MenuItem } from "../types/menu";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/menu.css";

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

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All Categories");

  // Form State
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

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAdminMenu();
      setItems(data);
    } catch (e) {
      console.error("Failed to load menu", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const p = parseFloat(price);
    if (!name.trim() || Number.isNaN(p) || !prepTime.trim()) return;
    
    setSaving(true);
    try {
      const customizations = [customization1.trim(), customization2.trim()].filter(Boolean);
      const payload = {
        name: name.trim(),
        category: category.trim() || "General",
        price: p,
        description: description.trim() || undefined,
        prepTime: prepTime.trim(),
        calories: calories.trim() || undefined,
        dietaryTags,
        customizations
      };

      if (editingItem) {
        let updated = await patchMenuItem(editingItem.id, payload);
        if (imageFile) {
          updated = await uploadMenuItemImage(editingItem.id, imageFile);
        }
        setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)).sort((a, b) => a.name.localeCompare(b.name)));
        cancelEdit();
      } else {
        const created = imageFile
          ? await addMenuItemWithUpload({ ...payload, description: payload.description || undefined, imageFile })
          : await addMenuItem(payload);
        setItems((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        cancelEdit();
      }
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(item: MenuItem) {
    try {
      const updated = await patchMenuItem(item.id, { isAvailable: !item.isAvailable });
      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (err) {
      console.error("Update failed", err);
    }
  }

  async function handleDeleteConfirmed(item: MenuItem) {
    try {
      await deleteMenuItem(item.id);
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      if (editingItem?.id === item.id) cancelEdit();
    } catch (err) {
      console.error("Delete failed", err);
    }
  }

  return (
    <div className="animate-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Menu Management</h1>
          <p className="page-subtitle">Add, edit, and organize your restaurant menu</p>
        </div>
      </header>

      <div className="content-split">
        {/* Products List Panel */}
        <div className="products-panel">
          <div className="panel-head">
            <h3>All Menu Items <span style={{ color: "var(--slate-400)", fontWeight: 400 }}>({items.length})</span></h3>
            <div className="filter-row" style={{ display: 'flex', gap: 12 }}>
              <div className="search-box">
                <input 
                  type="text" 
                  className="input"
                  placeholder="Search items..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: 140, padding: '8px 12px', fontSize: 13 }}
                />
              </div>
              <select 
                className="input" 
                value={catFilter} 
                onChange={(e) => setCatFilter(e.target.value)} 
                style={{ width: "auto", padding: "8px 12px", fontSize: 13 }}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          
          {loading ? (
             <div style={{ padding: 48, textAlign: 'center', color: 'var(--slate-400)' }}>Loading menu...</div>
          ) : (
            <table className="product-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id} style={{ opacity: item.isAvailable ? 1 : 0.6 }}>
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
                          <div className="prod-cat">{item.category}</div>
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

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Item Name <span className="req">*</span></label>
              <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="input" value={description} onChange={e => setDescription(e.target.value)} style={{ height: 80 }}></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price <span className="req">*</span></label>
                <input type="number" step="0.01" className="input" value={price} onChange={e => setPrice(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category <span className="req">*</span></label>
                <input type="text" className="input" value={category} onChange={e => setCategory(e.target.value)} required list="cat-opts" />
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

            <div className="form-actions" style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button disabled={saving} type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                {saving ? "Saving..." : editingItem ? "Update" : "Create"}
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
        title={confirm?.kind === "delete" ? "Delete Item?" : "Edit Item?"}
        message={confirm?.kind === "delete" 
          ? `Are you sure you want to delete ${confirm.item.name}?` 
          : `Do you want to edit ${confirm?.item.name}?`}
        confirmText={confirm?.kind === "delete" ? "Delete" : "Edit"}
        danger={confirm?.kind === "delete"}
        onClose={() => setConfirm(null)}
        onConfirm={async () => {
          const next = confirm;
          setConfirm(null);
          if (!next) return;
          if (next.kind === "edit") {
            startEdit(next.item);
          } else {
            await handleDeleteConfirmed(next.item);
          }
        }}
      />
    </div>
  );
}
