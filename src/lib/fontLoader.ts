// ============================================================
// lib/fontLoader.ts
//
// Dynamically injects Google Font stylesheets into the document <head>
// so that custom fonts render immediately in the visual canvas & editor.
// ============================================================

const loadedFonts = new Set<string>();

/**
 * Curated list of popular fonts available in the editor
 */
export interface FontOption {
  family: string;
  category: "sans-serif" | "serif" | "monospace" | "display";
  weights?: number[];
  isGoogleFont?: boolean;
}

export const POPULAR_FONTS: FontOption[] = [
  // Sans-Serif
  { family: "Inter", category: "sans-serif", isGoogleFont: true, weights: [300, 400, 500, 600, 700, 800] },
  { family: "Roboto", category: "sans-serif", isGoogleFont: true, weights: [300, 400, 500, 700, 900] },
  { family: "Poppins", category: "sans-serif", isGoogleFont: true, weights: [300, 400, 500, 600, 700, 800] },
  { family: "Outfit", category: "sans-serif", isGoogleFont: true, weights: [300, 400, 500, 600, 700, 800] },
  { family: "Plus Jakarta Sans", category: "sans-serif", isGoogleFont: true, weights: [300, 400, 500, 600, 700, 800] },
  { family: "Montserrat", category: "sans-serif", isGoogleFont: true, weights: [300, 400, 500, 600, 700] },
  { family: "Open Sans", category: "sans-serif", isGoogleFont: true, weights: [300, 400, 600, 700] },
  { family: "Lato", category: "sans-serif", isGoogleFont: true, weights: [300, 400, 700, 900] },
  { family: "DM Sans", category: "sans-serif", isGoogleFont: true, weights: [400, 500, 700] },
  { family: "Space Grotesk", category: "sans-serif", isGoogleFont: true, weights: [400, 500, 600, 700] },
  { family: "Geist", category: "sans-serif", isGoogleFont: true, weights: [300, 400, 500, 600, 700] },

  // Serif
  { family: "Playfair Display", category: "serif", isGoogleFont: true, weights: [400, 500, 600, 700, 800] },
  { family: "Merriweather", category: "serif", isGoogleFont: true, weights: [300, 400, 700, 900] },
  { family: "Lora", category: "serif", isGoogleFont: true, weights: [400, 500, 600, 700] },
  { family: "Cinzel", category: "serif", isGoogleFont: true, weights: [400, 600, 700] },
  { family: "Cormorant Garamond", category: "serif", isGoogleFont: true, weights: [400, 500, 600, 700] },

  // Display / Creative
  { family: "Syne", category: "display", isGoogleFont: true, weights: [400, 600, 700, 800] },
  { family: "Bebas Neue", category: "display", isGoogleFont: true, weights: [400] },
  { family: "Cinzel Decorative", category: "display", isGoogleFont: true, weights: [400, 700] },

  // Monospace
  { family: "Fira Code", category: "monospace", isGoogleFont: true, weights: [300, 400, 500, 600, 700] },
  { family: "JetBrains Mono", category: "monospace", isGoogleFont: true, weights: [300, 400, 500, 700] },
  { family: "Space Mono", category: "monospace", isGoogleFont: true, weights: [400, 700] },

  // System Fallbacks
  { family: "system-ui, sans-serif", category: "sans-serif", isGoogleFont: false },
  { family: "serif", category: "serif", isGoogleFont: false },
  { family: "monospace", category: "monospace", isGoogleFont: false },
];

/**
 * Loads a Google font by family name if not already loaded.
 */
export function loadGoogleFont(fontFamily: string): void {
  if (typeof document === "undefined") return;

  // Extract clean font name (e.g. "'Plus Jakarta Sans', sans-serif" -> "Plus Jakarta Sans")
  const cleanName = fontFamily
    .split(",")[0]
    .replace(/['"]/g, "")
    .trim();

  if (!cleanName || loadedFonts.has(cleanName)) return;

  const fontDef = POPULAR_FONTS.find(
    (f) => f.family.toLowerCase() === cleanName.toLowerCase()
  );

  // If known Google font or not a generic CSS keyword
  const isGeneric = ["sans-serif", "serif", "monospace", "system-ui", "cursive", "fantasy"].includes(cleanName.toLowerCase());
  if (isGeneric) return;

  if (fontDef?.isGoogleFont || !isGeneric) {
    try {
      const linkId = `google-font-${cleanName.toLowerCase().replace(/\s+/g, "-")}`;
      if (document.getElementById(linkId)) {
        loadedFonts.add(cleanName);
        return;
      }

      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      const formattedFamily = cleanName.replace(/\s+/g, "+");
      link.href = `https://fonts.googleapis.com/css2?family=${formattedFamily}:ital,wght@0,300..900;1,300..900&display=swap`;
      document.head.appendChild(link);
      loadedFonts.add(cleanName);
    } catch {
      // Ignore network errors in offline environments
    }
  }
}
