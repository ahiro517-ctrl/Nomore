// 料理データベース
// fill: お腹の膨れ具合（胃の容量に対する%ポイント）
// cal : カロリー（kcal）
// tag : カテゴリ（veg=野菜, fruit=果物, staple=主食, protein=タンパク質,
//        fried=揚げ物, snack=スナック, sweet=スイーツ, drink=飲み物, soup=汁物）
//
// 設計のキモ:
//   野菜・果物・汁物 … よく膨れて低カロリー（健康的・攻略の味方）
//   主食・タンパク質 … バランス型
//   揚げ物・スナック・スイーツ … あまり膨れないのにカロリーが高い（罠）
const FOODS = [
  // --- 野菜（よく膨れて低カロリー）---
  { name: "サラダ", emoji: "🥗", fill: 14, cal: 60, tag: "veg" },
  { name: "ブロッコリー", emoji: "🥦", fill: 11, cal: 50, tag: "veg" },
  { name: "トマト", emoji: "🍅", fill: 7, cal: 30, tag: "veg" },
  { name: "とうもろこし", emoji: "🌽", fill: 12, cal: 130, tag: "veg" },
  { name: "枝豆", emoji: "🫛", fill: 8, cal: 70, tag: "veg" },
  { name: "なす", emoji: "🍆", fill: 9, cal: 40, tag: "veg" },
  { name: "きのこソテー", emoji: "🍄", fill: 10, cal: 60, tag: "veg" },
  { name: "野菜炒め", emoji: "🥬", fill: 16, cal: 130, tag: "veg" },
  { name: "焼き芋", emoji: "🍠", fill: 15, cal: 160, tag: "veg" },

  // --- 汁物（膨れる・低カロリー）---
  { name: "味噌汁", emoji: "🍲", fill: 11, cal: 60, tag: "soup" },
  { name: "野菜スープ", emoji: "🥣", fill: 13, cal: 70, tag: "soup" },
  { name: "おでん", emoji: "🍢", fill: 12, cal: 100, tag: "soup" },

  // --- 果物 ---
  { name: "りんご", emoji: "🍎", fill: 9, cal: 80, tag: "fruit" },
  { name: "バナナ", emoji: "🍌", fill: 10, cal: 95, tag: "fruit" },
  { name: "いちご", emoji: "🍓", fill: 6, cal: 40, tag: "fruit" },
  { name: "ぶどう", emoji: "🍇", fill: 7, cal: 70, tag: "fruit" },
  { name: "もも", emoji: "🍑", fill: 8, cal: 60, tag: "fruit" },
  { name: "すいか", emoji: "🍉", fill: 10, cal: 45, tag: "fruit" },
  { name: "みかん", emoji: "🍊", fill: 7, cal: 50, tag: "fruit" },

  // --- 主食（バランス型）---
  { name: "ごはん", emoji: "🍚", fill: 22, cal: 250, tag: "staple" },
  { name: "おにぎり", emoji: "🍙", fill: 14, cal: 180, tag: "staple" },
  { name: "食パン", emoji: "🍞", fill: 12, cal: 200, tag: "staple" },
  { name: "お寿司", emoji: "🍣", fill: 15, cal: 230, tag: "staple" },
  { name: "そば", emoji: "🍜", fill: 18, cal: 300, tag: "staple" },
  { name: "サンドイッチ", emoji: "🥪", fill: 14, cal: 320, tag: "staple" },

  // --- タンパク質 ---
  { name: "焼き魚", emoji: "🐟", fill: 14, cal: 180, tag: "protein" },
  { name: "卵焼き", emoji: "🥚", fill: 7, cal: 110, tag: "protein" },
  { name: "豆腐", emoji: "🥡", fill: 10, cal: 80, tag: "protein" },
  { name: "ヨーグルト", emoji: "🥛", fill: 7, cal: 90, tag: "protein" },
  { name: "鶏むね肉", emoji: "🍗", fill: 16, cal: 230, tag: "protein" },
  { name: "ステーキ", emoji: "🥩", fill: 18, cal: 420, tag: "protein" },
  { name: "ベーコン", emoji: "🥓", fill: 6, cal: 250, tag: "protein" },
  { name: "チーズ", emoji: "🧀", fill: 5, cal: 200, tag: "protein" },

  // --- ガッツリ系（膨れるがカロリー高め）---
  { name: "ラーメン", emoji: "🍜", fill: 25, cal: 500, tag: "fried" },
  { name: "カレーライス", emoji: "🍛", fill: 23, cal: 600, tag: "fried" },
  { name: "ハンバーガー", emoji: "🍔", fill: 20, cal: 550, tag: "fried" },
  { name: "ピザ", emoji: "🍕", fill: 16, cal: 450, tag: "fried" },
  { name: "パスタ", emoji: "🍝", fill: 20, cal: 430, tag: "fried" },
  { name: "ホットドッグ", emoji: "🌭", fill: 14, cal: 350, tag: "fried" },
  { name: "タコス", emoji: "🌮", fill: 12, cal: 280, tag: "fried" },
  { name: "餃子", emoji: "🥟", fill: 12, cal: 280, tag: "fried" },

  // --- 揚げ物（罠：そこそこ膨れるがカロリー激高）---
  { name: "からあげ", emoji: "🍗", fill: 13, cal: 380, tag: "fried" },
  { name: "フライドポテト", emoji: "🍟", fill: 9, cal: 340, tag: "fried" },
  { name: "天ぷら", emoji: "🍤", fill: 11, cal: 320, tag: "fried" },

  // --- スナック（最大の罠：ほぼ膨れないのにカロリー高い）---
  { name: "ポテトチップス", emoji: "🥔", fill: 5, cal: 330, tag: "snack" },
  { name: "ポップコーン", emoji: "🍿", fill: 6, cal: 200, tag: "snack" },
  { name: "プレッツェル", emoji: "🥨", fill: 6, cal: 220, tag: "snack" },
  { name: "クッキー", emoji: "🍪", fill: 4, cal: 260, tag: "snack" },

  // --- スイーツ（罠：膨れないのにカロリー爆弾）---
  { name: "チョコ", emoji: "🍫", fill: 3, cal: 280, tag: "sweet" },
  { name: "ケーキ", emoji: "🍰", fill: 8, cal: 400, tag: "sweet" },
  { name: "アイス", emoji: "🍨", fill: 6, cal: 250, tag: "sweet" },
  { name: "ドーナツ", emoji: "🍩", fill: 7, cal: 350, tag: "sweet" },
  { name: "プリン", emoji: "🍮", fill: 6, cal: 230, tag: "sweet" },
  { name: "だんご", emoji: "🍡", fill: 6, cal: 200, tag: "sweet" },
  { name: "クロワッサン", emoji: "🥐", fill: 8, cal: 270, tag: "sweet" },
  { name: "パンケーキ", emoji: "🥞", fill: 14, cal: 450, tag: "sweet" },

  // --- 飲み物 ---
  { name: "炭酸ジュース", emoji: "🥤", fill: 4, cal: 150, tag: "drink" },
  { name: "お茶", emoji: "🍵", fill: 3, cal: 0, tag: "drink" },
];

const TAG_LABEL = {
  veg: "野菜",
  fruit: "果物",
  staple: "主食",
  protein: "タンパク質",
  fried: "ガッツリ",
  snack: "スナック",
  sweet: "スイーツ",
  drink: "飲み物",
  soup: "汁物",
};
