/**
 * Tables & QR Code Manager — Fully Functional.
 *
 * Features:
 * - Loads real tables from API (GET /tables)
 * - Creates new tables (POST /tables)
 * - Deletes tables with confirmation (DELETE /tables/:id)
 * - Generates REAL QR codes using `qrcode` library pointing to
 *   https://qr-meal-customer-web.vercel.app/?table=T-1
 * - QR color customization
 * - Print individual QR or all QR codes
 * - Copy share link to clipboard
 * - Download QR as PNG
 */

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { fetchTables, createTable, deleteTable, type TableRow } from "../api/tables";

/** The production customer web URL */
const CUSTOMER_BASE = "https://qr-meal-customer-web.vercel.app";

function tableUrl(code: string): string {
  return `${CUSTOMER_BASE}/?table=${encodeURIComponent(code)}`;
}

const QR_COLORS = [
  { value: "#0f172a", label: "Black" },
  { value: "#0D9488", label: "Teal" },
  { value: "#115E59", label: "Dark Teal" },
  { value: "#334155", label: "Slate" },
];

const PRINT_SIZES = [
  { key: "sm", label: "Small",  sub: "2×2 in", px: 148 },
  { key: "md", label: "Medium", sub: "3×3 in", px: 200 },
  { key: "lg", label: "Large",  sub: "5×5 in", px: 300 },
];

type ThumbnailProps = { url: string; color: string; size?: number };

function QrThumbnail({ url, color, size = 64 }: ThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 1,
      color: { dark: color, light: "#ffffff" },
    }).catch(() => {});
  }, [url, color, size]);
  return <canvas ref={canvasRef} style={{ display: "block", borderRadius: 4 }} />;
}

type Props = { token: string };

