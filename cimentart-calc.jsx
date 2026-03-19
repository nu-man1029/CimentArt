import { useState, useMemo, useCallback } from "react";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CimentArt 材料費シミュレーター
   Design: cimentartjapan.jp 公式UIベース
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const MATERIALS = {
  primer: {
    name: "【1】プライマー/メッシュ", cat: "primer", coats: 1,
    sizes: [
      { label: "1kg", coverage: 10, price: 6000, unitPrice: 600 },
      { label: "5kg", coverage: 50, price: 22000, unitPrice: 440 },
    ],
  },
  concBase: {
    name: "【2】コンクリートベース", cat: "base", coats: 2,
    sizes: [{ label: "25kg", coverage: 10, price: 23000, unitPrice: 2300 }],
  },
  resin: {
    name: "【2】レジン", cat: "base", perBase: true, coats: 0,
    sizes: [{ label: "5kg", coverage: null, price: 12000, unitPrice: null }],
  },
  aquaBase: {
    name: "【2】アクアベース", cat: "base", coats: 2,
    sizes: [
      { label: "5kg", coverage: 2.5, price: 15000, unitPrice: 6000 },
      { label: "20kg", coverage: 10, price: 30000, unitPrice: 3000 },
    ],
  },
  microStucco: {
    name: "【3】マイクロストゥック", cat: "finish", coats: 2,
    sizes: [
      { label: "5kg", coverage: 8, price: 20000, unitPrice: 2500 },
      { label: "20kg", coverage: 30, price: 51000, unitPrice: 1700 },
    ],
  },
  aquaQuartz: {
    name: "【3】アクアクオーツ", cat: "finish", coats: 2,
    sizes: [
      { label: "5kg", coverage: 6, price: 24000, unitPrice: 4000 },
      { label: "20kg", coverage: 22, price: 58000, unitPrice: 2636 },
    ],
  },
  aquaMicro: {
    name: "【3】アクアマイクロコンクリート", cat: "finish", coats: 2,
    sizes: [
      { label: "5kg", coverage: 5, price: 24000, unitPrice: 4800 },
      { label: "20kg", coverage: 20, price: 58000, unitPrice: 2900 },
    ],
  },
  aquaNature: {
    name: "【3】アクアネイチャー", cat: "finish", coats: 2,
    sizes: [
      { label: "5kg", coverage: 3.5, price: 24000, unitPrice: 6857 },
      { label: "20kg", coverage: 14, price: 58000, unitPrice: 4143 },
    ],
  },
  aquaStone: {
    name: "【3】アクアストーン", cat: "finish", coats: 2,
    sizes: [
      { label: "5kg", coverage: 4, price: 11000, unitPrice: 2750 },
      { label: "20kg", coverage: 16, price: 39900, unitPrice: 2494 },
    ],
  },
  sealer: {
    name: "【4】クリアシーラー", cat: "sealer", coats: 1,
    sizes: [
      { label: "1kg", coverage: 10, price: 8000, unitPrice: 800 },
      { label: "5kg", coverage: 50, price: 34000, unitPrice: 680 },
    ],
  },
  metallic: {
    name: "【5】メタリック（12色）", cat: "metallic", coats: 2,
    sizes: [{ label: "500g", coverage: 5, price: 19000, unitPrice: 3800 }],
  },
  clearMatte: {
    name: "【5】クリア マット", cat: "clear", coats: 2,
    sizes: [
      { label: "1kg", coverage: 5, price: 22000, unitPrice: 4400 },
      { label: "5kg", coverage: 25, price: 64000, unitPrice: 2560 },
    ],
  },
  clearSemi: {
    name: "【5】クリア 半艶", cat: "clear", coats: 2,
    sizes: [
      { label: "1kg", coverage: 5, price: 22000, unitPrice: 4400 },
      { label: "5kg", coverage: 25, price: 64000, unitPrice: 2560 },
    ],
  },
  clearGloss: {
    name: "【5】クリア 艶あり", cat: "clear", coats: 2,
    sizes: [
      { label: "1kg", coverage: 5, price: 22000, unitPrice: 4400 },
      { label: "5kg", coverage: 25, price: 64000, unitPrice: 2560 },
    ],
  },
};

