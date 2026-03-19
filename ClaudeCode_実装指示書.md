# CimentArt 材料費シミュレーター — Claude Code 実装指示書

## 概要

添付の2ファイルを基に、CimentArt材料費シミュレーターの機能拡張を行ってください。

- **設計書**: `CimentArt_シミュレーター設計書_引き継ぎ書_v1.docx`
- **現行コード**: `cimentart-calc.jsx`（React シングルファイルアプリ、約600行）

設計書のセクション5「実装タスク一覧」に優先順位付きで全タスクがまとまっています。
まず設計書を通読し、データ定義・UI構成・現行コードの構造を把握してから着手してください。

---

## 実装してほしいこと（優先順）

### Phase 1: 現行機能の修正

**1-1. 手動モードで0個入力を可能にする**
- 現在は `qty` の最小値が1だが、在庫で対応できるケースがあるため0を許可する
- 0個の場合、その材料の費用は¥0、カバー面積も0㎡として計算に反映
- 施工手順の工程自体は残す（工程として必要だが材料購入不要、という意味）

**1-2. レジンの個数ロジック**
- レジン（resin）は `perBase` フラグで固定1個になっているが、コンクリートベースの個数に連動させる
- コンクリートベース25kgに対してレジン5kgが1セット

### Phase 2: 新機能追加

**2-1. 早見表パネル**
- ヘッダーに「早見表」ボタンを追加
- 設計書セクション3-3のデータをJSONで埋め込み
- 選択中の仕上げ材をハイライト表示
- スライドアップパネル形式（単価表パネルと同じUI）

**2-2. カラー配合表パネル（最重要・最大工数）**
- ヘッダーに「カラー配合表」ボタンを追加
- 仕上げ材ごとにタブ切替で配合表テーブルを表示
- データソースは添付画像5枚（設計書セクション3-4参照）
  - STUCCO FINE: #201〜#230（30色）
  - AQUA QUARTZ: #401〜#420（20色）
  - AQUA MICROCONCRETE: #601〜#633（33色）
  - AQUA NATURE: #501〜#520（20色）
  - AQUA STONE (Resin): #801〜#820（20色）
- 設計書セクション7のJSON構造例に従ってデータ化
- 各色の顔料配合量（g/1kg）をテーブルで表示
- 顔料名のカラム: BLACK JS, BLUE LS, YELLOW QS, OCHER TS, GREEN PS, BROWN WS, ORANGE US, OXIDE RED YS, RED VS

**2-3. PDF保存機能**
- 算出結果をPDFとしてダウンロード
- ファイル名: `日付_現場名_CimentArt見積.pdf`
- 含める内容: 現場名・施工面積・仕上げ材・施工手順・材料明細（サイズ・個数・小計）・顔料・合計・㎡単価

**2-4. ツール内保存機能**
- 算出結果をアプリ内に保存（localStorage or window.storage API）
- 保存キー: 現場名 + 日付
- 過去の見積一覧を表示し、タップで復元可能に
- 削除機能も付ける

### Phase 3: 磨き上げ（余裕があれば）

- スムーズなアニメーション・トランジション
- PWA化の検討（オフライン対応）

---

## デザインルール（厳守）

- **UIカラー**: cimentartjapan.jp 公式サイトに準拠。白ベース・ウォームグレー・コンクリート調アクセント(#8B7355)
- **明るい背景色が基本**（黒背景NG）
- **スマホファースト**（現場での操作を前提）
- **「ぬーまん」は必ずひらがな表記**（ローマ字・カタカナ不可）
- **会社名**: 株式会社KENSIN（前株）
- **ブランド名**: Cement Artist Nu☆Man

---

## コード修正ルール

- **指示された箇所のみ修正し、指示していない要素は絶対に変更・削除しない**
- 現行の自動計算ロジック（autoOptimize）、手動切替（manualOverrides）、単価表パネル（ReferencePanel）、顔料セレクター（PigmentSelector）は動作確認済みなので壊さないこと
- 新機能はコンポーネント単位で追加し、既存コードへの影響を最小化する

---

## 参照リンク

- 公式サイト: https://cimentartjapan.jp/
- 各材料ページ（早見表・マニュアルPDF・カラー配合PDF）:
  - https://cimentartjapan.jp/manual/micro-stucco
  - https://cimentartjapan.jp/manual/aqua-quartz
  - https://cimentartjapan.jp/manual/aqua-microconcrete
  - https://cimentartjapan.jp/manual/aqua-nature
  - https://cimentartjapan.jp/manual/metallic
  - https://cimentartjapan.jp/manual/aqua-stone

---

以上の内容で実装を進めてください。
不明点があれば、設計書の該当セクションを確認してから質問してください。
