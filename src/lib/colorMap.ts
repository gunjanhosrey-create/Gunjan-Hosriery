const colorMap: Record<string, string> = {
  red: "#ff0000",
  blue: "#0000ff",
  green: "#008000",
  black: "#000000",
  white: "#ffffff",
  yellow: "#ffff00",
  pink: "#ffc0cb",
  purple: "#800080",
  orange: "#ffa500",
  grey: "#808080",
  gray: "#808080",
  brown: "#8b4513",
  beige: "#f5f5dc",
  cream: "#fffdd0",
  maroon: "#800000",
  olive: "#808000",
  sky: "#87ceeb",
  navy: "#000080",
  teal: "#008080",
  lime: "#00ff00",
  aqua: "#00ffff",
  silver: "#c0c0c0",
  gold: "#ffd700",
  cyan: "#00ffff",
  magenta: "#ff00ff",
  indigo: "#4b0082",
  violet: "#ee82ee",
  turquoise: "#40e0d0",
  salmon: "#fa8072",
  coral: "#ff7f50",
  tomato: "#ff6347",
  chocolate: "#d2691e",
  khaki: "#f0e68c",
  lavender: "#e6e6fa",
  peach: "#ffdab9",
  mint: "#98fb98",
  rose: "#ff007f",
  ruby: "#e0115f",
  emerald: "#50c878",
  sapphire: "#0f52ba",
  amber: "#ffbf00",
  charcoal: "#36454f",
  ivory: "#fffff0",
  pearl: "#eae0c8",
  red: "#ff0000",
  darkred: "#8b0000",
  lightred: "#ff4d4d",
  crimson: "#dc143c",

  blue: "#0000ff",
  darkblue: "#00008b",
  lightblue: "#add8e6",
  skyblue: "#87ceeb",
  deepskyblue: "#00bfff",
  navy: "#000080",

  green: "#008000",
  darkgreen: "#006400",
  lightgreen: "#90ee90",
  lime: "#00ff00",
  seagreen: "#2e8b57",
  forestgreen: "#228b22",

  yellow: "#ffff00",
  lightyellow: "#ffffe0",
  gold: "#ffd700",
  goldenrod: "#daa520",
  khaki: "#f0e68c",

  orange: "#ffa500",
  darkorange: "#ff8c00",
  coral: "#ff7f50",
  tomato: "#ff6347",

  pink: "#ffc0cb",
  hotpink: "#ff69b4",
  deeppink: "#ff1493",

  purple: "#800080",
  darkpurple: "#4b0082",
  violet: "#ee82ee",
  lavender: "#e6e6fa",
  indigo: "#4b0082",

  brown: "#8b4513",
  saddlebrown: "#8b4513",
  chocolate: "#d2691e",
  sienna: "#a0522d",
  peru: "#cd853f",

  black: "#000000",
  white: "#ffffff",
  gray: "#808080",
  darkgray: "#404040",
  lightgray: "#d3d3d3",
  silver: "#c0c0c0",
  charcoal: "#36454f",

  // PREMIUM COLORS
  beige: "#f5f5dc",
  cream: "#fffdd0",
  ivory: "#fffff0",
  pearl: "#eae0c8",

  maroon: "#800000",
  olive: "#808000",
  teal: "#008080",
  aqua: "#00ffff",
  cyan: "#00ffff",
  magenta: "#ff00ff",

  turquoise: "#40e0d0",
  mint: "#98fb98",
  emerald: "#50c878",
  jade: "#00a86b",

  sapphire: "#0f52ba",
  royalblue: "#4169e1",
  steelblue: "#4682b4",

  amber: "#ffbf00",
  honey: "#ffc30b",

  salmon: "#fa8072",
  lightsalmon: "#ffa07a",

  peach: "#ffdab9",
  apricot: "#fbceb1",

  rose: "#ff007f",
  ruby: "#e0115f",

  wine: "#722f37",
  burgundy: "#800020",

  sand: "#c2b280",
  tan: "#d2b48c",

  // EXTRA MODERN SHADES 🔥
  offwhite: "#f8f8f8",
  snow: "#fffafa",

  slategray: "#708090",
  lightslategray: "#778899",

  midnightblue: "#191970",
  dodgerblue: "#1e90ff",

  springgreen: "#00ff7f",
  lawngreen: "#7cfc00",

  orchid: "#da70d6",
  plum: "#dda0dd",

  firebrick: "#b22222",
  indianred: "#cd5c5c",

  gainsboro: "#dcdcdc",
  whitesmoke: "#f5f5f5",

  seashell: "#fff5ee",
  linen: "#faf0e6",

  moccasin: "#ffe4b5",
  bisque: "#ffe4c4",

  antiquewhite: "#faebd7",
  blanchedalmond: "#ffebcd",

  powderblue: "#b0e0e6",
  cadetblue: "#5f9ea0",

  darkcyan: "#008b8b",
  lightcyan: "#e0ffff",

  // 🔥 EXTRA FASHION COLORS
  neonblue: "#4d4dff",
  neonpink: "#ff6ec7",
  neongreen: "#39ff14",

  pastelblue: "#aec6cf",
  pastelpink: "#ffd1dc",
  pastelgreen: "#77dd77",

  deepblack: "#0a0a0a",
  softblack: "#1c1c1c",

  warmwhite: "#fdf5e6",
  coolwhite: "#f0f8ff"


  // 🔥 RED FAMILY (NEW SHADES)
  scarlet: "#ff2400",
  vermilion: "#e34234",
  carmine: "#960018",
  rubyred: "#9b111e",

  // 🔥 BLUE FAMILY
  azure: "#007fff",
  cobalt: "#0047ab",
  ultramarine: "#3f00ff",
  cerulean: "#2a52be",
  babyblue: "#89cff0",

  // 🔥 GREEN FAMILY
  chartreuse: "#7fff00",
  fern: "#4f7942",
  moss: "#8a9a5b",
  pistachio: "#93c572",
  shamrock: "#009e60",

  // 🔥 YELLOW / GOLD
  canary: "#ffff99",
  flax: "#eedc82",
  mustard: "#ffdb58",
  dandelion: "#f0e130",

  // 🔥 ORANGE / PEACH
  tangerine: "#f28500",
  pumpkin: "#ff7518",
  carrot: "#ed9121",
  melon: "#fdbcb4",

  // 🔥 PINK / ROSE
  blush: "#de5d83",
  flamingo: "#fc8eac",
  carnation: "#ffa6c9",
  watermelon: "#fc6c85",

  // 🔥 PURPLE / VIOLET
  amethyst: "#9966cc",
  heliotrope: "#df73ff",
  mulberry: "#c54b8c",
  periwinkle: "#ccccff",

  // 🔥 BROWN / EARTH
  umber: "#635147",
  russet: "#80461b",
  taupe: "#483c32",
  coffee: "#6f4e37",
  mocha: "#967969",

  // 🔥 GREY / NEUTRAL
  ash: "#b2beb5",
  platinum: "#e5e4e2",
  pewter: "#96a8a1",
  smoke: "#848884",

  // 🔥 WHITE VARIANTS
  eggshell: "#f0ead6",
  alabaster: "#faf0e6",
  ghostwhite: "#f8f8ff",

  // 🔥 BLUE-GREEN
  aquamarine: "#7fffd4",
  lagoon: "#4cb7a5",
  seafoam: "#93e9be",

  // 🔥 DARK SHADES
  onyx: "#353839",
  raven: "#0a0a0a",
  ink: "#1a1a1a",

  // 🔥 METALLIC COLORS
  bronze: "#cd7f32",
  copper: "#b87333",
  brass: "#b5a642",

  // 🔥 NEON COLORS
  neonred: "#ff073a",
  neonorange: "#ff5f1f",
  neonyellow: "#ffff33",
  neongold: "#ffdf00",

  // 🔥 PASTEL COLORS
  pastelpurple: "#c3b1e1",
  pastelyellow: "#fdfd96",
  pastelorange: "#ffb347",

  // 🔥 OCEAN / SKY
  oceangreen: "#48bf91",
  deepocean: "#003366",
  skygray: "#87a96b",

  // 🔥 FOOD COLORS 😄
  chocolatebrown: "#3d2b1f",
  strawberry: "#fc5a8d",
  blueberry: "#4f86f7",
  vanilla: "#f3e5ab",

  // 🔥 EXTRA UNIQUE COLORS
  electricblue: "#7df9ff",
  shockingpink: "#fc0fc0",
  acidgreen: "#b0bf1a",

  // 🔥 FASHION COLORS
  denim: "#1560bd",
  charcoalgray: "#36454f",
  dustyrose: "#c08081",
  olivegreen: "#6b8e23",

  // 🔥 LIGHT VARIANTS
  lightcoral: "#f08080",
  lightseagreen: "#20b2aa",
  lightsteelblue: "#b0c4de",

  // 🔥 DARK VARIANTS
  darkkhaki: "#bdb76b",
  darkmagenta: "#8b008b",
  darkslateblue: "#483d8b",

  // 🔥 EXTRA FILLERS (unique)
  butter: "#fff1a8",
  cactus: "#587d71",
  clay: "#b66a50",
  denimblue: "#2243b6",
  frost: "#e5f4e3",
  glacier: "#78b7c5",
  harbor: "#5e8c9a",
  iceberg: "#71a6d2",
  jungle: "#29ab87",
  lagoonblue: "#008080",
  maple: "#d2691e",
  night: "#0c090a",
  oceanblue: "#4f42b5",
  paprika: "#8d0226",
  quartz: "#51484f",
  rainforest: "#0b6623",
  sanddune: "#967117",
  thunder: "#332f2c",
  twilight: "#4e5180",
  velvet: "#750851",
  willow: "#9bb7d4",
  zinc: "#7f7f7f"
};
export default colorMap;