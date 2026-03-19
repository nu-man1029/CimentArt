import { useState, useMemo, useCallback, useEffect } from "react";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CimentArt 材料費シミュレーター
   Design: cimentartjapan.jp 公式UIベース
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* ━━━ GlobalStyles ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function GlobalStyles() {
  useEffect(() => {
    const id = "ca-global-styles";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
      @keyframes ca-slide-up {
        from { transform: translateY(48px); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }
      @keyframes ca-fade-in {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes ca-pop {
        0%   { opacity: 0; transform: scale(0.97); }
        100% { opacity: 1; transform: scale(1); }
      }
      .ca-panel-inner {
        animation: ca-slide-up 0.3s cubic-bezier(0.32, 0.72, 0, 1);
      }
      .ca-result {
        animation: ca-fade-in 0.35s ease;
      }
      .ca-card {
        animation: ca-fade-in 0.22s ease;
      }
      .ca-summary-card {
        animation: ca-pop 0.28s ease;
      }
      .ca-btn-primary {
        transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
      }
      .ca-btn-primary:hover:not(:disabled) {
        filter: brightness(1.08);
        box-shadow: 0 4px 12px rgba(139,115,85,.28);
        transform: translateY(-1px);
      }
      .ca-btn-primary:active:not(:disabled) {
        transform: translateY(0);
      }
      .ca-btn-ghost {
        transition: background 0.15s, color 0.15s;
      }
      .ca-btn-ghost:hover {
        background: #ede8df !important;
      }
      .ca-header-btn {
        transition: background 0.15s, transform 0.1s;
      }
      .ca-header-btn:hover {
        filter: brightness(0.95);
        transform: translateY(-1px);
      }
      .ca-backdrop {
        animation: ca-backdrop-in 0.22s ease;
      }
      @keyframes ca-backdrop-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes ca-pulse {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.55; }
      }
      .ca-btn-loading {
        animation: ca-pulse 0.8s ease infinite;
      }
    `;
    document.head.appendChild(el);
  }, []);
  return null;
}

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
  { id: "aquaQuartz",  name: "アクアクオーツ",          surfaces: ["floor", "wall", "smooth"], desc: "スタンダードなモルタル風仕上げ。玄関・廊下・テラスに最適。耐久性が高く屋外でも使用可。" },
  { id: "aquaMicro",  name: "アクアマイクロコンクリート", surfaces: ["floor", "wall", "smooth"], desc: "極薄（0.5mm）で既存床の上から施工可能。リノベーションに特に向く床・壁万能タイプ。" },
  { id: "aquaNature", name: "アクアネイチャー",           surfaces: ["floor", "wall", "smooth"], desc: "石・テラコッタ・砂岩調の自然素材感。和モダン・ガーデン・テラコッタ風の空間演出に。" },
  { id: "microStucco",name: "マイクロストゥック",         surfaces: ["floor", "wall", "smooth"], desc: "超薄塗り（0.1mm）のイタリア左官調仕上げ。壁・天井・什器など繊細な表現に最適。" },
  { id: "aquaStone",  name: "アクアストーン",             surfaces: ["wall", "smooth"],          desc: "石目・大理石調の高級感ある仕上げ。壁・平滑下地専用。ライセンス講習受講者のみ施工可。" },
  { id: "metallic",   name: "メタリック",                 surfaces: ["floor", "wall", "smooth"], desc: "金属粉を混合したラグジュアリー仕上げ。アクセントウォール・商業空間・什器塗装に映える。" },
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

const QUICK_TABLE = [
  { name: "コンクリートベース（床）", application: "1kg/㎡", dryTime: "4〜6時間/塗布", thickness: "1mm", keys: ["concBase"] },
  { name: "アクアベース（壁）", application: "1kg/㎡", dryTime: "4〜6時間/塗布", thickness: "0.7〜1mm", keys: ["aquaBase"] },
  { name: "プライマー", application: "1kg/10〜14㎡", dryTime: "30分/塗布", thickness: "—", keys: ["primer"] },
  { name: "マイクロストゥック", application: "1kg/1.5㎡", dryTime: "2〜3時間/塗布", thickness: "0.1mm", keys: ["microStucco"] },
  { name: "アクアクオーツ", application: "1kg/㎡", dryTime: "2〜3時間/塗布", thickness: "0.5mm", keys: ["aquaQuartz"] },
  { name: "アクアマイクロコンクリート", application: "1kg/㎡", dryTime: "2〜3時間/塗布", thickness: "0.5mm", keys: ["aquaMicro"] },
  { name: "アクアネイチャー", application: "1〜1.5kg/㎡", dryTime: "4〜6時間/塗布", thickness: "0.7mm", keys: ["aquaNature"] },
  { name: "メタリック", application: "50g/㎡", dryTime: "40分/塗布", thickness: "0.1mm", keys: ["metallic"] },
  { name: "シーラー", application: "1L/7〜10㎡", dryTime: "3時間/塗布", thickness: "—", keys: ["sealer"] },
  { name: "クリア", application: "60〜80g/㎡", dryTime: "3時間/塗布", thickness: "—", keys: ["clearMatte", "clearSemi", "clearGloss"] },
];

const COLOR_FORMULAS = {
  microStucco: {
    title: "STUCCO FINE（1kg あたり）",
    colors: [
      { code: "#201", name: "コットン", pigments: {} },
      { code: "#202", name: "シャドウ", pigments: { BLACK_JS: 4.2 } },
      { code: "#203", name: "サハラ", pigments: { OCHER_TS: 2.8 } },
      { code: "#204", name: "スカイ", pigments: { BLUE_LS: 3.4 } },
      { code: "#205", name: "サファイア", pigments: { BLUE_LS: 50 } },
      { code: "#206", name: "ディジョン", pigments: { BLACK_JS: 0.6, OCHER_TS: 18, OXIDE_RED_YS: 0.6 } },
      { code: "#207", name: "カカオ", pigments: { BLACK_JS: 12, OXIDE_RED_YS: 30 } },
      { code: "#208", name: "クラウド", pigments: { BLACK_JS: 0.4 } },
      { code: "#209", name: "アメジスト", pigments: { BLUE_LS: 1.4, RED_VS: 1.4 } },
      { code: "#210", name: "カナリー", pigments: { YELLOW_QS: 6.6 } },
      { code: "#211", name: "ミント", pigments: { YELLOW_QS: 1.4, GREEN_PS: 1.4 } },
      { code: "#212", name: "クリーム", pigments: { BROWN_WS: 0.8 } },
      { code: "#213", name: "グラファイト", pigments: { BLACK_JS: 12.4 } },
      { code: "#214", name: "ダブ", pigments: { BLACK_JS: 1.6 } },
      { code: "#215", name: "ルビー", pigments: { RED_VS: 45 } },
      { code: "#216", name: "タンジェリン", pigments: { ORANGE_US: 13.8 } },
      { code: "#217", name: "シナモン", pigments: { YELLOW_QS: 2.8, OXIDE_RED_YS: 4 } },
      { code: "#218", name: "カプチーノ", pigments: { BROWN_WS: 7 } },
      { code: "#219", name: "ピスタチオ", pigments: { YELLOW_QS: 1.4, OCHER_TS: 1.4, GREEN_PS: 2.8 } },
      { code: "#220", name: "モカ", pigments: { BLACK_JS: 18, GREEN_PS: 2.8, OXIDE_RED_YS: 20 } },
      { code: "#221", name: "アルハンブラ", pigments: { BLACK_JS: 0.3, OCHER_TS: 0.9, OXIDE_RED_YS: 0.04 } },
      { code: "#222", name: "アルミニウム", pigments: { BLACK_JS: 0.1 } },
      { code: "#223", name: "ベージュ", pigments: { BROWN_WS: 2.1 } },
      { code: "#224", name: "バター", pigments: { BROWN_WS: 0.3 } },
      { code: "#225", name: "セメント", pigments: { BLACK_JS: 0.8, BROWN_WS: 1, OXIDE_RED_YS: 0.4 } },
      { code: "#226", name: "クッキー", pigments: { BLACK_JS: 0.3, OCHER_TS: 2.1, OXIDE_RED_YS: 1 } },
      { code: "#227", name: "フォッシル", pigments: { BLACK_JS: 0.4, OCHER_TS: 0.9, OXIDE_RED_YS: 0.4 } },
      { code: "#228", name: "ラテ", pigments: { BLACK_JS: 0.1, OCHER_TS: 1, OXIDE_RED_YS: 0.2 } },
      { code: "#229", name: "ピーナッツ", pigments: { BLACK_JS: 0.3, OCHER_TS: 0.4, OXIDE_RED_YS: 0.2 } },
      { code: "#230", name: "セピア", pigments: { BLACK_JS: 0.5, OCHER_TS: 4.2, OXIDE_RED_YS: 0.8 } },
    ],
  },
  aquaQuartz: {
    title: "AQUA QUARTZ（1kg あたり）",
    colors: [
      { code: "#401", name: "スチール", pigments: { BLACK_JS: 3.6, OXIDE_RED_YS: 1 } },
      { code: "#402", name: "アンスラサイト", pigments: { BLACK_JS: 24.6, OXIDE_RED_YS: 6 } },
      { code: "#403", name: "サンド", pigments: { OCHER_TS: 1.8 } },
      { code: "#404", name: "ブルー", pigments: { BLUE_LS: 1.4 } },
      { code: "#405", name: "ホワイト", pigments: {} },
      { code: "#406", name: "チョコレート", pigments: { BLACK_JS: 3.6, OXIDE_RED_YS: 12 } },
      { code: "#407", name: "パールグレイ", pigments: { BLACK_JS: 0.2 } },
      { code: "#408", name: "ジャスパー", pigments: { BLACK_JS: 0.2, OXIDE_RED_YS: 5 } },
      { code: "#409", name: "ラベンダー", pigments: { BLUE_LS: 0.8, RED_VS: 0.8 } },
      { code: "#410", name: "アップル", pigments: { YELLOW_QS: 0.8, GREEN_PS: 0.8 } },
      { code: "#411", name: "アイボリー", pigments: { OCHER_TS: 0.4, BROWN_WS: 0.8 } },
      { code: "#412", name: "スレート", pigments: { BLACK_JS: 12.4, OXIDE_RED_YS: 6 } },
      { code: "#413", name: "シルバー", pigments: { BLACK_JS: 0.8, OXIDE_RED_YS: 0.4 } },
      { code: "#414", name: "サーモン", pigments: { ORANGE_US: 2.8 } },
      { code: "#415", name: "シェンナ", pigments: { YELLOW_QS: 0.3, OCHER_TS: 0.3, OXIDE_RED_YS: 0.4 } },
      { code: "#416", name: "テラコッタ", pigments: { BLACK_JS: 0.3, OXIDE_RED_YS: 10 } },
      { code: "#417", name: "タスカン", pigments: { YELLOW_QS: 1.4, OXIDE_RED_YS: 2 } },
      { code: "#418", name: "トラバーチン", pigments: { OCHER_TS: 1.8, BROWN_WS: 4.2 } },
      { code: "#419", name: "タンドラ", pigments: { OCHER_TS: 1.8, BROWN_WS: 0.4, OXIDE_RED_YS: 0.8 } },
      { code: "#420", name: "ワイン", pigments: { BLACK_JS: 0.6, BLUE_LS: 1.4, RED_VS: 4 } },
    ],
  },
  aquaMicro: {
    title: "AQUA MICROCONCRETE（1kg あたり）",
    colors: [
      { code: "#601", name: "アクアマリン", pigments: { YELLOW_QS: 0.2, GREEN_PS: 0.2 } },
      { code: "#602", name: "サンド", pigments: { OCHER_TS: 1.8 } },
      { code: "#603", name: "バサルト", pigments: { BLACK_JS: 2.4, OXIDE_RED_YS: 0.4 } },
      { code: "#604", name: "カーキ", pigments: { BROWN_WS: 3.5 } },
      { code: "#605", name: "ライトブルー", pigments: { BLUE_LS: 1.4 } },
      { code: "#606", name: "アッシュ", pigments: { BLACK_JS: 0.2 } },
      { code: "#607", name: "ナクレ", pigments: {} },
      { code: "#608", name: "ナット", pigments: { YELLOW_QS: 0.6, OXIDE_RED_YS: 1 } },
      { code: "#609", name: "オーキッド", pigments: { BLUE_LS: 0.2, RED_VS: 0.2 } },
      { code: "#610", name: "スレート", pigments: { BLACK_JS: 12 } },
      { code: "#611", name: "プラチナ", pigments: { BLACK_JS: 0.6 } },
      { code: "#612", name: "シルク", pigments: { BROWN_WS: 1 } },
      { code: "#613", name: "オータムン", pigments: { BLACK_JS: 1.2, OCHER_TS: 9, OXIDE_RED_YS: 4 } },
      { code: "#614", name: "バレリーナ", pigments: { YELLOW_QS: 0.3, OXIDE_RED_YS: 0.4 } },
      { code: "#615", name: "ブルー", pigments: { BLUE_LS: 1.4 } },
      { code: "#616", name: "シナモン", pigments: { BLACK_JS: 0.3, OCHER_TS: 2.2, OXIDE_RED_YS: 1 } },
      { code: "#617", name: "コールドグレー", pigments: { BLACK_JS: 3.1, BROWN_WS: 4.2, OXIDE_RED_YS: 2 } },
      { code: "#618", name: "クリーム", pigments: { BROWN_WS: 0.7 } },
      { code: "#619", name: "ドルフィン", pigments: { BLACK_JS: 0.5, OCHER_TS: 0.36, OXIDE_RED_YS: 0.2 } },
      { code: "#620", name: "デューン", pigments: { OCHER_TS: 0.5, BROWN_WS: 0.3, OXIDE_RED_YS: 0.3 } },
      { code: "#621", name: "フレッシュグレー", pigments: { BLACK_JS: 1, OCHER_TS: 0.9, OXIDE_RED_YS: 0.6 } },
      { code: "#622", name: "グレー 1N", pigments: { BLACK_JS: 0.1, OCHER_TS: 0.26, OXIDE_RED_YS: 0.1 } },
      { code: "#623", name: "ヘーゼルナッツ", pigments: { OCHER_TS: 0.7, BROWN_WS: 0.4, OXIDE_RED_YS: 0.5, GREEN_PS: 0.2 } },
      { code: "#624", name: "ジェイド", pigments: { BLACK_JS: 0.26, OCHER_TS: 0.9, OXIDE_RED_YS: 0.04 } },
      { code: "#625", name: "リード", pigments: { BLACK_JS: 2.5, OCHER_TS: 0.2, OXIDE_RED_YS: 1.5 } },
      { code: "#626", name: "ライムストーン", pigments: { BLACK_JS: 0.26, OCHER_TS: 0.36, OXIDE_RED_YS: 0.2 } },
      { code: "#627", name: "ミンク", pigments: { BLACK_JS: 0.1, OCHER_TS: 1, OXIDE_RED_YS: 0.2 } },
      { code: "#628", name: "ムーングレー", pigments: { BLACK_JS: 0.4, OCHER_TS: 0.9, OXIDE_RED_YS: 0.4 } },
      { code: "#629", name: "マウス", pigments: { BLACK_JS: 0.2, OCHER_TS: 0.2, OXIDE_RED_YS: 0.2 } },
      { code: "#630", name: "オーシャン", pigments: { BLACK_JS: 7.4, BLUE_LS: 2.1, OCHER_TS: 0.5 } },
      { code: "#631", name: "ピスタチオ", pigments: { BLACK_JS: 0.5, OCHER_TS: 1.8, OXIDE_RED_YS: 0.08 } },
      { code: "#632", name: "サンドストーン", pigments: { BLACK_JS: 0.5, OCHER_TS: 4.3, OXIDE_RED_YS: 0.8 } },
      { code: "#633", name: "スモーク", pigments: { BLACK_JS: 0.8, BROWN_WS: 1, OXIDE_RED_YS: 0.5 } },
    ],
  },
  aquaNature: {
    title: "AQUA NATURE（1kg あたり）",
    colors: [
      { code: "#501", name: "スチール", pigments: { BLACK_JS: 1.8, OXIDE_RED_YS: 0.5 } },
      { code: "#502", name: "アンスラサイト", pigments: { BLACK_JS: 12.3, OXIDE_RED_YS: 3 } },
      { code: "#503", name: "サンド", pigments: { OCHER_TS: 0.9 } },
      { code: "#504", name: "ブルー", pigments: { BLUE_LS: 0.7 } },
      { code: "#505", name: "ホワイト", pigments: {} },
      { code: "#506", name: "チョコレート", pigments: { BLACK_JS: 1.8, OXIDE_RED_YS: 6 } },
      { code: "#507", name: "パールグレイ", pigments: { BLACK_JS: 0.1 } },
      { code: "#508", name: "ジャスパー", pigments: { BLACK_JS: 0.1, OXIDE_RED_YS: 2.5 } },
      { code: "#509", name: "ラベンダー", pigments: { BLUE_LS: 0.4, RED_VS: 0.4 } },
      { code: "#510", name: "アップル", pigments: { YELLOW_QS: 0.4, GREEN_PS: 0.4 } },
      { code: "#511", name: "アイボリー", pigments: { OCHER_TS: 0.2, BROWN_WS: 0.4 } },
      { code: "#512", name: "スレート", pigments: { BLACK_JS: 6.2, OXIDE_RED_YS: 3 } },
      { code: "#513", name: "シルバー", pigments: { BLACK_JS: 0.4, OXIDE_RED_YS: 0.2 } },
      { code: "#514", name: "サーモン", pigments: { ORANGE_US: 1.4 } },
      { code: "#515", name: "シェンナ", pigments: { YELLOW_QS: 0.2, OCHER_TS: 0.2, OXIDE_RED_YS: 0.3 } },
      { code: "#516", name: "テラコッタ", pigments: { BLACK_JS: 0.2, OXIDE_RED_YS: 5 } },
      { code: "#517", name: "タスカン", pigments: { YELLOW_QS: 0.7, OXIDE_RED_YS: 1 } },
      { code: "#518", name: "トラバーチン", pigments: { OCHER_TS: 0.9, BROWN_WS: 2.1 } },
      { code: "#519", name: "タンドラ", pigments: { OCHER_TS: 0.9, BROWN_WS: 0.2, OXIDE_RED_YS: 0.4 } },
      { code: "#520", name: "ワイン", pigments: { BLACK_JS: 0.3, BLUE_LS: 0.7, RED_VS: 2 } },
    ],
  },
  aquaStone: {
    title: "AQUA STONE / Resin（1kg あたり）",
    colors: [
      { code: "#801", name: "ホワイト", pigments: {} },
      { code: "#802", name: "パールグレイ", pigments: { BLACK_JS: 0.6 } },
      { code: "#803", name: "シルバー", pigments: { BLACK_JS: 3 } },
      { code: "#804", name: "スチール", pigments: { BLACK_JS: 8.6 } },
      { code: "#805", name: "スレート", pigments: { BLACK_JS: 24.6 } },
      { code: "#806", name: "アイボリー", pigments: { BROWN_WS: 2.8 } },
      { code: "#807", name: "バニラ", pigments: { OCHER_TS: 1.5 } },
      { code: "#808", name: "トラバーチン", pigments: { BROWN_WS: 14 } },
      { code: "#809", name: "シェンナ", pigments: { YELLOW_QS: 1.4, OCHER_TS: 1.4, OXIDE_RED_YS: 2 } },
      { code: "#810", name: "タスカン", pigments: { YELLOW_QS: 5.6, OXIDE_RED_YS: 8 } },
      { code: "#811", name: "サンド", pigments: { OCHER_TS: 5.4 } },
      { code: "#812", name: "アルベロ", pigments: { OCHER_TS: 12.6 } },
      { code: "#813", name: "マンゴー", pigments: { OCHER_TS: 9, OXIDE_RED_YS: 2 } },
      { code: "#814", name: "キャラメル", pigments: { OCHER_TS: 36, OXIDE_RED_YS: 1 } },
      { code: "#815", name: "タンドラ", pigments: { OCHER_TS: 5.4, BROWN_WS: 1.4, OXIDE_RED_YS: 2 } },
      { code: "#816", name: "ジャスパー", pigments: { BLACK_JS: 1.2, OXIDE_RED_YS: 30 } },
      { code: "#817", name: "テラコッタ", pigments: { BLACK_JS: 2.5, OXIDE_RED_YS: 60 } },
      { code: "#818", name: "コーラル", pigments: { OXIDE_RED_YS: 20 } },
      { code: "#819", name: "ウェンジ", pigments: { BLACK_JS: 37, GREEN_PS: 5.6, OXIDE_RED_YS: 40 } },
      { code: "#820", name: "ペールピンク", pigments: { RED_VS: 1.4 } },
    ],
  },
};

const PIGMENT_COLUMNS = [
  { key: "BLACK_JS", label: "BLACK JS" },
  { key: "BLUE_LS", label: "BLUE LS" },
  { key: "YELLOW_QS", label: "YELLOW QS" },
  { key: "OCHER_TS", label: "OCHER TS" },
  { key: "GREEN_PS", label: "GREEN PS" },
  { key: "BROWN_WS", label: "BROWN WS" },
  { key: "ORANGE_US", label: "ORANGE US" },
  { key: "OXIDE_RED_YS", label: "OXIDE RED YS" },
  { key: "RED_VS", label: "RED VS" },
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
  if (mat.perBase) return [{ sizeIdx: 0, qty: 0 }]; // qty will be overridden by linked base
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
function MaterialCard({ materialKey, index = 0, autoSel, manualSel, onManualChange, area, note = "", onNoteChange = () => {} }) {
  const mat = MATERIALS[materialKey];
  if (!mat) return null;
  const isM = !!manualSel;
  const sel = isM ? manualSel : autoSel;
  const items = calcLineItems(materialKey, sel);
  const cost = items.reduce((s, i) => s + i.subtotal, 0);
  const cov = items.reduce((s, i) => s + (i.totalCov || 0), 0);
  const hasSz = mat.sizes.length > 1 && !mat.perBase;

  return (
    <div className="ca-card" style={{
      background: C.white, borderRadius: 4, marginBottom: 10,
      animationDelay: `${index * 0.05}s`,
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
              <button onClick={() => isM && (() => { const u = [...sel]; u[idx] = { ...u[idx], qty: Math.max(0, u[idx].qty - 1) }; onManualChange(materialKey, u); })()}
                disabled={!isM || item.qty <= 0}
                style={{
                  width: 26, height: 26, borderRadius: 3, border: `1px solid ${C.border}`,
                  background: (!isM || item.qty <= 0) ? C.borderLt : C.white,
                  cursor: (!isM || item.qty <= 0) ? "default" : "pointer",
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
      {isM && cov > area && area > 0 && (() => {
        const jobCost = Math.round(cost * area / cov);
        const surplusCov = cov - area;
        const surplusVal = cost - jobCost;
        return (
          <div style={{ margin: "0 16px 8px", padding: "10px 12px", borderRadius: 4, background: "#f0f7f2", border: "1px solid #b2dfca" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#3d7a58", marginBottom: 8 }}>📦 余り材料の試算</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <div>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>購入合計</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{fmt(cost)}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{cov.toFixed(1)}㎡分</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>この現場の実質費用</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#3d7a58" }}>{fmt(jobCost)}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{area.toFixed(1)}㎡分</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>余り材料</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>{surplusCov.toFixed(1)}㎡</div>
                <div style={{ fontSize: 10, color: C.muted }}>残存価値 {fmt(surplusVal)}</div>
              </div>
            </div>
          </div>
        );
      })()}
      {isM && (
        <div style={{ padding: "0 16px 12px" }}>
          <textarea
            value={note}
            onChange={(e) => onNoteChange(materialKey, e.target.value)}
            placeholder="調整理由を記録（例：5kg×1個に変更 → 余り20㎡分は次現場へ）"
            rows={2}
            style={{
              width: "100%", padding: "6px 10px", borderRadius: 3,
              border: `1px dashed ${C.accent}`, fontSize: 11, color: C.sub,
              resize: "none", fontFamily: "inherit", boxSizing: "border-box",
              background: C.accentLt, outline: "none",
            }}
          />
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

/* ━━━ PDF出力 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function printEstimate({ projectName, sqm, finish, surf, clearType, workflow, autoSel, manual, pigments, matTotal, pigTotal, grand, uPrice, memo = "", laborCost = 0, taxIncl = false, estNo = "" }) {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,"0")}${String(today.getDate()).padStart(2,"0")}`;
  const finishName = FINISH_OPTIONS.find((f) => f.id === finish)?.name || finish;
  const surfName = SURFACE_OPTIONS.find((s) => s.id === surf)?.name || surf;
  const clearName = CLEAR_OPTIONS.find((c) => c.id === clearType)?.name || clearType;
  const tx = taxIncl ? 1.1 : 1;
  const fT = (v) => fmt(Math.round(v * tx));
  const labor = parseFloat(laborCost) || 0;
  const totalWithLabor = grand + labor;

  const matRows = workflow.map((k) => {
    const mat = MATERIALS[k];
    const items = calcLineItems(k, manual[k] || autoSel[k] || []);
    return items.map((item) =>
      `<tr>
        <td>${mat.name.replace(/【\d】\s*/, "")}</td>
        <td>${item.label}</td>
        <td style="text-align:right">${item.qty}個</td>
        <td style="text-align:right">${fmt(item.price)}</td>
        <td style="text-align:right">${fmt(item.subtotal)}</td>
      </tr>`
    ).join("");
  }).join("");

  const pigRows = pigments.map((sp) => {
    const p = PIGMENTS.find((x) => x.id === sp.id);
    if (!p) return "";
    const sz = p.sizes[sp.sizeIdx];
    return `<tr>
      <td>${p.name}</td>
      <td>${sz.label}</td>
      <td style="text-align:right">${sp.qty}個</td>
      <td style="text-align:right">${fmt(sz.price)}</td>
      <td style="text-align:right">${fmt(sz.price * sp.qty)}</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>${dateStr}_${projectName || "現場"}_CimentArt見積</title>
<style>
  body { font-family: "Noto Sans JP","Hiragino Sans",sans-serif; color: #1a1a1a; margin: 0; padding: 24px; font-size: 13px; }
  h1 { font-size: 20px; color: #8b7355; margin: 0 0 4px; }
  .sub { color: #999; font-size: 11px; margin: 0 0 20px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 20px; }
  .info-box { border: 1px solid #e0ddd8; border-radius: 4px; padding: 10px 14px; }
  .info-box .label { font-size: 10px; color: #999; font-weight: 600; }
  .info-box .value { font-size: 16px; font-weight: 800; color: #2c2c2c; margin-top: 2px; }
  .info-box .value.accent { color: #c9a96e; font-size: 18px; }
  .section-title { font-size: 13px; font-weight: 700; color: #8b7355; border-left: 3px solid #8b7355; padding-left: 8px; margin: 16px 0 8px; }
  .workflow { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 16px; }
  .step { background: #f3efe8; color: #6b563e; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 3px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #f7f6f4; padding: 7px 10px; font-weight: 600; color: #999; font-size: 11px; border-bottom: 2px solid #e0ddd8; text-align: left; }
  td { padding: 7px 10px; border-bottom: 1px solid #f0eeea; }
  .total-box { margin-top: 16px; border: 2px solid #8b7355; border-radius: 4px; padding: 16px; background: #f3efe8; }
  .total-row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; }
  .grand { font-size: 22px; font-weight: 800; color: #8b7355; }
  .footer { margin-top: 24px; font-size: 10px; color: #bbb; border-top: 1px solid #e0ddd8; padding-top: 10px; }
  @media print { body { padding: 12px; } }
</style>
</head>
<body>
<div style="display:flex;justify-content:space-between;align-items:flex-start">
  <div>
    <h1>CimentArt 材料費見積</h1>
    <p class="sub">Cement Artist Nu☆Man（株式会社KENSIN） — ${today.toLocaleDateString("ja-JP")}</p>
  </div>
  ${estNo ? `<div style="font-size:11px;color:#999;text-align:right;margin-top:4px">見積番号<br><strong style="font-size:13px;color:#8b7355">${estNo}</strong></div>` : ""}
</div>

<div class="info-grid">
  <div class="info-box"><div class="label">現場名</div><div class="value" style="font-size:14px">${projectName || "—"}</div></div>
  <div class="info-box"><div class="label">施工面積</div><div class="value">${sqm}㎡</div></div>
  <div class="info-box"><div class="label">㎡単価（材料費）</div><div class="value accent">${fT(uPrice)}/㎡</div></div>
</div>
${memo ? `<div style="background:#f7f6f4;border-left:3px solid #8b7355;padding:8px 12px;font-size:11px;color:#555;margin-bottom:16px;border-radius:0 4px 4px 0"><strong>現場メモ：</strong>${memo}</div>` : ""}

<div class="section-title">施工条件</div>
<table style="margin-bottom:12px">
  <tr><th>仕上げ材</th><th>施工箇所</th><th>クリア仕上げ</th></tr>
  <tr><td>${finishName}</td><td>${surfName}</td><td>${clearName}</td></tr>
</table>

<div class="section-title">施工手順</div>
<div class="workflow">
  ${workflow.map((k) => `<span class="step">${MATERIALS[k]?.name || k}</span>`).join('<span style="color:#ccc;margin:0 2px">→</span>')}
</div>

<div class="section-title">材料明細</div>
<table>
  <thead><tr><th>材料名</th><th>サイズ</th><th style="text-align:right">個数</th><th style="text-align:right">単価</th><th style="text-align:right">小計</th></tr></thead>
  <tbody>${matRows}</tbody>
</table>

${pigRows ? `<div class="section-title">顔料</div>
<table>
  <thead><tr><th>顔料名</th><th>サイズ</th><th style="text-align:right">個数</th><th style="text-align:right">単価</th><th style="text-align:right">小計</th></tr></thead>
  <tbody>${pigRows}</tbody>
</table>` : ""}

<div class="total-box">
  <div class="total-row"><span>材料費</span><span>${fT(matTotal)}</span></div>
  ${pigTotal > 0 ? `<div class="total-row"><span>顔料</span><span>${fT(pigTotal)}</span></div>` : ""}
  ${labor > 0 ? `<div class="total-row"><span>施工費・諸経費</span><span>${fT(labor)}</span></div>` : ""}
  <div class="total-row" style="border-top:1px solid #c9a96e;padding-top:10px;margin-top:6px;font-weight:800">
    <span>合計${taxIncl ? "（税込10%）" : "（税抜）"}</span><span class="grand">${fT(totalWithLabor)}</span>
  </div>
  <div style="text-align:right;font-size:11px;color:#8b7355;margin-top:4px">㎡単価 ${fT(labor > 0 ? Math.round(totalWithLabor / sqm) : uPrice)}/㎡${labor > 0 ? "（施工込）" : ""}</div>
</div>

<div class="footer">※数量は自動最適化による概算です。${!taxIncl ? "消費税は含みません。" : ""}本見積の有効期限は発行日より30日間です。</div>
</body>
</html>`;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 500);
}

/* ━━━ localStorage helpers ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const LS_KEY = "cimentart_saved_v1";

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}

function writeSaved(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

function genEstNo() {
  const now = new Date();
  const d = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}`;
  const seqKey = `cimentart_seq_${d}`;
  const seq = parseInt(localStorage.getItem(seqKey) || "0") + 1;
  localStorage.setItem(seqKey, String(seq));
  return `EST-${d}-${String(seq).padStart(3, "0")}`;
}

function saveToLocal({ projectName, area, surface, finish, clearType, pigments, manual, grand, uPrice, sqm, memo }) {
  const list = loadSaved();
  const now = new Date();
  const key = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}_${projectName || "unnamed"}`;
  const existing = list.find((e) => e.key === key);
  const estNo = existing?.estNo || genEstNo();
  const entry = { key, estNo, projectName, area, surface, finish, clearType, pigments, manual, grand, uPrice, sqm, memo: memo || "", savedAt: now.toLocaleString("ja-JP") };
  const idx = list.findIndex((e) => e.key === key);
  if (idx >= 0) list[idx] = entry; else list.unshift(entry);
  writeSaved(list.slice(0, 30));
  return estNo;
}

/* ━━━ SavedPanel ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function SavedPanel({ open, onClose, onRestore }) {
  const [list, setList] = useState([]);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("date"); // "date" | "amount" | "area"
  useEffect(() => { if (open) setList(loadSaved()); }, [open]);
  if (!open) return null;

  const del = (key) => {
    const next = list.filter((e) => e.key !== key);
    writeSaved(next);
    setList(next);
  };

  const filtered = list
    .filter((e) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (e.projectName || "").toLowerCase().includes(q) ||
        (e.estNo || "").toLowerCase().includes(q) ||
        (FINISH_OPTIONS.find((f) => f.id === e.finish)?.name || "").includes(q);
    })
    .slice()
    .sort((a, b) => {
      if (sortBy === "amount") return b.grand - a.grand;
      if (sortBy === "area")   return b.sqm - a.sqm;
      return 0; // "date" = already in save order
    });

  return (
    <div className="ca-backdrop" style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.35)", display: "flex", justifyContent: "center", alignItems: "flex-end" }} onClick={onClose}>
      <div style={{ background: C.white, borderRadius: "12px 12px 0 0", width: "100%", maxWidth: 780, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 -4px 20px rgba(0,0,0,.1)" }} className="ca-panel-inner" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 2px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border }} />
        </div>
        <div style={{ padding: "8px 20px 12px", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, background: C.white, zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>保存済み見積 <span style={{ fontSize: 12, fontWeight: 400, color: C.muted }}>（{list.length}件）</span></h2>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.borderLt, fontSize: 14, cursor: "pointer", color: C.sub }}>✕</button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="現場名・見積番号・仕上げ材で検索"
              style={{ flex: 1, padding: "7px 10px", borderRadius: 4, border: `1px solid ${C.border}`, fontSize: 12, outline: "none" }}
              onFocus={(e) => (e.target.style.borderColor = C.accent)} onBlur={(e) => (e.target.style.borderColor = C.border)} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: "7px 10px", borderRadius: 4, border: `1px solid ${C.border}`, fontSize: 12, cursor: "pointer", color: C.sub }}>
              <option value="date">新しい順</option>
              <option value="amount">金額順</option>
              <option value="area">面積順</option>
            </select>
          </div>
        </div>
        <div style={{ padding: "12px 20px 24px" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: C.muted, padding: "32px 0", fontSize: 13 }}>
              {list.length === 0 ? "保存済みの見積はありません" : "検索結果がありません"}
            </div>
          ) : (
            filtered.map((entry) => {
              const finishName = FINISH_OPTIONS.find((f) => f.id === entry.finish)?.name || entry.finish;
              return (
                <div key={entry.key} style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: "12px 14px", marginBottom: 8, background: C.bg }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{entry.projectName || "（現場名なし）"}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{entry.savedAt} ／ {finishName} ／ {entry.sqm}㎡{entry.estNo && <span style={{ marginLeft: 6, background: C.accentLt, color: C.accentDk, borderRadius: 3, padding: "1px 5px", fontWeight: 700 }}>{entry.estNo}</span>}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: C.accent, marginTop: 4 }}>{fmt(entry.grand)} <span style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>（{fmt(entry.uPrice)}/㎡）</span></div>
                      {entry.memo && <div style={{ fontSize: 11, color: C.sub, marginTop: 3, fontStyle: "italic" }}>📝 {entry.memo}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => { onRestore(entry); onClose(); }} style={{
                        padding: "6px 12px", borderRadius: 3, border: `1.5px solid ${C.accent}`,
                        background: C.accentLt, color: C.accentDk, fontSize: 11, fontWeight: 700, cursor: "pointer",
                      }}>復元</button>
                      <button onClick={() => del(entry.key)} style={{
                        padding: "6px 10px", borderRadius: 3, border: `1px solid ${C.border}`,
                        background: C.white, color: C.ng, fontSize: 11, fontWeight: 600, cursor: "pointer",
                      }}>削除</button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

/* ━━━ OrderListPanel ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function OrderListPanel({ open, onClose, workflow, autoSel, manual, pigments, sqm, projectName }) {
  if (!open) return null;

  // 材料ごとに集計
  const matItems = workflow.flatMap((k) => {
    const mat = MATERIALS[k];
    return calcLineItems(k, manual[k] || autoSel[k] || []).map((item) => ({
      category: mat?.name || k,
      label: item.label,
      qty: item.qty,
      unit: "個",
      price: item.price,
      subtotal: item.subtotal,
    }));
  });

  const pigItems = pigments.map((sp) => {
    const p = PIGMENTS.find((x) => x.id === sp.id);
    if (!p) return null;
    const sz = p.sizes[sp.sizeIdx];
    return { category: "顔料", label: `${p.name} ${sz.label}`, qty: sp.qty, unit: "個", price: sz.price, subtotal: sz.price * sp.qty };
  }).filter(Boolean);

  const allItems = [...matItems, ...pigItems];
  const total = allItems.reduce((s, i) => s + i.subtotal, 0);

  const printOrder = () => {
    const today = new Date();
    const rows = allItems.map((i) =>
      `<tr><td>${i.category}</td><td>${i.label}</td><td style="text-align:right">${i.qty}${i.unit}</td><td style="text-align:right">${fmt(i.price)}</td><td style="text-align:right">${fmt(i.subtotal)}</td><td style="width:80px;border-bottom:1px solid #ccc">&nbsp;</td></tr>`
    ).join("");
    const html = `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>発注リスト</title>
<style>body{font-family:"Noto Sans JP",sans-serif;padding:20px;font-size:12px}h2{font-size:16px;color:#8b7355;margin:0 0 4px}
table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#f7f6f4;padding:7px 10px;font-size:11px;color:#999;border-bottom:2px solid #ddd;text-align:left}
td{padding:7px 10px;border-bottom:1px solid #f0eeea}@media print{body{padding:8px}}</style></head>
<body><h2>発注リスト — ${projectName || "（現場名未設定）"}</h2>
<p style="font-size:11px;color:#999;margin:0 0 12px">${today.toLocaleDateString("ja-JP")} ／ 施工面積 ${sqm}㎡</p>
<table><thead><tr><th>材料種別</th><th>品名・サイズ</th><th style="text-align:right">数量</th><th style="text-align:right">単価</th><th style="text-align:right">小計</th><th>確認</th></tr></thead>
<tbody>${rows}</tbody></table>
<div style="margin-top:16px;text-align:right;font-size:14px;font-weight:800;color:#8b7355">合計（税抜）：${fmt(total)}</div>
</body></html>`;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  };

  return (
    <div className="ca-backdrop" style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.35)", display: "flex", justifyContent: "center", alignItems: "flex-end" }} onClick={onClose}>
      <div style={{ background: C.white, borderRadius: "12px 12px 0 0", width: "100%", maxWidth: 780, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 -4px 20px rgba(0,0,0,.1)" }} className="ca-panel-inner" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 2px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border }} />
        </div>
        <div style={{ padding: "14px 20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>発注リスト</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={printOrder} style={{ padding: "7px 14px", borderRadius: 4, border: `1.5px solid ${C.accent}`, background: C.accent, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>印刷</button>
              <button onClick={onClose} style={{ padding: "7px 12px", borderRadius: 4, border: `1px solid ${C.border}`, background: C.white, color: C.sub, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>閉じる</button>
            </div>
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>施工面積 {sqm}㎡ の発注目安。各列を確認チェックとしてお使いください。</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {["材料種別", "品名・サイズ", "数量", "単価", "小計"].map((h, i) => (
                  <th key={h} style={{ padding: "7px 10px", fontWeight: 600, fontSize: 11, color: C.sub, borderBottom: `2px solid ${C.border}`, textAlign: i >= 2 ? "right" : "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allItems.map((item, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.borderLt}`, background: i % 2 === 0 ? C.white : C.bg }}>
                  <td style={{ padding: "8px 10px", fontSize: 11, color: C.muted, fontWeight: 600 }}>{item.category}</td>
                  <td style={{ padding: "8px 10px", fontWeight: 600 }}>{item.label}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700 }}>{item.qty}{item.unit}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", color: C.muted }}>{fmt(item.price)}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: C.accentDk }}>{fmt(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: "right", marginTop: 14, fontSize: 15, fontWeight: 800, color: C.accent }}>合計（税抜）：{fmt(total)}</div>
        </div>
      </div>
    </div>
  );
}

/* ━━━ ComparePanel ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ComparePanel({ open, onClose, sqm, surf, clearType }) {
  const [finA, setFinA] = useState("aquaQuartz");
  const [finB, setFinB] = useState("aquaMicro");
  if (!open) return null;

  const calcCost = (fin) => {
    if (sqm <= 0) return null;
    const wf = getWorkflow(fin, surf, clearType);
    const sel = {};
    wf.forEach((k) => { sel[k] = autoOptimize(k, sqm); });
    if (sel.resin && sel.concBase) {
      const q = sel.concBase.reduce((s, i) => s + i.qty, 0);
      sel.resin = [{ sizeIdx: 0, qty: q }];
    }
    const total = wf.reduce((s, k) => s + calcLineItems(k, sel[k] || []).reduce((a, i) => a + i.subtotal, 0), 0);
    const uPrice = Math.round(total / sqm);
    return { total, uPrice, wf, sel };
  };

  const resA = calcCost(finA);
  const resB = calcCost(finB);

  const ColHeader = ({ fin, setFin }) => (
    <div style={{ flex: 1 }}>
      <select value={fin} onChange={(e) => setFin(e.target.value)}
        style={{ width: "100%", padding: "8px 10px", borderRadius: 4, border: `1.5px solid ${C.accent}`, fontSize: 13, fontWeight: 700, color: C.accentDk, background: C.accentLt, cursor: "pointer" }}>
        {FINISH_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
    </div>
  );

  const CostCard = ({ res, fin }) => {
    if (!res) return <div style={{ flex: 1, textAlign: "center", color: C.muted, fontSize: 12, padding: 20 }}>面積を入力してください</div>;
    const finDef = FINISH_OPTIONS.find((f) => f.id === fin);
    return (
      <div style={{ flex: 1 }}>
        <div style={{ background: C.dark, borderRadius: 4, padding: "14px 16px", marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: "#999", marginBottom: 2 }}>材料費合計</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.gold }}>{fmt(res.total)}</div>
          <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>㎡単価 {fmt(res.uPrice)}/㎡</div>
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, lineHeight: 1.5 }}>{finDef?.desc}</div>
        {res.wf.map((k) => {
          const items = calcLineItems(k, res.sel[k] || []);
          const cost = items.reduce((s, i) => s + i.subtotal, 0);
          return (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${C.borderLt}`, fontSize: 12 }}>
              <span style={{ color: C.text, fontWeight: 600 }}>{MATERIALS[k]?.name || k}</span>
              <span style={{ color: C.muted }}>{fmt(cost)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const diff = resA && resB ? resA.total - resB.total : null;

  return (
    <div className="ca-backdrop" style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.35)", display: "flex", justifyContent: "center", alignItems: "flex-end" }} onClick={onClose}>
      <div style={{ background: C.white, borderRadius: "12px 12px 0 0", width: "100%", maxWidth: 900, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 -4px 20px rgba(0,0,0,.1)" }} className="ca-panel-inner" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 2px", flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border }} />
        </div>
        <div style={{ padding: "14px 20px 4px", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>仕上げ材コスト比較</h2>
          <button onClick={onClose} style={{ padding: "7px 12px", borderRadius: 4, border: `1px solid ${C.border}`, background: C.white, color: C.sub, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>閉じる</button>
        </div>
        {sqm <= 0 && <div style={{ padding: "10px 20px", fontSize: 12, color: C.ng }}>※ 施工面積を先に入力してください</div>}
        <div style={{ overflowY: "auto", padding: "12px 20px 24px" }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <ColHeader fin={finA} setFin={setFinA} />
            <div style={{ width: 28, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontWeight: 700 }}>vs</div>
            <ColHeader fin={finB} setFin={setFinB} />
          </div>
          {diff !== null && (
            <div style={{ textAlign: "center", padding: "8px", borderRadius: 4, marginBottom: 14, fontSize: 12, fontWeight: 700,
              background: diff === 0 ? C.bg : diff > 0 ? "#fff3f3" : "#f0fff0",
              color: diff === 0 ? C.sub : diff > 0 ? C.ng : "#2d7a2d",
              border: `1px solid ${diff === 0 ? C.border : diff > 0 ? "#f8c0c0" : "#b2e0b2"}`,
            }}>
              {diff === 0 ? "コストは同じです" : `左が ${fmt(Math.abs(diff))} ${diff > 0 ? "高い" : "安い"}`}
              {sqm > 0 && diff !== 0 && <span style={{ marginLeft: 8, fontWeight: 400, opacity: 0.8 }}>（㎡単価差 {fmt(Math.round(Math.abs(diff) / sqm))}/㎡）</span>}
            </div>
          )}
          <div style={{ display: "flex", gap: 12 }}>
            <CostCard res={resA} fin={finA} />
            <div style={{ width: 1, background: C.border, flexShrink: 0 }} />
            <CostCard res={resB} fin={finB} />
          </div>
        </div>
      </div>
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
    <div className="ca-backdrop" style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.35)", display: "flex", justifyContent: "center", alignItems: "flex-end" }} onClick={onClose}>
      <div style={{ background: C.white, borderRadius: "12px 12px 0 0", width: "100%", maxWidth: 780, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 -4px 20px rgba(0,0,0,.1)" }} className="ca-panel-inner" onClick={(e) => e.stopPropagation()}>
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

/* ━━━ QuickTablePanel ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function QuickTablePanel({ open, onClose, activeFinish }) {
  if (!open) return null;
  const th = { padding: "7px 10px", fontWeight: 600, fontSize: 11, color: C.muted, borderBottom: `2px solid ${C.border}`, letterSpacing: ".3px" };
  return (
    <div className="ca-backdrop" style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.35)", display: "flex", justifyContent: "center", alignItems: "flex-end" }} onClick={onClose}>
      <div style={{ background: C.white, borderRadius: "12px 12px 0 0", width: "100%", maxWidth: 780, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 -4px 20px rgba(0,0,0,.1)" }} className="ca-panel-inner" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 2px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 24px 14px", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, background: C.white, zIndex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>CimentArt 早見表</h2>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.borderLt, fontSize: 14, cursor: "pointer", color: C.sub, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: "16px 20px 24px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead><tr style={{ background: C.bg }}>
              <th style={{ ...th, textAlign: "left" }}>材料</th>
              <th style={{ ...th, textAlign: "center" }}>塗布量</th>
              <th style={{ ...th, textAlign: "center" }}>乾燥時間</th>
              <th style={{ ...th, textAlign: "center" }}>厚み</th>
            </tr></thead>
            <tbody>
              {QUICK_TABLE.map((row) => {
                const isActive = row.keys.includes(activeFinish);
                return (
                  <tr key={row.name} style={{
                    borderBottom: `1px solid ${C.borderLt}`,
                    background: isActive ? C.accentLt : "transparent",
                  }}>
                    <td style={{ padding: "8px 10px", fontWeight: isActive ? 700 : 600, color: isActive ? C.accentDk : C.text }}>
                      {isActive && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: C.accent, marginRight: 6, verticalAlign: "middle" }} />}
                      {row.name}
                    </td>
                    <td style={{ padding: "8px 10px", textAlign: "center", color: C.sub }}>{row.application}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center", color: C.sub }}>{row.dryTime}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center", color: C.sub }}>{row.thickness}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: 12, fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
            ※ 乾燥時間は気温20度の場合。クリア乾燥: GLOSS 8〜12h / SATIN 6〜12h / MATT 4〜8h
          </div>
        </div>
      </div>
    </div>
  );
}

/* ━━━ カラー配合からスウォッチ色を計算 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const PIGMENT_BASE = {
  BLACK_JS:    { rgb: [22, 20, 20], sat: 18 },
  BLUE_LS:     { rgb: [28, 72, 188], sat: 38 },
  YELLOW_QS:   { rgb: [238, 208, 18], sat: 7 },
  OCHER_TS:    { rgb: [198, 148, 42], sat: 16 },
  GREEN_PS:    { rgb: [52, 128, 52], sat: 4 },
  BROWN_WS:    { rgb: [142, 86, 30], sat: 7 },
  ORANGE_US:   { rgb: [228, 100, 18], sat: 13 },
  OXIDE_RED_YS:{ rgb: [178, 46, 22], sat: 24 },
  RED_VS:      { rgb: [198, 20, 28], sat: 38 },
};

function computeSwatchColor(pigments) {
  let r = 244, g = 239, b = 230; // セメントベース（オフホワイト）
  Object.entries(pigments).forEach(([key, amt]) => {
    if (!amt || !PIGMENT_BASE[key]) return;
    const { rgb, sat } = PIGMENT_BASE[key];
    const s = 1 - Math.exp(-amt / sat * 1.5);
    r = r + (rgb[0] - r) * s;
    g = g + (rgb[1] - g) * s;
    b = b + (rgb[2] - b) * s;
  });
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

/* ━━━ ColorFormulaPanel ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const COLOR_FORMULA_TABS = [
  { key: "microStucco", label: "マイクロストゥック" },
  { key: "aquaQuartz", label: "アクアクオーツ" },
  { key: "aquaMicro", label: "アクアマイクロコンクリート" },
  { key: "aquaNature", label: "アクアネイチャー" },
  { key: "aquaStone", label: "アクアストーン" },
];

function ColorFormulaPanel({ open, onClose, activeFinish }) {
  const [tab, setTab] = useState(activeFinish && COLOR_FORMULAS[activeFinish] ? activeFinish : "microStucco");
  if (!open) return null;
  const data = COLOR_FORMULAS[tab];
  // 使用されている顔料カラムのみ表示
  const usedCols = PIGMENT_COLUMNS.filter((col) =>
    data.colors.some((c) => c.pigments[col.key])
  );
  const th = { padding: "5px 7px", fontWeight: 600, fontSize: 10, color: C.muted, borderBottom: `2px solid ${C.border}`, whiteSpace: "nowrap", letterSpacing: ".2px" };
  return (
    <div className="ca-backdrop" style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.35)", display: "flex", justifyContent: "center", alignItems: "flex-end" }} onClick={onClose}>
      <div style={{ background: C.white, borderRadius: "12px 12px 0 0", width: "100%", maxWidth: 900, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 -4px 20px rgba(0,0,0,.1)" }} className="ca-panel-inner" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 2px", flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 24px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>カラー配合表</h2>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.borderLt, fontSize: 14, cursor: "pointer", color: C.sub, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        {/* タブ */}
        <div style={{ display: "flex", gap: 0, padding: "0 20px", borderBottom: `1px solid ${C.border}`, overflowX: "auto", flexShrink: 0 }}>
          {COLOR_FORMULA_TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "10px 14px", border: "none", background: "transparent", cursor: "pointer",
              fontSize: 12, fontWeight: tab === t.key ? 700 : 500,
              color: tab === t.key ? C.accent : C.sub,
              borderBottom: tab === t.key ? `2px solid ${C.accent}` : "2px solid transparent",
              whiteSpace: "nowrap", flexShrink: 0,
            }}>{t.label}</button>
          ))}
        </div>
        {/* テーブル */}
        <div style={{ overflowY: "auto", flex: 1, padding: "12px 16px 24px" }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>{data.title} — 顔料配合量（g）</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", fontSize: 11, minWidth: "100%" }}>
              <thead><tr style={{ background: C.bg }}>
                <th style={{ ...th, textAlign: "center", minWidth: 52 }}>No.</th>
                <th style={{ ...th, textAlign: "center", minWidth: 36 }}>色見本</th>
                <th style={{ ...th, textAlign: "left", minWidth: 90 }}>カラー名</th>
                {usedCols.map((col) => (
                  <th key={col.key} style={{ ...th, textAlign: "right", minWidth: 60 }}>{col.label}</th>
                ))}
              </tr></thead>
              <tbody>
                {data.colors.map((color) => {
                  const swatchColor = computeSwatchColor(color.pigments);
                  return (
                  <tr key={color.code} style={{ borderBottom: `1px solid ${C.borderLt}` }}>
                    <td style={{ padding: "6px 7px", textAlign: "center", color: C.muted, fontWeight: 600, fontSize: 11 }}>{color.code}</td>
                    <td style={{ padding: "4px 6px", textAlign: "center" }}>
                      <div style={{
                        width: 28, height: 20, borderRadius: 4,
                        background: swatchColor,
                        border: "1px solid rgba(0,0,0,.12)",
                        boxShadow: "inset 0 1px 2px rgba(255,255,255,.4)",
                        margin: "0 auto",
                      }} title={color.name} />
                    </td>
                    <td style={{ padding: "6px 7px", fontWeight: 600, color: C.text, whiteSpace: "nowrap" }}>{color.name}</td>
                    {usedCols.map((col) => {
                      const val = color.pigments[col.key];
                      return (
                        <td key={col.key} style={{
                          padding: "6px 7px", textAlign: "right",
                          background: val ? C.accentLt : "transparent",
                          color: val ? C.accentDk : C.borderLt,
                          fontWeight: val ? 700 : 400,
                        }}>
                          {val != null ? val : "—"}
                        </td>
                      );
                    })}
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ━━━ InventoryPanel ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function InventoryPanel({ inventory, onChange }) {
  const mats = Object.entries(inventory).filter(([, v]) => v && v.remainingArea > 0);
  const updateItem = (key, field, value) => {
    const next = { ...inventory, [key]: { ...inventory[key], [field]: value } };
    onChange(next);
  };
  const removeItem = (key) => {
    const next = { ...inventory, [key]: { ...inventory[key], remainingArea: 0 } };
    onChange(next);
  };
  return (
    <div style={{ background: C.white, borderRadius: 4, border: `1px solid ${C.border}` }}>
      <div style={{ padding: "12px 14px 8px", borderBottom: `1px solid ${C.borderLt}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>在庫一覧表</div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>余り材料の在庫管理（手入力で調整可）</div>
        </div>
        {mats.length > 0 && (
          <span style={{ fontSize: 11, fontWeight: 700, color: "#3d7a58", background: "#e8f5e9", padding: "2px 8px", borderRadius: 10 }}>{mats.length}品目</span>
        )}
      </div>
      <div style={{ padding: "10px 14px 14px" }}>
        {mats.length === 0 ? (
          <div style={{ fontSize: 11, color: C.muted, textAlign: "center", padding: "16px 0" }}>
            在庫なし<br />
            <span style={{ fontSize: 10 }}>材料カードの余り試算から追加できます</span>
          </div>
        ) : (
          mats.map(([key, item]) => (
            <div key={key} style={{ marginBottom: 10, padding: "8px 10px", background: "#f0f7f2", borderRadius: 4, border: "1px solid #b2dfca" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#3d7a58" }}>{item.name}</span>
                <button onClick={() => removeItem(key)} style={{ fontSize: 10, color: "#b54a4a", background: "none", border: "none", cursor: "pointer", padding: 0 }}>✕ 削除</button>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: C.muted, whiteSpace: "nowrap" }}>残り</span>
                <input
                  type="number"
                  value={item.remainingArea}
                  min="0"
                  step="0.5"
                  onChange={(e) => updateItem(key, 'remainingArea', Math.round(parseFloat(e.target.value || 0) * 10) / 10)}
                  style={{ width: 58, padding: "3px 6px", borderRadius: 3, border: "1px solid #b2dfca", fontSize: 13, fontWeight: 700, textAlign: "right", outline: "none", background: C.white }}
                />
                <span style={{ fontSize: 10, color: C.muted }}>㎡</span>
                <span style={{ fontSize: 11, color: C.sub, marginLeft: 2 }}>≒ {fmt(item.estimatedValue)}</span>
              </div>
              <input
                type="text"
                value={item.note || ""}
                onChange={(e) => updateItem(key, 'note', e.target.value)}
                placeholder="メモ（例：A邸の余り）"
                style={{ width: "100%", padding: "3px 6px", borderRadius: 3, border: "1px solid #b2dfca", fontSize: 10, outline: "none", fontFamily: "inherit", background: C.white, boxSizing: "border-box" }}
              />
              {item.updatedAt && <div style={{ fontSize: 9, color: C.muted, marginTop: 3 }}>更新: {item.updatedAt}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ━━━ SidebarPricePanel ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function SidebarPricePanel({ workflow, manualNotes, adjLog, onAddLog, inventory, onInventoryChange }) {
  const [logInput, setLogInput] = useState("");

  const handleAdd = () => {
    if (!logInput.trim()) return;
    onAddLog(logInput.trim());
    setLogInput("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* 単価一覧 */}
      <div style={{ background: C.white, borderRadius: 4, border: `1px solid ${C.border}` }}>
        <div style={{ padding: "12px 14px 8px", borderBottom: `1px solid ${C.borderLt}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>材料単価一覧</div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>使用材料のサイズ・定価・㎡単価</div>
        </div>
        <div style={{ maxHeight: 400, overflowY: "auto", padding: "8px 14px 12px" }}>
          {workflow.map((key) => {
            const mat = MATERIALS[key];
            if (!mat) return null;
            return (
              <div key={key} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 4, paddingLeft: 6, borderLeft: `2px solid ${C.accent}` }}>{mat.name}</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: C.bg }}>
                      <th style={{ padding: "3px 4px", fontWeight: 600, color: C.muted, textAlign: "left" }}>サイズ</th>
                      <th style={{ padding: "3px 4px", fontWeight: 600, color: C.muted, textAlign: "center" }}>施工㎡</th>
                      <th style={{ padding: "3px 4px", fontWeight: 600, color: C.muted, textAlign: "right" }}>定価</th>
                      <th style={{ padding: "3px 4px", fontWeight: 600, color: C.muted, textAlign: "right" }}>㎡単価</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mat.sizes.map((s, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.borderLt}` }}>
                        <td style={{ padding: "4px 4px", color: C.sub, fontWeight: 600 }}>{s.label}</td>
                        <td style={{ padding: "4px 4px", textAlign: "center", color: C.muted }}>{s.coverage ? `${s.coverage}㎡` : "—"}</td>
                        <td style={{ padding: "4px 4px", textAlign: "right", fontWeight: 700, color: C.text }}>{fmt(s.price)}</td>
                        <td style={{ padding: "4px 4px", textAlign: "right", color: C.accent, fontWeight: 600 }}>{s.unitPrice ? `${fmt(s.unitPrice)}/㎡` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>

      {/* 調整メモ */}
      <div style={{ background: C.white, borderRadius: 4, border: `1px solid ${C.border}` }}>
        <div style={{ padding: "12px 14px 8px", borderBottom: `1px solid ${C.borderLt}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>調整メモ</div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>変更理由・現場メモを時系列で記録</div>
        </div>
        <div style={{ padding: "10px 14px 14px" }}>
          {/* 各材料の調整理由サマリー */}
          {Object.entries(manualNotes).filter(([, v]) => v).length > 0 && (
            <div style={{ marginBottom: 10, padding: "8px 10px", background: C.accentLt, borderRadius: 3, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.accentDk, marginBottom: 6 }}>各材料の調整理由</div>
              {Object.entries(manualNotes).filter(([, v]) => v).map(([k, v]) => (
                <div key={k} style={{ fontSize: 11, color: C.text, marginBottom: 4, paddingBottom: 4, borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontWeight: 700, color: C.accent }}>{MATERIALS[k]?.name || k}：</span>{v}
                </div>
              ))}
            </div>
          )}
          {/* 自由入力ログ */}
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <textarea
              value={logInput}
              onChange={(e) => setLogInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAdd(); }}
              placeholder="追加メモを入力（Ctrl+Enterで記録）"
              rows={2}
              style={{ flex: 1, padding: "6px 10px", borderRadius: 3, border: `1px solid ${C.border}`, fontSize: 11, fontFamily: "inherit", resize: "none", outline: "none" }}
            />
            <button onClick={handleAdd} style={{
              padding: "6px 12px", borderRadius: 3, border: `1.5px solid ${C.accent}`,
              background: C.accent, color: "#fff", fontSize: 11, fontWeight: 700,
              cursor: "pointer", whiteSpace: "nowrap", alignSelf: "flex-end",
            }}>記録</button>
          </div>
          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            {adjLog.length === 0 ? (
              <div style={{ fontSize: 11, color: C.muted, textAlign: "center", padding: "12px 0" }}>まだ記録はありません</div>
            ) : (
              [...adjLog].reverse().map((entry) => (
                <div key={entry.id} style={{ padding: "7px 0", borderBottom: `1px solid ${C.borderLt}` }}>
                  <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>{entry.ts}</div>
                  <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{entry.text}</div>
                </div>
              ))
            )}
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
  const [calc, setCalc] = useState(false);
  const [taxIncl, setTaxIncl] = useState(false);
  const [laborCost, setLaborCost] = useState("");
  const [showLabor, setShowLabor] = useState(false);
  const [copyMsg, setCopyMsg] = useState("");
  const [memo, setMemo] = useState("");
  const [showDim, setShowDim] = useState(false);
  const [dimSpaces, setDimSpaces] = useState([{ name: "", l: "", w: "" }]);
  const [showRef, setShowRef] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const [showColor, setShowColor] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [manualNotes, setManualNotes] = useState({});
  const [adjLog, setAdjLog] = useState([]);

  const handleManualNote = useCallback((k, v) => {
    setManualNotes((p) => ({ ...p, [k]: v }));
  }, []);

  const addAdjLog = useCallback((text) => {
    const now = new Date();
    const ts = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setAdjLog((prev) => [...prev, { id: Date.now(), ts, text }]);
  }, []);

  const sqm = parseFloat(area) || 0;
  const fDef = FINISH_OPTIONS.find((f) => f.id === finish);
  const validSurf = fDef ? fDef.surfaces : ["floor", "wall", "smooth"];
  const surf = validSurf.includes(surface) ? surface : validSurf[0];
  const workflow = useMemo(() => getWorkflow(finish, surf, clearType), [finish, surf, clearType]);
  const autoSel = useMemo(() => {
    if (sqm <= 0) return {};
    const r = {}; workflow.forEach((k) => { r[k] = autoOptimize(k, sqm); });
    // レジンの個数をコンクリートベースの個数に連動
    if (r.resin && r.concBase) {
      const concQty = r.concBase.reduce((s, item) => s + item.qty, 0);
      r.resin = [{ sizeIdx: 0, qty: concQty }];
    }
    return r;
  }, [sqm, workflow]);

  const handleManual = useCallback((k, v) => {
    setManual((p) => {
      const n = { ...p };
      if (v === null) {
        delete n[k];
        const matName = MATERIALS[k]?.name || k;
        const now = new Date();
        const ts = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        setAdjLog((prev) => [...prev, { id: Date.now(), ts, text: `「${matName}」を自動計算に戻しました` }]);
      } else {
        if (!n[k]) {
          const matName = MATERIALS[k]?.name || k;
          const now = new Date();
          const ts = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
          setAdjLog((prev) => [...prev, { id: Date.now(), ts, text: `「${matName}」手動調整を開始` }]);
        }
        n[k] = v;
      }
      return n;
    });
  }, []);

  const dimTotal = dimSpaces.reduce((s, sp) => {
    const v = parseFloat(sp.l) * parseFloat(sp.w);
    return s + (isNaN(v) ? 0 : v);
  }, 0);
  const updateDimSpace = (i, field, val) =>
    setDimSpaces((prev) => prev.map((sp, idx) => idx === i ? { ...sp, [field]: val } : sp));
  const addDimSpace    = () => setDimSpaces((prev) => [...prev, { name: "", l: "", w: "" }]);
  const removeDimSpace = (i) => setDimSpaces((prev) => prev.filter((_, idx) => idx !== i));
  const applyDim = () => {
    if (dimTotal > 0) { setArea(String(Math.round(dimTotal * 10) / 10)); setDone(false); }
  };

  const copyToClipboard = () => {
    const finName  = FINISH_OPTIONS.find((f) => f.id === finish)?.name || finish;
    const surfName = SURFACE_OPTIONS.find((s) => s.id === surf)?.name || surf;
    const clrName  = CLEAR_OPTIONS.find((c) => c.id === clearType)?.name || clearType;
    const txR = taxIncl ? 1.1 : 1;
    const fT  = (v) => fmt(Math.round(v * txR));
    const labor = parseFloat(laborCost) || 0;
    const lines = [
      "【CimentArt 材料費見積】",
      `現場名  ：${projectName || "（未設定）"}`,
      ...(memo ? [`メモ    ：${memo}`] : []),
      `仕上げ  ：${finName} / ${surfName} / クリア${clrName}`,
      `施工面積：${sqm}㎡`,
      "",
      "■ 材料明細",
      ...workflow.flatMap((k) =>
        calcLineItems(k, manual[k] || autoSel[k] || []).map(
          (i) => `  ${MATERIALS[k]?.name}: ${i.label} × ${i.qty}個 = ${fmt(i.subtotal)}`
        )
      ),
      ...(pigments.length > 0 ? [
        "",
        "  【顔料】",
        ...pigments.map((sp) => {
          const p = PIGMENTS.find((x) => x.id === sp.id);
          return p ? `  ${p.name} ${p.sizes[sp.sizeIdx].label} × ${sp.qty}個 = ${fmt(p.sizes[sp.sizeIdx].price * sp.qty)}` : "";
        }).filter(Boolean),
      ] : []),
      "",
      "■ 合計",
      `  材料費 ：${fmt(matTotal)}`,
      ...(pigTotal > 0 ? [`  顔料   ：${fmt(pigTotal)}`] : []),
      `  小計（税抜）：${fmt(grand)}`,
      ...(taxIncl ? [`  小計（税込）：${fT(grand)}`] : []),
      ...(labor > 0 ? [
        `  施工費 ：${fmt(labor)}`,
        `  合計見積（税抜）：${fmt(grand + labor)}`,
        ...(taxIncl ? [`  合計見積（税込）：${fT(grand + labor)}`] : []),
      ] : []),
      `  ㎡単価 ：${fT(labor > 0 ? Math.round((grand + labor) / sqm) : uPrice)}/㎡`,
    ];
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopyMsg("コピーしました！");
      setTimeout(() => setCopyMsg(""), 2500);
    });
  };

  const matTotal = useMemo(() => {
    if (!done) return 0;
    return workflow.reduce((s, k) => s + calcLineItems(k, manual[k] || autoSel[k] || []).reduce((a, i) => a + i.subtotal, 0), 0);
  }, [done, workflow, autoSel, manual]);

  const surplusInfo = useMemo(() => {
    if (!done || sqm <= 0) return null;
    let totalSurplusVal = 0;
    let hasAny = false;
    workflow.forEach((k) => {
      const items = calcLineItems(k, manual[k] || autoSel[k] || []);
      const cost = items.reduce((s, i) => s + i.subtotal, 0);
      const cov = items.reduce((s, i) => s + (i.totalCov || 0), 0);
      if (cov > sqm && cov > 0) {
        totalSurplusVal += cost - Math.round(cost * sqm / cov);
        hasAny = true;
      }
    });
    if (!hasAny) return null;
    return { jobCost: matTotal - totalSurplusVal, totalSurplusVal };
  }, [done, workflow, autoSel, manual, sqm, matTotal]);

  const pigTotal = pigments.reduce((s, sp) => { const p = PIGMENTS.find((x) => x.id === sp.id); return s + (p ? p.sizes[sp.sizeIdx].price * sp.qty : 0); }, 0);
  const grand = matTotal + pigTotal;
  const uPrice = sqm > 0 ? Math.round(grand / sqm) : 0;
  const tx = taxIncl ? 1.1 : 1;
  const fmtT = (v) => fmt(Math.round(v * tx));

  const breakdown = useMemo(() => {
    if (!done || grand === 0) return [];
    const items = [];
    workflow.forEach((k) => {
      const cost = calcLineItems(k, manual[k] || autoSel[k] || []).reduce((a, i) => a + i.subtotal, 0);
      if (cost > 0) items.push({ key: k, name: MATERIALS[k]?.name || k, cost, pct: Math.round(cost / grand * 100) });
    });
    if (pigTotal > 0) items.push({ key: "pigment", name: "顔料", cost: pigTotal, pct: Math.round(pigTotal / grand * 100) });
    return items.sort((a, b) => b.cost - a.cost);
  }, [done, grand, workflow, autoSel, manual, pigTotal]);

  const inp = { width: "100%", padding: "10px 12px", borderRadius: 4, border: `1px solid ${C.border}`, fontSize: 15, boxSizing: "border-box", outline: "none", color: C.text, background: C.white };
  const btn = (a) => ({
    padding: "8px 16px", borderRadius: 4, fontSize: 13, fontWeight: 600,
    border: a ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
    background: a ? C.accentLt : C.white, color: a ? C.accent : C.sub, cursor: "pointer",
  });

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Noto Sans JP','Hiragino Sans',-apple-system,sans-serif", color: C.text }}>
      <GlobalStyles />
      {/* Header */}
      <div style={{ background: C.white, padding: "20px 20px 18px", borderBottom: `1px solid ${C.border}`, boxShadow: "0 1px 3px rgba(0,0,0,.03)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: ".5px" }}>
              <span style={{ color: C.accent }}>CimentArt</span> 材料費シミュレーター
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>Cement Artist Nu☆Man — 現場別コスト算出ツール</p>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button onClick={() => setShowSaved(true)} className="ca-header-btn" style={{
              padding: "7px 11px", borderRadius: 4, border: `1px solid ${C.border}`,
              background: C.white, color: C.sub, fontSize: 11, fontWeight: 700,
              cursor: "pointer", whiteSpace: "nowrap",
            }}>保存履歴</button>
            <button onClick={() => setShowColor(true)} className="ca-header-btn" style={{
              padding: "7px 11px", borderRadius: 4, border: `1.5px solid ${C.accent}`,
              background: C.accentLt, color: C.accentDk, fontSize: 11, fontWeight: 700,
              cursor: "pointer", whiteSpace: "nowrap",
            }}>カラー配合表</button>
            <button onClick={() => setShowQuick(true)} className="ca-header-btn" style={{
              padding: "7px 11px", borderRadius: 4, border: `1.5px solid ${C.accent}`,
              background: C.accentLt, color: C.accentDk, fontSize: 11, fontWeight: 700,
              cursor: "pointer", whiteSpace: "nowrap",
            }}>早見表</button>
            <button onClick={() => setShowRef(true)} className="ca-header-btn" style={{
              padding: "7px 11px", borderRadius: 4, border: `1.5px solid ${C.accent}`,
              background: C.white, color: C.accent, fontSize: 11, fontWeight: 700,
              cursor: "pointer", whiteSpace: "nowrap",
            }}>単価表</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: done ? 1300 : 720, margin: "0 auto", padding: "20px 16px 60px", transition: "max-width 0.3s" }}>
        <div style={done && sqm > 0 ? { display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 20, alignItems: "start" } : {}}>
        <div> {/* main column start */}
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
            <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
              {[5, 10, 15, 20, 30, 50].map((v) => {
                const active = area === String(v);
                return (
                  <button key={v} onClick={() => { setArea(String(v)); setDone(false); }}
                    style={{
                      padding: "3px 10px", borderRadius: 3, fontSize: 11, fontWeight: 700,
                      border: active ? `1.5px solid ${C.accent}` : `1px solid ${C.border}`,
                      background: active ? C.accentLt : C.white,
                      color: active ? C.accentDk : C.sub, cursor: "pointer",
                      transition: "all 0.12s",
                    }}>{v}㎡</button>
                );
              })}
            </div>

            {/* 寸法計算ツール */}
            <div style={{ marginTop: 8 }}>
              <button onClick={() => setShowDim((v) => !v)} style={{
                fontSize: 11, fontWeight: 700, color: C.accent, background: "none", border: "none",
                cursor: "pointer", padding: "2px 0", textDecoration: "underline",
              }}>{showDim ? "▲ 寸法入力を閉じる" : "▸ 寸法から面積を計算する（複数スペース対応）"}</button>
              {showDim && (
                <div style={{ marginTop: 8, padding: "12px 14px", borderRadius: 4, border: `1px solid ${C.border}`, background: C.bg }}>
                  {dimSpaces.map((sp, i) => {
                    const area_ = parseFloat(sp.l) * parseFloat(sp.w);
                    const areaStr = !isNaN(area_) && sp.l && sp.w ? `${Math.round(area_ * 10) / 10}㎡` : "—";
                    return (
                      <div key={i} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 7, flexWrap: "wrap" }}>
                        <input placeholder={`スペース${i + 1}（任意）`} value={sp.name}
                          onChange={(e) => updateDimSpace(i, "name", e.target.value)}
                          style={{ flex: "2 1 80px", padding: "7px 9px", borderRadius: 3, border: `1px solid ${C.border}`, fontSize: 12, minWidth: 0 }} />
                        <input type="number" placeholder="縦(m)" value={sp.l} min="0" step="0.1"
                          onChange={(e) => updateDimSpace(i, "l", e.target.value)}
                          style={{ flex: "1 1 54px", padding: "7px 8px", borderRadius: 3, border: `1px solid ${C.border}`, fontSize: 12, minWidth: 0 }} />
                        <span style={{ color: C.muted, fontWeight: 700, fontSize: 13 }}>×</span>
                        <input type="number" placeholder="横(m)" value={sp.w} min="0" step="0.1"
                          onChange={(e) => updateDimSpace(i, "w", e.target.value)}
                          style={{ flex: "1 1 54px", padding: "7px 8px", borderRadius: 3, border: `1px solid ${C.border}`, fontSize: 12, minWidth: 0 }} />
                        <span style={{ fontSize: 12, color: C.accentDk, fontWeight: 700, minWidth: 44 }}>{areaStr}</span>
                        {dimSpaces.length > 1 && (
                          <button onClick={() => removeDimSpace(i)} style={{
                            padding: "4px 8px", borderRadius: 3, border: `1px solid ${C.border}`,
                            background: C.white, color: C.ng, fontSize: 11, cursor: "pointer",
                          }}>✕</button>
                        )}
                      </div>
                    );
                  })}
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4, flexWrap: "wrap" }}>
                    <button onClick={addDimSpace} style={{
                      padding: "5px 12px", borderRadius: 3, border: `1px solid ${C.border}`,
                      background: C.white, color: C.sub, fontSize: 11, fontWeight: 700, cursor: "pointer",
                    }}>+ スペースを追加</button>
                    {dimTotal > 0 && (
                      <>
                        <span style={{ fontSize: 12, color: C.sub }}>合計 <strong style={{ color: C.accentDk }}>{Math.round(dimTotal * 10) / 10}㎡</strong></span>
                        <button onClick={applyDim} style={{
                          padding: "5px 14px", borderRadius: 3, border: `1.5px solid ${C.accent}`,
                          background: C.accentLt, color: C.accentDk, fontSize: 11, fontWeight: 700, cursor: "pointer",
                        }}>この面積（{Math.round(dimTotal * 10) / 10}㎡）を使う</button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
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
            {fDef?.desc && (
              <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 3, background: C.accentLt, border: `1px solid #e2d8cc`, fontSize: 11, color: C.accentDk, lineHeight: 1.6 }}>
                {fDef.desc}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 5 }}>クリア仕上げ</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CLEAR_OPTIONS.map((o) => <button key={o.id} onClick={() => { setClearType(o.id); setDone(false); }} style={btn(clearType === o.id)}>{o.name}</button>)}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 3 }}>現場メモ（任意）</label>
            <textarea value={memo} onChange={(e) => setMemo(e.target.value)}
              placeholder="注意事項・下地状況・特記事項など"
              rows={2}
              style={{ ...inp, resize: "vertical", lineHeight: 1.5, fontFamily: "inherit" }}
              onFocus={(e) => (e.target.style.borderColor = C.accent)}
              onBlur={(e) => (e.target.style.borderColor = C.border)} />
          </div>
        </div>

        {/* Workflow */}
        <div style={{ background: C.white, borderRadius: 4, padding: "11px 16px", marginBottom: 14, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 6 }}>施工手順（{workflow.length}工程）<span style={{ fontWeight: 400, marginLeft: 6 }}>— ステップにカーソルを合わせると詳細を表示</span></div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 5 }}>
            {workflow.map((key, i) => {
              const m = MATERIALS[key];
              const qt = QUICK_TABLE.find((q) => q.keys.includes(key));
              const tip = qt ? `塗布量: ${qt.application} ／ 乾燥: ${qt.dryTime}` : null;
              return (
                <span key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span title={tip || undefined}
                    style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 3, fontSize: 11, fontWeight: 600, background: C.accentLt, color: C.accentDk, whiteSpace: "nowrap", cursor: tip ? "help" : "default", borderBottom: tip ? `1px dashed ${C.accent}` : "none" }}>
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
        <button onClick={() => {
            if (sqm <= 0) return;
            setCalc(true);
            setTimeout(() => { setManual({}); setDone(true); setCalc(false); }, 420);
          }} disabled={sqm <= 0 || calc}
          className={`ca-btn-primary${calc ? " ca-btn-loading" : ""}`}
          style={{
            width: "100%", padding: "13px", borderRadius: 4, border: "none",
            background: sqm > 0 ? C.accent : C.border, color: "#fff", fontSize: 15, fontWeight: 700,
            cursor: sqm > 0 ? "pointer" : "default", marginBottom: 18,
            boxShadow: sqm > 0 ? "0 2px 8px rgba(139,115,85,.2)" : "none",
          }}>{calc ? "計算中…" : done ? "再計算する" : "材料費を算出する"}</button>

        {/* Results */}
        {done && sqm > 0 && (
          <div className="ca-result">
            {/* 税表示トグル */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
              <button onClick={() => setTaxIncl((v) => !v)} style={{
                padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer",
                border: `1.5px solid ${taxIncl ? C.accent : C.border}`,
                background: taxIncl ? C.accentLt : C.white,
                color: taxIncl ? C.accentDk : C.sub,
                transition: "all 0.15s",
              }}>{taxIncl ? "税込（10%）表示中" : "税抜表示中"}</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[{ l: "材料費合計", v: fmtT(grand), h: true }, { l: "㎡単価", v: `${fmtT(uPrice)}/㎡` }, { l: "施工面積", v: `${sqm}㎡` }].map((c) => (
                <div key={c.l} className="ca-summary-card" style={{ background: C.dark, borderRadius: 4, padding: "13px 10px", textAlign: "center" }}>
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

            {workflow.map((k, idx) => (
              <MaterialCard key={k} materialKey={k} index={idx} autoSel={autoSel[k] || []} manualSel={manual[k] || null} onManualChange={handleManual} area={sqm} note={manualNotes[k] || ""} onNoteChange={handleManualNote} />
            ))}

            <PigmentSelector pigs={pigments} onChange={setPigments} />

            <div style={{ background: C.dark, borderRadius: 4, padding: 20, marginTop: 8, border: `2px solid ${C.accent}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: surplusInfo ? 4 : 8 }}>
                <span style={{ color: "#999", fontSize: 13, fontWeight: 600 }}>材料費（購入合計）</span>
                <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>{fmtT(matTotal)}</span>
              </div>
              {surplusInfo && (
                <div style={{ marginBottom: 8, padding: "8px 10px", borderRadius: 4, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "#7db88a", fontSize: 12, fontWeight: 600 }}>うちこの現場の実質費用</span>
                    <span style={{ color: "#7db88a", fontSize: 13, fontWeight: 700 }}>{fmtT(surplusInfo.jobCost)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: C.gold, fontSize: 12, fontWeight: 600 }}>余り材料の残存価値</span>
                    <span style={{ color: C.gold, fontSize: 13, fontWeight: 700 }}>+{fmtT(surplusInfo.totalSurplusVal)}</span>
                  </div>
                </div>
              )}
              {pigTotal > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "#999", fontSize: 13, fontWeight: 600 }}>顔料</span>
                  <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>{fmtT(pigTotal)}</span>
                </div>
              )}
              <div style={{ borderTop: "1px solid #555", paddingTop: 12, marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#fff", fontSize: 15, fontWeight: 800 }}>合計{taxIncl ? "（税込）" : "（税抜）"}</span>
                <span style={{ color: C.gold, fontSize: 24, fontWeight: 800 }}>{fmtT(grand)}</span>
              </div>
              {surplusInfo && (
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ color: "#7db88a", fontSize: 12 }}>この現場の実質材料費</span>
                  <span style={{ color: "#7db88a", fontSize: 14, fontWeight: 700 }}>{fmtT(surplusInfo.jobCost + pigTotal)}</span>
                </div>
              )}
              <div style={{ textAlign: "right", marginTop: 4 }}>
                <span style={{ color: "#999", fontSize: 12 }}>㎡単価 {fmtT(uPrice)}/㎡</span>
              </div>
            </div>

            {/* 施工費加算 */}
            <div style={{ marginTop: 10 }}>
              <button onClick={() => setShowLabor((v) => !v)} style={{
                width: "100%", padding: "9px 14px", borderRadius: 4, textAlign: "left",
                border: `1px solid ${C.border}`, background: C.white, color: C.sub,
                fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", justifyContent: "space-between",
              }}>
                <span>施工費・諸経費を追加する</span>
                <span>{showLabor ? "▲" : "▼"}</span>
              </button>
              {showLabor && (
                <div style={{ border: `1px solid ${C.border}`, borderTop: "none", borderRadius: "0 0 4px 4px", padding: "14px 16px", background: C.white }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4 }}>施工費・人件費・諸経費（円・税抜）</label>
                  <input type="number" value={laborCost} onChange={(e) => setLaborCost(e.target.value)}
                    placeholder="例：80000" min="0" step="1000"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 4, border: `1px solid ${C.border}`, fontSize: 14, boxSizing: "border-box", outline: "none", color: C.text }}
                    onFocus={(e) => (e.target.style.borderColor = C.accent)}
                    onBlur={(e) => (e.target.style.borderColor = C.border)} />
                  {parseFloat(laborCost) > 0 && (() => {
                    const labor = parseFloat(laborCost);
                    const total = grand + labor;
                    const txR = taxIncl ? 1.1 : 1;
                    const fT = (v) => fmt(Math.round(v * txR));
                    return (
                      <div style={{ background: C.dark, borderRadius: 4, padding: "14px 16px", marginTop: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ color: "#999", fontSize: 12 }}>材料費</span>
                          <span style={{ color: "#fff", fontSize: 13 }}>{fT(grand)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ color: "#999", fontSize: 12 }}>施工費</span>
                          <span style={{ color: "#fff", fontSize: 13 }}>{fT(labor)}</span>
                        </div>
                        <div style={{ borderTop: "1px solid #555", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>総見積{taxIncl ? "（税込）" : "（税抜）"}</span>
                          <span style={{ color: C.gold, fontSize: 22, fontWeight: 800 }}>{fT(total)}</span>
                        </div>
                        <div style={{ textAlign: "right", marginTop: 4 }}>
                          <span style={{ color: "#999", fontSize: 11 }}>㎡単価（施工込）{fT(Math.round(total / sqm))}/㎡</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* 内訳バーグラフ */}
            {breakdown.length > 0 && (
              <div style={{ background: C.white, borderRadius: 4, padding: "14px 16px", marginTop: 12, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.sub, marginBottom: 10 }}>材料費 内訳</div>
                {breakdown.map(({ key, name, cost, pct }) => (
                  <div key={key} style={{ marginBottom: 9 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, color: C.text }}>{name}</span>
                      <span style={{ color: C.muted }}>{fmtT(cost)}<span style={{ marginLeft: 5, fontWeight: 600, color: C.accent }}>{pct}%</span></span>
                    </div>
                    <div style={{ height: 7, borderRadius: 4, background: C.borderLt, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: C.accent, transition: "width 0.7s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* アクションボタン */}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => printEstimate({ projectName, sqm, finish, surf, clearType, workflow, autoSel, manual, pigments, matTotal, pigTotal, grand, uPrice, memo, laborCost, taxIncl })}
                className="ca-btn-primary"
                style={{
                  flex: 1, padding: "11px", borderRadius: 4, border: `1.5px solid ${C.accent}`,
                  background: C.accent, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}>PDF保存</button>
              <button onClick={() => {
                saveToLocal({ projectName, area, surface: surf, finish, clearType, pigments, manual, grand, uPrice, sqm, memo });
                setSaveMsg("保存しました");
                setTimeout(() => setSaveMsg(""), 2000);
              }} className="ca-btn-primary"
                style={{
                flex: 1, padding: "11px", borderRadius: 4, border: `1.5px solid ${C.accent}`,
                background: C.accentLt, color: C.accentDk, fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>{saveMsg || "この見積を保存"}</button>
              <button onClick={copyToClipboard} className="ca-btn-primary"
                style={{
                  flex: 1, padding: "11px", borderRadius: 4, border: `1px solid ${C.border}`,
                  background: copyMsg ? "#e8f5e8" : C.white, color: copyMsg ? "#2d7a2d" : C.sub,
                  fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
                }}>{copyMsg || "テキストコピー"}</button>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => setShowOrder(true)} className="ca-btn-primary" style={{
                flex: 1, padding: "11px", borderRadius: 4,
                border: `1.5px solid ${C.accent}`, background: C.white, color: C.accent,
                fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>発注リスト</button>
              <button onClick={() => setShowCompare(true)} className="ca-btn-primary" style={{
                flex: 1, padding: "11px", borderRadius: 4,
                border: `1px solid ${C.border}`, background: C.white, color: C.sub,
                fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>仕上げ材を比較</button>
            </div>
            <button onClick={() => { setManual({}); setDone(false); }} style={{
              width: "100%", padding: "11px", borderRadius: 4, marginTop: 8,
              border: `1px solid ${C.border}`, background: C.white, color: C.sub, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>条件をクリア</button>
          </div>
        )}
        </div> {/* main column end */}

        {/* サイドバー */}
        {done && sqm > 0 && (
          <div style={{ position: "sticky", top: 16 }}>
            <SidebarPricePanel
              workflow={workflow}
              manualNotes={manualNotes}
              adjLog={adjLog}
              onAddLog={addAdjLog}
            />
          </div>
        )}
        </div> {/* grid end */}
      </div>

      <ReferencePanel open={showRef} onClose={() => setShowRef(false)} />
      <QuickTablePanel open={showQuick} onClose={() => setShowQuick(false)} activeFinish={finish} />
      <ColorFormulaPanel open={showColor} onClose={() => setShowColor(false)} activeFinish={finish} />
      <OrderListPanel open={showOrder} onClose={() => setShowOrder(false)}
        workflow={workflow} autoSel={autoSel} manual={manual} pigments={pigments} sqm={sqm} projectName={projectName} />
      <ComparePanel open={showCompare} onClose={() => setShowCompare(false)}
        sqm={sqm} surf={surf} clearType={clearType} />
      <SavedPanel open={showSaved} onClose={() => setShowSaved(false)} onRestore={(entry) => {
        setProjectName(entry.projectName || "");
        setArea(String(entry.area));
        setSurface(entry.surface);
        setFinish(entry.finish);
        setClearType(entry.clearType);
        setPigments(entry.pigments || []);
        setManual(entry.manual || {});
        setMemo(entry.memo || "");
        setDone(true);
      }} />
    </div>
  );
}
