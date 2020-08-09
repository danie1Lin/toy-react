# ToyReact

依照極客時間的教學製作的簡易版 React，相差甚遠，目前只以 React 官網上的範例來實驗是否可以正常運作
還不支援 DidMount 等生命週期

實現
1. 可以使用 jsx 語法糖 render 自訂 Component 以及生成  樹
2. props state 事件監聽
3. 基本生命週期，更新 props 時會重新 render，將 vdom mountTo 實體 dom
3. 用 virtaul dom 的概念減少重新 render 的 node

在教學影片之上自己進行的優化
1. 對 range 的操作: 先加入新 node 再刪除舊有 node，這樣可以不需要加入 placeholder 來防止其他 range 的位置偏移
2. 對自訂模組 (Component) 的比對深入到 vdom 來減少 rerender 範圍
