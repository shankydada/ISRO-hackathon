// Offline development mirror of the Google Fonts CSS. Vercel uses next/font/google normally.
const path = require("node:path");
const face = (family, file, weight) => `@font-face { font-family: '${family}'; font-style: normal; font-weight: ${weight}; font-display: swap; src: url(${path.join(__dirname, "../public/fonts", file)}) format('woff2'); }`;
module.exports = {
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap": face("Space Grotesk", "space-grotesk.woff2", "300 700"),
  "https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap": face("Manrope", "manrope.woff2", "200 800"),
  "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&display=swap": face("JetBrains Mono", "jetbrains-mono.woff2", "100 800")
};