export default function TablesQr({ token: _token }: Props) {
  const [tables, setTables]       = useState<TableRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [selected, setSelected]   = useState<string | null>(null);
  const [qrColor, setQrColor]     = useState("#0f172a");
  const [printSize, setPrintSize] = useState("md");
  const [includes, setIncludes]   = useState({ name: true, tableNum: true, scanText: true, wifi: false });
  const [copied, setCopied]       = useState(false);
  const [addingTable, setAddingTable] = useState(false);
  const [newLabel, setNewLabel]   = useState("");
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const previewCanvasRef          = useRef<HTMLCanvasElement>(null);

  const selectedTable = tables.find(t => t.id === selected) ?? tables[0] ?? null;
  const previewSize   = PRINT_SIZES.find(s => s.key === printSize)?.px ?? 200;
  const previewUrl    = selectedTable ? tableUrl(selectedTable.code) : "";

  /** Load tables from API */
  const load = useCallback(async () => {
    try {
      const data = await fetchTables();
      setTables(data.filter(t => t.isActive));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tables");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /** Regenerate preview QR whenever selection/color/size changes */
  useEffect(() => {
    if (!previewCanvasRef.current || !previewUrl) return;
    QRCode.toCanvas(previewCanvasRef.current, previewUrl, {
      width: previewSize,
      margin: 2,
      color: { dark: qrColor, light: "#ffffff" },
    }).catch(() => {});
  }, [previewUrl, qrColor, previewSize]);

  /** Add a new table */
  async function handleAddTable(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) return;
    setSaving(true);
    try {
      const created = await createTable(newLabel.trim());
      setTables(prev => [...prev, created]);
      setSelected(created.id);
      setNewLabel("");
      setAddingTable(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create table");
    } finally {
      setSaving(false);
    }
  }

  /** Delete table */
  async function handleDelete(tableId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!window.confirm("Delete this table? (Tables with orders will be deactivated instead)")) return;
    setDeleting(tableId);
    try {
      await deleteTable(tableId);
      setTables(prev => prev.filter(t => t.id !== tableId));
      if (selected === tableId) setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete table");
    } finally {
      setDeleting(null);
    }
  }

  /** Copy URL to clipboard */
  function handleCopyUrl() {
    if (!selectedTable) return;
    navigator.clipboard.writeText(tableUrl(selectedTable.code)).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /** Download QR code as PNG */
  async function handleDownloadPng() {
    if (!selectedTable) return;
    const canvas = document.createElement("canvas");
    await QRCode.toCanvas(canvas, tableUrl(selectedTable.code), {
      width: previewSize,
      margin: 2,
      color: { dark: qrColor, light: "#ffffff" },
    });
    const link = document.createElement("a");
    link.download = `qr-${selectedTable.code}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  /** Print single table QR */
  async function handlePrint(table: TableRow) {
    const canvas = document.createElement("canvas");
    const url = tableUrl(table.code);
    await QRCode.toCanvas(canvas, url, {
      width: previewSize,
      margin: 2,
      color: { dark: qrColor, light: "#ffffff" },
    });
    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(buildPrintHtml([{ table, dataUrl, url }], includes));
    win.document.close();
    win.onload = () => { win.print(); };
  }

  /** Print all tables */
  async function handlePrintAll() {
    const entries = await Promise.all(
      tables.map(async (table) => {
        const canvas = document.createElement("canvas");
        const url = tableUrl(table.code);
        await QRCode.toCanvas(canvas, url, { width: 200, margin: 2, color: { dark: qrColor, light: "#ffffff" } });
        return { table, dataUrl: canvas.toDataURL("image/png"), url };
      })
    );
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(buildPrintHtml(entries, includes));
    win.document.close();
    win.onload = () => { win.print(); };
  }

  const occupied = tables.filter(t => t.orderCount > 0).length;

  return (
    <div className="animate-in">
      {/* Page header */}
      <div className="page-header">
        <div>
          <div className="page-title">QR Code Management</div>
          <div className="page-subtitle">Generate, customize, and manage QR codes for each table</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setAddingTable(true)}>+ Add Table</button>
          <button className="btn btn-primary btn-sm" style={{ fontSize: 13 }} onClick={handlePrintAll}>🖨 Print All QR Codes</button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "10px 14px", borderRadius: 10, marginBottom: 16, fontSize: 13 }}>
          {error} <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", float: "right" }}>✕</button>
        </div>
      )}

      {/* Add table modal */}
      {addingTable && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 360, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Add New Table</div>
            <form onSubmit={handleAddTable}>
              <div className="form-group">
                <label className="form-label">Table Label <span className="req">*</span></label>
                <input
                  type="text"
                  className="input"
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  placeholder="e.g., Table 5 or Balcony A"
                  autoFocus
                  required
                />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: "12px 0" }} disabled={saving}>
                  {saving ? "Creating..." : "Create Table"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => { setAddingTable(false); setNewLabel(""); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--slate-400)" }}>Loading tables...</div>
      ) : (
        <div className="qr-layout">
          {/* ── Tables Grid ── */}
          <div className="qr-panel">
            <div className="qr-panel-head">
              <h3>
                Tables{" "}
                <span style={{ color: "var(--slate-400)", fontWeight: 400 }}>({tables.length} tables)</span>
              </h3>
              <div style={{ display: "flex", gap: 8 }}>
                <span className="badge badge-green">● {occupied} Active Orders</span>
                <span className="badge badge-slate">● {tables.length - occupied} Free</span>
              </div>
            </div>

            {tables.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--slate-400)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🍽️</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>No tables yet</div>
                <div style={{ fontSize: 13 }}>Click "Add Table" to create your first table</div>
              </div>
            ) : (
              <div className="tables-grid">
                {tables.map(t => {
                  const isSelected = (selected ?? tables[0]?.id) === t.id;
                  return (
                    <div
                      key={t.id}
                      className={`table-card${isSelected ? " selected" : ""}${t.orderCount > 0 ? " occupied" : ""}`}
                      onClick={() => setSelected(t.id)}
                    >
                      <div className="tc-qr">
                        <QrThumbnail url={tableUrl(t.code)} color={qrColor} size={52} />
                      </div>
                      <div className="tc-num">{t.label}</div>
                      <div className={`tc-status ${t.orderCount > 0 ? "active" : "free"}`}>
                        ● {t.orderCount > 0 ? `${t.orderCount} Orders` : "Free"}
                      </div>
                      <div className="tc-scans">{t.code}</div>
                      <div className="tc-actions">
                        <button className="tc-btn" onClick={e => { e.stopPropagation(); handlePrint(t); }}>🖨 Print</button>
                        <button
                          className="tc-btn"
                          style={{ color: "var(--coral-400)" }}
                          disabled={deleting === t.id}
                          onClick={e => handleDelete(t.id, e)}
                        >
                          {deleting === t.id ? "..." : "🗑 Del"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── QR Preview Panel ── */}
          <div className="qr-preview-panel">
            {!selectedTable ? (
              <div style={{ textAlign: "center", color: "var(--slate-400)", paddingTop: 40 }}>
                Select a table to see the QR preview
              </div>
            ) : (
              <>
                <div className="qr-preview-title">
                  QR Preview — {selectedTable.label}
                </div>

                {/* Real QR canvas */}
                <div className="qr-preview-code" style={{ width: "auto", height: "auto", border: "none", margin: "0 auto 14px" }}>
                  <div style={{
                    background: "#fff", border: "3px solid var(--slate-800)", borderRadius: 16,
                    padding: 12, display: "inline-block", position: "relative"
                  }}>
                    <canvas ref={previewCanvasRef} />
                    <div className="qr-logo-badge">QR</div>
                  </div>
                </div>

                {/* URL display */}
                <div className="qr-url-display">{tableUrl(selectedTable.code)}</div>

                {/* QR Color */}
                <div className="cs-section">
                  <span className="cs-label">QR Color</span>
                  <div className="color-options">
                    {QR_COLORS.map(c => (
                      <div
                        key={c.value}
                        className={`color-dot${qrColor === c.value ? " sel" : ""}`}
                        style={{ background: c.value }}
                        title={c.label}
                        onClick={() => setQrColor(c.value)}
                      />
                    ))}
                  </div>
                </div>

                {/* Print Size */}
                <div className="cs-section">
                  <span className="cs-label">Print Size</span>
                  <div className="size-options">
                    {PRINT_SIZES.map(s => (
                      <div
                        key={s.key}
                        className={`size-opt${printSize === s.key ? " sel" : ""}`}
                        onClick={() => setPrintSize(s.key)}
                      >
                        {s.label}<br />
                        <span style={{ fontSize: 10, color: "var(--slate-400)" }}>{s.sub}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Include on print */}
                <div className="cs-section">
                  <span className="cs-label">Include on Print</span>
                  <div className="print-checks">
                    {[
                      { key: "name",     label: "Restaurant name & logo" },
                      { key: "tableNum", label: "Table number" },
                      { key: "scanText", label: '"Scan to Order" text' },
                      { key: "wifi",     label: "WiFi credentials" },
                    ].map(opt => (
                      <label key={opt.key} className="print-check">
                        <input
                          type="checkbox"
                          checked={includes[opt.key as keyof typeof includes]}
                          onChange={() => setIncludes(prev => ({ ...prev, [opt.key]: !prev[opt.key as keyof typeof includes] }))}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="dl-actions">
                  <button className="dl-btn dl-primary" onClick={handleDownloadPng}>
                    ⬇ Download PNG
                  </button>
                  <button className="dl-btn dl-outline" onClick={() => handlePrint(selectedTable)}>
                    🖨 Print This Table
                  </button>
                  <button className="dl-btn dl-secondary" onClick={handleCopyUrl}>
                    {copied ? "✓ Copied!" : "🔗 Copy Share Link"}
                  </button>
                </div>

                {/* Bulk actions */}
                <div className="bulk-section">
                  <div className="bulk-label">Bulk Actions</div>
                  <div className="bulk-btns">
                    <button className="dl-btn dl-secondary" style={{ flex: 1, fontSize: 12 }} onClick={handlePrintAll}>
                      🖨 Print All ({tables.length})
                    </button>
                    <button
                      className="dl-btn dl-secondary"
                      style={{ flex: 1, fontSize: 12, color: "var(--coral-400)" }}
                      onClick={e => handleDelete(selectedTable.id, e as unknown as React.MouseEvent)}
                    >
                      🗑 Delete Table
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Generate print-ready HTML for one or multiple QR codes */
function buildPrintHtml(
  entries: { table: TableRow; dataUrl: string; url: string }[],
  inc: { name: boolean; tableNum: boolean; scanText: boolean; wifi: boolean }
): string {
  const cards = entries.map(({ table, dataUrl, url }) => `
    <div style="display:inline-block;margin:12px;page-break-inside:avoid;text-align:center;
      border:2px solid #e2e8f0;border-radius:16px;padding:24px 20px;background:#fff;width:220px;">
      ${inc.name ? `<div style="font-size:16px;font-weight:800;color:#0D9488;letter-spacing:2px;margin-bottom:8px;">QRMEAL</div>` : ""}
      <img src="${dataUrl}" style="width:160px;height:160px;display:block;margin:0 auto 12px;" />
      ${inc.tableNum ? `<div style="font-size:18px;font-weight:700;margin-bottom:4px;">${table.label}</div>` : ""}
      ${inc.scanText ? `<div style="font-size:12px;color:#64748b;margin-bottom:8px;">Scan to Order</div>` : ""}
      <div style="font-size:9px;color:#94a3b8;word-break:break-all;">${url}</div>
      ${inc.wifi ? `<div style="margin-top:10px;font-size:11px;color:#475569;">WiFi: RestaurantWifi | Pass: 12345678</div>` : ""}
    </div>
  `).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>QR Codes — QRMEAL</title>
  <style>
    @media print { body { margin: 0; } }
    body { font-family: 'Inter', sans-serif; background: #f8fafc; padding: 20px; }
    .grid { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
  </style>
</head>
<body>
  <div style="text-align:center;margin-bottom:24px;font-family:sans-serif;">
    <h2 style="font-size:22px;font-weight:800;color:#0D9488;">QRMEAL — Table QR Codes</h2>
    <p style="color:#64748b;font-size:13px;">Scan the QR code to place your order</p>
  </div>
  <div class="grid">${cards}</div>
</body>
</html>`;
}
