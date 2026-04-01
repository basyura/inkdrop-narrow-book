# Inkdrop v6 対応計画

## 目的

narrow-book を Inkdrop v6 で動作するように更新し、既存のノートブック選択機能と検索体験を維持する。

## 完了条件

- Inkdrop v6 上で基本操作が正常に動作する
- 既存機能に明確な後退がない

## 調査項目

- [x] package.json の engines.inkdrop と依存パッケージの見直し
- [x] lib/plugin.js で使用しているプラグイン登録 API の互換性確認
- [x] lib/narrow-book-dialog.js で使用している API と DOM 依存の確認
  - 対象: inkdrop.components、inkdrop.layouts、inkdrop.commands、inkdrop.store、useModal、サイドバー関連の CSS クラス名と DOM 構造
- [x] Inkdrop v5 から v6 への移行ガイドに基づく非互換点の洗い出し

## 調査結果

- engines.inkdrop は ^5.x のため、v6 対応への更新が必要
- inkdrop.components と inkdrop.layouts の利用は、現時点で移行ガイド上の大きな非互換対象ではない
- inkdrop.commands、inkdrop.store.getState()、useModal は大きな移行対象ではない
- 主な確認対象は DOM 依存で、`.back-button`、`.sidebar-menu-book-list-item`、`.sidebar-menu-item-all-notes`、`.editor` などの class 名変更有無を重点確認する
- semantic-ui-react の Dropdown は ReactDOM.findDOMNode に依存し、Inkdrop v6 実行時にエラーとなるため独自 UI への置き換えが必要
- 移行ガイドで挙がる @electron/remote、inkdrop.window.on()、inkdrop.main.dataStore.getLocalDB() の非互換は本プラグインでは未使用
- 移行ガイドで LESS 廃止が明記されており、styles/switch-notebook.less は styles/switch-notebook.css への移行が必要

## 対応内容

- [x] package.json の engines.inkdrop を v6 対応へ更新する
- [x] README.md の対応バージョン表記を v6 前提に見直す
- [x] styles/switch-notebook.less を styles/switch-notebook.css に移行する
- [x] semantic-ui-react 依存を除去し、lib/narrow-book-dialog.js を独自の検索 UI に置き換える
- [x] ダイアログ位置を narrow-note と同様の方式で調整する
- [ ] DOM 依存で残っている `.sidebar-menu-item-all-notes` などの参照を必要に応じて見直す
- [ ] CodeMirror 連携が必要な変更では v6 API を前提とする

## 動作確認

1. narrow-book:open でダイアログが開く
2. ノートブック選択で対象ノートブックへ遷移できる
3. `All Notes` への遷移が維持される
4. `Escape`、`Ctrl-w`、`Ctrl-n`、`Ctrl-p` が期待通り動く
5. Migemo 辞書あり・なしの両方で検索できる
