/**
 * Caractères typographiques du contenu français.
 *
 * Ils sont nommés plutôt que tapés directement dans les chaînes : une espace
 * insécable est **invisible** dans un éditeur et indiscernable d'une espace
 * ordinaire. Un caractère qu'on ne peut ni voir ni chercher se fait écraser à
 * la première retouche du texte, sans que rien ne le signale.
 */

/**
 * Espace insécable (U+00A0). À placer entre un nombre et son unité (« 8 € »,
 * « 3 h »), autour d'un demi-cadratin de plage, et avant la ponctuation
 * double du français.
 *
 * ⚠️ C'est bien U+00A0 et **pas** U+202F, l'espace fine insécable — pourtant
 * la forme canonique en typographie française. U+202F est absente du `cmap`
 * des quatre polices du projet (Berkshire Swash, Karla regular et semi-bold,
 * Caveat) : elle basculerait sur la police de repli, voire en tofu.
 * Revérifié le 3 août 2026, après le passage à Berkshire Swash.
 */
export const NBSP = String.fromCharCode(0x00a0);

/** Demi-cadratin (U+2013) — les plages : « 17h00 – 23h00 », « 2010 – 2020 ». */
export const NDASH = String.fromCharCode(0x2013);
