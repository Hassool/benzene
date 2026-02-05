"use client";

const ColorSwatch = ({ name, value, variable }) => (
  <div className="flex flex-col gap-2">
    <div 
      className="h-24 w-full rounded-xl shadow-inner border border-border dark:border-border-dark transition-transform hover:scale-105"
      style={{ backgroundColor: value }}
    />
    <div>
      <p className="font-bold text-text dark:text-text-dark font-rajdhani">{name}</p>
      <code className="text-xs text-text-secondary dark:text-text-dark-secondary block font-mono bg-gray-50 dark:bg-gray-800/50 p-1 rounded mt-1">
        {variable}
      </code>
      <code className="text-xs text-text-secondary dark:text-text-dark-secondary block font-mono mt-1 opacity-70">
        {value}
      </code>
    </div>
  </div>
);

const ColorPalette = ({ t }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {/* Backgrounds */}
      <ColorSwatch name={t ? t("review.colors.bg") : "Background"} value="hsl(0, 0%, 100%)" variable="bg-bg" />
      <ColorSwatch name={t ? t("review.colors.bgSec") : "Background Secondary"} value="hsl(210, 20%, 96%)" variable="bg-bg-secondary" />
      <ColorSwatch name={t ? t("review.colors.bgDark") : "Dark BG"} value="hsl(224, 47%, 11%)" variable="bg-bg-dark" />
      <ColorSwatch name={t ? t("review.colors.bgDarkSec") : "Dark Secondary"} value="hsla(221, 48%, 9%, 1.00)" variable="bg-bg-dark-secondary" />
      
      {/* Text */}
      <ColorSwatch name={t ? t("review.colors.textPrim") : "Text Primary"} value="hsl(222, 20%, 15%)" variable="text-text" />
      <ColorSwatch name={t ? t("review.colors.textSec") : "Text Secondary"} value="hsl(222, 10%, 40%)" variable="text-text-secondary" />
      <ColorSwatch name={t ? t("review.colors.textDark") : "Text Dark"} value="hsl(210, 20%, 98%)" variable="text-text-dark" />
      <ColorSwatch name={t ? t("review.colors.textDarkSec") : "Text Dark Sec"} value="hsl(210, 15%, 70%)" variable="text-text-dark-secondary" />
      
      {/* Accents */}
      <ColorSwatch name={t ? t("review.colors.blue") : "Blue 500"} value="hsl(217, 91%, 60%)" variable="bg-blue-500" />
      <ColorSwatch name={t ? t("review.colors.cyan") : "Cyan 400"} value="hsl(187, 80%, 55%)" variable="bg-cyan-400" />
      <ColorSwatch name={t ? t("review.colors.special") : "Special"} value="hsl(187, 100%, 42%)" variable="bg-special" />
      <ColorSwatch name={t ? t("review.colors.red") : "Red 500"} value="hsl(0, 84%, 60%)" variable="bg-red-500" />
    </div>
  );
};

export default ColorPalette;