const PIGMENTS = [
  { id: "black", name: "Black JS（ブラック）", color: "#333", sizes: [{ label: "100g", price: 3000 }, { label: "500g", price: 10000 }] },
  { id: "brown", name: "Brown WS（ブラウン）", color: "#8B4513", sizes: [{ label: "100g", price: 3000 }, { label: "500g", price: 10000 }] },
  { id: "redOxide", name: "Red Oxide YS", color: "#a0522d", sizes: [{ label: "100g", price: 4000 }, { label: "500g", price: 14000 }] },
  { id: "ocher", name: "Ocher TS（オーカー）", color: "#C8A951", sizes: [{ label: "100g", price: 3000 }, { label: "500g", price: 10000 }] },
  { id: "yellow", name: "Yellow QS（イエロー）", color: "#DAA520", sizes: [{ label: "100g", price: 5000 }, { label: "500g", price: 18000 }] },
  { id: "orange", name: "Orange US（オレンジ）", color: "#E8751A", sizes: [{ label: "100g", price: 5000 }, { label: "500g", price: 18000 }] },
  { id: "green", name: "Green PS（グリーン）", color: "#3A7D44", sizes: [{ label: "100g", price: 4500 }, { label: "500g", price: 15000 }] },
  { id: "blue", name: "Blue LS（ブルー）", color: "#2E5FA1", sizes: [{ label: "100g", price: 4500 }, { label: "500g", price: 15000 }] },
  { id: "red", name: "Red VS（レッド）", color: "#C0392B", sizes: [{ label: "100g", price: 6000 }, { label: "500g", price: 20000 }] },
];

const FINISH_OPTIONS = [
  { id: "aquaQuartz", name: "アクアクオーツ", surfaces: ["floor", "wall", "smooth"] },
  { id: "aquaMicro", name: "アクアマイクロコンクリート", surfaces: ["floor", "wall", "smooth"] },
  { id: "aquaNature", name: "アクアネイチャー", surfaces: ["floor", "wall", "smooth"] },
  { id: "microStucco", name: "マイクロストゥック", surfaces: ["floor", "wall", "smooth"] },
  { id: "aquaStone", name: "アクアストーン", surfaces: ["wall", "smooth"] },
  { id: "metallic", name: "メタリック", surfaces: ["floor", "wall", "smooth"] },
];

const SURFACE_OPTIONS = [
  { id: "floor", name: "床" },
  { id: "wall", name: "壁" },
  { id: "smooth", name: "平滑な下地" },
];

const CLEAR_OPTIONS = [
  { id: "clearMatte", name: "マット" },
  { id: "clearSemi", name: "半艶" },
  { id: "clearGloss", name: "艶あり" },
];

function getWorkflow(finish, surface, clearType) {
  const steps = [];
  steps.push("primer");
  if (finish === "metallic") {
    steps.push("metallic");
    steps.push(clearType);
    return steps;
  }
  if (surface === "floor") { steps.push("concBase"); steps.push("resin"); }
  else if (surface === "wall") { steps.push("aquaBase"); }
  steps.push(finish);
  steps.push("sealer");
  steps.push(clearType);
  return steps;
}

function autoOptimize(materialKey, area) {
  const mat = MATERIALS[materialKey];
  if (!mat) return [];
  if (mat.perBase) return [{ sizeIdx: 0, qty: 1 }];
  const sizes = mat.sizes;
  if (sizes.length === 1) {
    const s = sizes[0];
    if (!s.coverage) return [{ sizeIdx: 0, qty: 1 }];
    return [{ sizeIdx: 0, qty: Math.ceil(area / s.coverage) }];
  }
  let bestCost = Infinity, bestCombo = [];
  const sorted = sizes.map((s, i) => ({ ...s, idx: i })).sort((a, b) => b.coverage - a.coverage);
  const lg = sorted[0], sm = sorted[1];
  for (let n = 0; n <= Math.ceil(area / lg.coverage) + 1; n++) {
    const rem = Math.max(0, area - n * lg.coverage);
    const nSm = rem > 0 ? Math.ceil(rem / sm.coverage) : 0;
    const cost = n * lg.price + nSm * sm.price;
    if (cost < bestCost) {
      bestCost = cost;
      bestCombo = [];
      if (n > 0) bestCombo.push({ sizeIdx: lg.idx, qty: n });
      if (nSm > 0) bestCombo.push({ sizeIdx: sm.idx, qty: nSm });
    }
  }
  return bestCombo;
}

function calcLineItems(materialKey, selections) {
  const mat = MATERIALS[materialKey];
  if (!mat) return [];
  return selections.map((sel) => {
    const s = mat.sizes[sel.sizeIdx];
    return { ...s, sizeIdx: sel.sizeIdx, qty: sel.qty, subtotal: s.price * sel.qty, totalCov: s.coverage ? s.coverage * sel.qty : null };
  });
}

const fmt = (n) => "\u00a5" + n.toLocaleString();

/* ━━━ COLORS (CimentArt Japan inspired: white/warm gray/concrete) ━━ */
const C = {
  bg: "#f7f6f4",
  white: "#ffffff",
  text: "#1a1a1a",
  sub: "#666",
  muted: "#999",
  border: "#e0ddd8",
  borderLt: "#f0eeea",
  accent: "#8b7355",
  accentLt: "#f3efe8",
  accentDk: "#6b563e",
  dark: "#2c2c2c",
  ok: "#4a7c59",
  ng: "#b54a4a",
  gold: "#c9a96e",
};

/* ━━━ MaterialCard ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function MaterialCard({ materialKey, autoSel, manualSel, onManualChange, area }) {
  const mat = MATERIALS[materialKey];
  if (!mat) return null;
  const isM = !!manualSel;
  const sel = isM ? manualSel : autoSel;
  const items = calcLineItems(materialKey, sel);
  const cost = items.reduce((s, i) => s + i.subtotal, 0);
  const cov = items.reduce((s, i) => s + (i.totalCov || 0), 0);
  const hasSz = mat.sizes.length > 1 && !mat.perBase;

  return (
    <div style={{
      background: C.white, borderRadius: 4, marginBottom: 10,
      border: isM ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "13px 16px 7px" }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: C.text, letterSpacing: ".3px" }}>{mat.name}</div>
          {mat.coats === 2 && (
            <span style={{
              display: "inline-block", marginTop: 3, padding: "2px 7px", borderRadius: 3,
              fontSize: 10, fontWeight: 600, background: C.accentLt, color: C.accent,
            }}>2回塗り</span>
          )}
          {mat.perBase && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>コンクリートベースに併用</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>{fmt(cost)}</div>
          {cov > 0 && (
            <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2, color: cov >= area ? C.ok : C.ng }}>
              {cov.toFixed(1)}㎡ {cov >= area ? "✓" : `（不足 ${(area - cov).toFixed(1)}㎡）`}
            </div>
          )}
        </div>
      </div>
      <div style={{ padding: "0 16px 6px" }}>
        {items.map((item, idx) => (
          <div key={idx} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "7px 0",
            borderTop: `1px solid ${C.borderLt}`, flexWrap: "wrap",
          }}>
            {isM && hasSz ? (
              <select value={sel[idx].sizeIdx}
                onChange={(e) => { const u = [...sel]; u[idx] = { ...u[idx], sizeIdx: +e.target.value }; onManualChange(materialKey, u); }}
                style={{
                  padding: "5px 8px", borderRadius: 3, border: `1.5px solid ${C.accent}`,
                  fontSize: 12, fontWeight: 600, background: C.accentLt, color: C.accentDk, minWidth: 65,
                }}>
                {mat.sizes.map((s, i) => (
                  <option key={i} value={i}>{s.label}（{s.coverage}㎡ / {fmt(s.unitPrice)}/㎡）</option>
                ))}
              </select>
            ) : (
              <span style={{
                padding: "4px 10px", borderRadius: 3, fontSize: 12, fontWeight: 600,
                background: C.borderLt, color: C.sub, minWidth: 45, textAlign: "center",
              }}>{item.label}</span>
            )}
            <span style={{ fontSize: 12, color: C.muted, flex: 1 }}>
              {item.totalCov != null ? `${item.coverage}㎡/個 × ${item.qty}個 = ${item.totalCov.toFixed(1)}㎡` : `${fmt(item.price)}/個 × ${item.qty}個`}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <button onClick={() => isM && (() => { const u = [...sel]; u[idx] = { ...u[idx], qty: Math.max(1, u[idx].qty - 1) }; onManualChange(materialKey, u); })()}
                disabled={!isM || item.qty <= 1}
                style={{
                  width: 26, height: 26, borderRadius: 3, border: `1px solid ${C.border}`,
                  background: (!isM || item.qty <= 1) ? C.borderLt : C.white,
                  cursor: (!isM || item.qty <= 1) ? "default" : "pointer",
                  fontSize: 15, color: C.muted, display: "flex", alignItems: "center", justifyContent: "center",
                }}>−</button>
              <span style={{ width: 26, textAlign: "center", fontWeight: 700, fontSize: 14 }}>{item.qty}</span>
              <button onClick={() => isM && (() => { const u = [...sel]; u[idx] = { ...u[idx], qty: u[idx].qty + 1 }; onManualChange(materialKey, u); })()}
                disabled={!isM}
                style={{
                  width: 26, height: 26, borderRadius: 3, border: `1px solid ${C.border}`,
                  background: !isM ? C.borderLt : C.white,
                  cursor: !isM ? "default" : "pointer",
                  fontSize: 15, color: C.muted, display: "flex", alignItems: "center", justifyContent: "center",
                }}>+</button>
            </div>
            <span style={{ width: 78, textAlign: "right", fontWeight: 600, fontSize: 13 }}>{fmt(item.subtotal)}</span>
            {isM && sel.length > 1 && (
              <button onClick={() => onManualChange(materialKey, sel.filter((_, i) => i !== idx))} style={{
                width: 20, height: 20, borderRadius: "50%", border: "none",
                background: "#fde8e8", color: C.ng, fontSize: 12, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>✕</button>
            )}
          </div>
        ))}
      </div>
      {hasSz && (
        <div style={{ display: "flex", gap: 8, padding: "8px 16px 12px", borderTop: `1px solid ${C.borderLt}` }}>
          {!isM ? (
            <button onClick={() => onManualChange(materialKey, [...autoSel])} style={{
              padding: "5px 12px", borderRadius: 3, border: `1.5px solid ${C.accent}`,
              background: C.white, color: C.accent, fontSize: 11, fontWeight: 700, cursor: "pointer",
            }}>✏️ 手動で調整</button>
          ) : (
            <>
              <button onClick={() => onManualChange(materialKey, null)} style={{
                padding: "5px 12px", borderRadius: 3, border: `1px solid ${C.border}`,
                background: C.white, color: C.sub, fontSize: 11, fontWeight: 600, cursor: "pointer",
              }}>↩ 自動に戻す</button>
              <button onClick={() => onManualChange(materialKey, [...sel, { sizeIdx: 0, qty: 1 }])} style={{
                padding: "5px 12px", borderRadius: 3, border: `1.5px solid ${C.accent}`,
                background: C.accentLt, color: C.accentDk, fontSize: 11, fontWeight: 600, cursor: "pointer",
              }}>＋ サイズ追加</button>
              <span style={{ fontSize: 10, color: C.accent, fontWeight: 600, display: "flex", alignItems: "center", marginLeft: 4 }}>手動モード</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ━━━ PigmentSelector ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function PigmentSelector({ pigs, onChange }) {
  const [open, setOpen] = useState(false);
  const toggle = (id) => {
    if (pigs.find((p) => p.id === id)) onChange(pigs.filter((p) => p.id !== id));
    else onChange([...pigs, { id, sizeIdx: 0, qty: 1 }]);
  };
  const upd = (id, f, v) => onChange(pigs.map((p) => (p.id === id ? { ...p, [f]: v } : p)));
  const total = pigs.reduce((s, sp) => { const p = PIGMENTS.find((x) => x.id === sp.id); return s + (p ? p.sizes[sp.sizeIdx].price * sp.qty : 0); }, 0);

  return (
    <div style={{ background: C.white, borderRadius: 4, border: `1px solid ${C.border}`, marginBottom: 10 }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", padding: "13px 16px", border: "none", background: "transparent",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        cursor: "pointer", fontSize: 14, fontWeight: 600, color: C.text,
      }}>
        <span>顔料（オプション）{pigs.length > 0 && ` — ${pigs.length}色`}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {total > 0 && <span style={{ fontWeight: 700 }}>{fmt(total)}</span>}
          <span style={{ transform: open ? "rotate(180deg)" : "none", transition: ".2s", fontSize: 11 }}>▼</span>
        </span>
      </button>
      {open && (
        <div style={{ padding: "0 16px 12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 6 }}>
            {PIGMENTS.map((pig) => {
              const s = pigs.find((p) => p.id === pig.id);
              return (
                <div key={pig.id} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 4,
                  border: s ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
                  background: s ? C.accentLt : C.bg, cursor: "pointer",
                }} onClick={() => !s && toggle(pig.id)}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: pig.color, flexShrink: 0, border: "1px solid rgba(0,0,0,.08)" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{pig.name}</div>
                    {s && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }} onClick={(e) => e.stopPropagation()}>
                        <select value={s.sizeIdx} onChange={(e) => upd(pig.id, "sizeIdx", +e.target.value)}
                          style={{ padding: "2px 5px", borderRadius: 3, border: `1px solid ${C.border}`, fontSize: 11, background: C.white }}>
                          {pig.sizes.map((sz, i) => (<option key={i} value={i}>{sz.label} {fmt(sz.price)}</option>))}
                        </select>
                        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <button onClick={() => s.qty > 1 && upd(pig.id, "qty", s.qty - 1)} style={{ width: 20, height: 20, borderRadius: 3, border: `1px solid ${C.border}`, background: C.white, cursor: "pointer", fontSize: 12, color: C.muted }}>−</button>
                          <span style={{ width: 18, textAlign: "center", fontSize: 12, fontWeight: 600 }}>{s.qty}</span>
                          <button onClick={() => upd(pig.id, "qty", s.qty + 1)} style={{ width: 20, height: 20, borderRadius: 3, border: `1px solid ${C.border}`, background: C.white, cursor: "pointer", fontSize: 12, color: C.muted }}>+</button>
                        </div>
                        <button onClick={() => toggle(pig.id)} style={{ marginLeft: "auto", background: "none", border: "none", color: C.ng, cursor: "pointer", fontSize: 11, fontWeight: 700 }}>✕</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ━━━ ReferencePanel ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ReferencePanel({ open, onClose }) {
  if (!open) return null;
  const cats = [
    { title: "【1】プライマー", keys: ["primer"] },
    { title: "【2】ベース（2回塗り）", keys: ["concBase", "resin", "aquaBase"] },
    { title: "【3】仕上げ材（2回塗り）", keys: ["microStucco", "aquaQuartz", "aquaMicro", "aquaNature", "aquaStone"] },
    { title: "【4】クリアシーラー", keys: ["sealer"] },
    { title: "【5】メタリック（2回塗り）", keys: ["metallic"] },
    { title: "【5】クリア（2回塗り）", keys: ["clearMatte", "clearSemi", "clearGloss"] },
  ];
  const th = { padding: "7px 10px", fontWeight: 600, fontSize: 11, color: C.muted, borderBottom: `2px solid ${C.border}`, letterSpacing: ".3px" };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.35)", display: "flex", justifyContent: "center", alignItems: "flex-end" }} onClick={onClose}>
      <div style={{ background: C.white, borderRadius: "12px 12px 0 0", width: "100%", maxWidth: 780, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 -4px 20px rgba(0,0,0,.1)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 2px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 24px 14px", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, background: C.white, zIndex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>CimentArt 材料単価一覧表</h2>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.borderLt, fontSize: 14, cursor: "pointer", color: C.sub, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: "16px 20px 24px" }}>
          {cats.map((cat) => (
            <div key={cat.title} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 6, paddingLeft: 10, borderLeft: `3px solid ${C.accent}` }}>{cat.title}</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead><tr style={{ background: C.bg }}>
                  <th style={{ ...th, textAlign: "left" }}>材料名</th>
                  <th style={{ ...th, textAlign: "center" }}>サイズ</th>
                  <th style={{ ...th, textAlign: "center" }}>施工㎡</th>
                  <th style={{ ...th, textAlign: "right" }}>定価</th>
                  <th style={{ ...th, textAlign: "right" }}>㎡単価</th>
                </tr></thead>
                <tbody>
                  {cat.keys.flatMap((key) => {
                    const m = MATERIALS[key];
                    return m.sizes.map((s, i) => (
                      <tr key={key + i} style={{ borderBottom: `1px solid ${C.borderLt}` }}>
                        {i === 0 && <td rowSpan={m.sizes.length} style={{ padding: "7px 10px", fontWeight: 600, color: C.text, verticalAlign: "top" }}>{m.name.replace(/【\d】/, "").trim()}</td>}
                        <td style={{ padding: "6px 10px", textAlign: "center", color: C.sub }}>{s.label}</td>
                        <td style={{ padding: "6px 10px", textAlign: "center", color: C.sub }}>{s.coverage ? `${s.coverage}㎡` : "—"}</td>
                        <td style={{ padding: "6px 10px", textAlign: "right", fontWeight: 600, color: C.text }}>{fmt(s.price)}</td>
                        <td style={{ padding: "6px 10px", textAlign: "right", fontWeight: 700, color: C.accent }}>{s.unitPrice ? fmt(s.unitPrice) : "—"}</td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          ))}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 6, paddingLeft: 10, borderLeft: `3px solid ${C.accent}` }}>顔料</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ background: C.bg }}>
                <th style={{ ...th, textAlign: "left" }}>顔料名</th>
                <th style={{ ...th, textAlign: "center" }}>サイズ</th>
                <th style={{ ...th, textAlign: "right" }}>定価</th>
              </tr></thead>
              <tbody>
                {PIGMENTS.flatMap((pig) => pig.sizes.map((s, i) => (
                  <tr key={pig.id + i} style={{ borderBottom: `1px solid ${C.borderLt}` }}>
                    {i === 0 && <td rowSpan={pig.sizes.length} style={{ padding: "7px 10px", fontWeight: 600, color: C.text, verticalAlign: "top" }}>
                      <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: pig.color, marginRight: 6, verticalAlign: "middle" }} />{pig.name}
                    </td>}
                    <td style={{ padding: "6px 10px", textAlign: "center", color: C.sub }}>{s.label}</td>
                    <td style={{ padding: "6px 10px", textAlign: "right", fontWeight: 600, color: C.text }}>{fmt(s.price)}</td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ━━━ MAIN APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function App() {
  const [projectName, setProjectName] = useState("");
  const [area, setArea] = useState("");
  const [surface, setSurface] = useState("floor");
  const [finish, setFinish] = useState("aquaQuartz");
  const [clearType, setClearType] = useState("clearMatte");
  const [pigments, setPigments] = useState([]);
  const [manual, setManual] = useState({});
  const [done, setDone] = useState(false);
  const [showRef, setShowRef] = useState(false);

  const sqm = parseFloat(area) || 0;
  const fDef = FINISH_OPTIONS.find((f) => f.id === finish);
  const validSurf = fDef ? fDef.surfaces : ["floor", "wall", "smooth"];
  const surf = validSurf.includes(surface) ? surface : validSurf[0];
  const workflow = useMemo(() => getWorkflow(finish, surf, clearType), [finish, surf, clearType]);
  const autoSel = useMemo(() => {
    if (sqm <= 0) return {};
    const r = {}; workflow.forEach((k) => { r[k] = autoOptimize(k, sqm); }); return r;
  }, [sqm, workflow]);

  const handleManual = useCallback((k, v) => {
    setManual((p) => { const n = { ...p }; if (v === null) delete n[k]; else n[k] = v; return n; });
  }, []);

  const matTotal = useMemo(() => {
    if (!done) return 0;
    return workflow.reduce((s, k) => s + calcLineItems(k, manual[k] || autoSel[k] || []).reduce((a, i) => a + i.subtotal, 0), 0);
  }, [done, workflow, autoSel, manual]);

  const pigTotal = pigments.reduce((s, sp) => { const p = PIGMENTS.find((x) => x.id === sp.id); return s + (p ? p.sizes[sp.sizeIdx].price * sp.qty : 0); }, 0);
  const grand = matTotal + pigTotal;
  const uPrice = sqm > 0 ? Math.round(grand / sqm) : 0;

  const inp = { width: "100%", padding: "10px 12px", borderRadius: 4, border: `1px solid ${C.border}`, fontSize: 15, boxSizing: "border-box", outline: "none", color: C.text, background: C.white };
  const btn = (a) => ({
    padding: "8px 16px", borderRadius: 4, fontSize: 13, fontWeight: 600,
    border: a ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
    background: a ? C.accentLt : C.white, color: a ? C.accent : C.sub, cursor: "pointer",
  });

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Noto Sans JP','Hiragino Sans',-apple-system,sans-serif", color: C.text }}>
      {/* Header */}
      <div style={{ background: C.white, padding: "20px 20px 18px", borderBottom: `1px solid ${C.border}`, boxShadow: "0 1px 3px rgba(0,0,0,.03)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: ".5px" }}>
              <span style={{ color: C.accent }}>CimentArt</span> 材料費シミュレーター
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>Cement Artist Nu☆Man — 現場別コスト算出ツール</p>
          </div>
          <button onClick={() => setShowRef(true)} style={{
            padding: "8px 14px", borderRadius: 4, border: `1.5px solid ${C.accent}`,
            background: C.white, color: C.accent, fontSize: 12, fontWeight: 700,
            cursor: "pointer", whiteSpace: "nowrap",
          }}>単価表を見る</button>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px 60px" }}>
        {/* Input */}
        <div style={{ background: C.white, borderRadius: 4, padding: 20, marginBottom: 14, border: `1px solid ${C.border}` }}>
          <h2 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, paddingBottom: 10, borderBottom: `1px solid ${C.borderLt}` }}>現場情報を入力</h2>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 3 }}>現場名（任意）</label>
            <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="例：○○邸 玄関アプローチ" style={inp}
              onFocus={(e) => (e.target.style.borderColor = C.accent)} onBlur={(e) => (e.target.style.borderColor = C.border)} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 3 }}>施工面積（㎡）</label>
            <input type="number" value={area} onChange={(e) => { setArea(e.target.value); setDone(false); }}
              placeholder="例：30" min="0.1" step="0.1" style={inp}
              onFocus={(e) => (e.target.style.borderColor = C.accent)} onBlur={(e) => (e.target.style.borderColor = C.border)} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 5 }}>施工箇所</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {SURFACE_OPTIONS.map((o) => {
                const dis = !validSurf.includes(o.id);
                return <button key={o.id} onClick={() => { if (!dis) { setSurface(o.id); setDone(false); } }}
                  style={{ ...btn(surf === o.id && !dis), opacity: dis ? .35 : 1, cursor: dis ? "not-allowed" : "pointer" }}>
                  {o.name}{dis ? "（対象外）" : ""}
                </button>;
              })}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 5 }}>仕上げ材</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {FINISH_OPTIONS.map((o) => (
                <button key={o.id} onClick={() => { setFinish(o.id); setDone(false); }} style={btn(finish === o.id)}>
                  {o.name}
                  {o.id === "aquaStone" && <span style={{ fontSize: 9, marginLeft: 3, opacity: .55 }}>※ライセンス</span>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 5 }}>クリア仕上げ</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CLEAR_OPTIONS.map((o) => <button key={o.id} onClick={() => { setClearType(o.id); setDone(false); }} style={btn(clearType === o.id)}>{o.name}</button>)}
            </div>
          </div>
        </div>

        {/* Workflow */}
        <div style={{ background: C.white, borderRadius: 4, padding: "11px 16px", marginBottom: 14, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 6 }}>施工手順（{workflow.length}工程）</div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 5 }}>
            {workflow.map((key, i) => {
              const m = MATERIALS[key];
              return (
                <span key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 3, fontSize: 11, fontWeight: 600, background: C.accentLt, color: C.accentDk, whiteSpace: "nowrap" }}>
                    {m?.name || key}
                    {m?.coats === 2 && <span style={{ fontSize: 9, padding: "1px 4px", borderRadius: 2, background: C.accent, color: "#fff", fontWeight: 700 }}>×2</span>}
                  </span>
                  {i < workflow.length - 1 && <span style={{ color: C.border, fontSize: 12 }}>→</span>}
                </span>
              );
            })}
          </div>
        </div>

        {/* Calc button */}
        <button onClick={() => { setManual({}); setDone(true); }} disabled={sqm <= 0}
          style={{
            width: "100%", padding: "13px", borderRadius: 4, border: "none",
            background: sqm > 0 ? C.accent : C.border, color: "#fff", fontSize: 15, fontWeight: 700,
            cursor: sqm > 0 ? "pointer" : "default", marginBottom: 18,
            boxShadow: sqm > 0 ? "0 2px 8px rgba(139,115,85,.2)" : "none",
          }}>{done ? "再計算する" : "材料費を算出する"}</button>

        {/* Results */}
        {done && sqm > 0 && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[{ l: "材料費合計", v: fmt(grand), h: true }, { l: "㎡単価", v: `${fmt(uPrice)}/㎡` }, { l: "施工面積", v: `${sqm}㎡` }].map((c) => (
                <div key={c.l} style={{ background: C.dark, borderRadius: 4, padding: "13px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#999", marginBottom: 3, fontWeight: 600 }}>{c.l}</div>
                  <div style={{ fontSize: c.h ? 18 : 16, fontWeight: 800, color: c.h ? C.gold : "#fff" }}>{c.v}</div>
                </div>
              ))}
            </div>

            <div style={{ background: C.accentLt, borderRadius: 4, padding: "10px 14px", marginBottom: 12, border: "1px solid #e8dfd0", fontSize: 12, color: C.accentDk, lineHeight: 1.5 }}>
              各材料は<strong>コスパ最安</strong>で自動計算済み。「✏️ 手動で調整」でサイズ変更・個数調整ができます。
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 10px", paddingLeft: 10, borderLeft: `3px solid ${C.accent}` }}>
              材料明細{projectName && ` — ${projectName}`}
            </h3>

            {workflow.map((k) => (
              <MaterialCard key={k} materialKey={k} autoSel={autoSel[k] || []} manualSel={manual[k] || null} onManualChange={handleManual} area={sqm} />
            ))}

            <PigmentSelector pigs={pigments} onChange={setPigments} />

            <div style={{ background: C.dark, borderRadius: 4, padding: 20, marginTop: 8, border: `2px solid ${C.accent}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#999", fontSize: 13, fontWeight: 600 }}>材料費</span>
                <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>{fmt(matTotal)}</span>
              </div>
              {pigTotal > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "#999", fontSize: 13, fontWeight: 600 }}>顔料</span>
                  <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>{fmt(pigTotal)}</span>
                </div>
              )}
              <div style={{ borderTop: "1px solid #555", paddingTop: 12, marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#fff", fontSize: 15, fontWeight: 800 }}>合計</span>
                <span style={{ color: C.gold, fontSize: 24, fontWeight: 800 }}>{fmt(grand)}</span>
              </div>
              <div style={{ textAlign: "right", marginTop: 4 }}>
                <span style={{ color: "#999", fontSize: 12 }}>㎡単価 {fmt(uPrice)}/㎡</span>
              </div>
            </div>

            <button onClick={() => { setManual({}); setDone(false); }} style={{
              width: "100%", padding: "11px", borderRadius: 4, marginTop: 12,
              border: `1px solid ${C.border}`, background: C.white, color: C.sub, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>条件をクリア</button>
          </>
        )}
      </div>

      <ReferencePanel open={showRef} onClose={() => setShowRef(false)} />
    </div>
  );
}
