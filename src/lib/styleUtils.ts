// ============================================================
// lib/styleUtils.ts
//
// Helpers to merge base styles with breakpoint overrides and
// convert project ElementStyle objects into valid React.CSSProperties.
// Resolves simulated viewport units (vh, vw, vmin, vmax) against
// simulated canvas viewport dimensions instead of the outer browser window.
// ============================================================

import type { CSSValue, ElementStyle } from "@/types/project";
import React from "react";

export interface SimulatedViewport {
    width: number;
    height: number;
}

/**
 * Normalizes CSS value by appending 'px' to bare numbers,
 * and resolving simulated viewport units (vh, vw, vmin, vmax) against
 * the simulated website viewport dimensions instead of the physical browser window.
 */
function normalizeUnit(
    value: CSSValue | undefined,
    simulatedViewport?: SimulatedViewport
): string | undefined {
    if (value === undefined || value === null || value === "") return undefined;
    if (typeof value === "number") {
        return `${value}px`;
    }
    const str = String(value).trim();

    if (simulatedViewport) {
        const { width, height } = simulatedViewport;
        const vmin = Math.min(width, height);
        const vmax = Math.max(width, height);

        // Replace vh, vw, vmin, vmax with exact calculated px values
        // Handles expressions like "95vh", "100vw", "calc(100vh - 20px)", "50vmin", etc.
        const resolved = str.replace(
            /(-?\d+(?:\.\d+)?)\s*(vh|vw|vmin|vmax)/gi,
            (_, numStr, unit) => {
                const num = parseFloat(numStr);
                if (isNaN(num)) return _;
                const lowerUnit = unit.toLowerCase();
                let px = 0;
                if (lowerUnit === "vh") {
                    px = (num * height) / 100;
                } else if (lowerUnit === "vw") {
                    px = (num * width) / 100;
                } else if (lowerUnit === "vmin") {
                    px = (num * vmin) / 100;
                } else if (lowerUnit === "vmax") {
                    px = (num * vmax) / 100;
                }
                return `${Math.round(px * 100) / 100}px`;
            }
        );
        return resolved;
    }

    return str;
}

/**
 * Converts project ElementStyle to valid React.CSSProperties.
 */
export function styleToCss(
    style?: Partial<ElementStyle>,
    simulatedViewport?: SimulatedViewport
): React.CSSProperties {
    if (!style) return {};

    const css: React.CSSProperties = {};

    // 1. Layout & Sizing
    if (style.display) css.display = style.display;
    if (style.position) css.position = style.position;
    if (style.top !== undefined) css.top = normalizeUnit(style.top, simulatedViewport);
    if (style.right !== undefined) css.right = normalizeUnit(style.right, simulatedViewport);
    if (style.bottom !== undefined) css.bottom = normalizeUnit(style.bottom, simulatedViewport);
    if (style.left !== undefined) css.left = normalizeUnit(style.left, simulatedViewport);
    if (style.inset !== undefined) (css as Record<string, unknown>).inset = normalizeUnit(style.inset, simulatedViewport);
    if (style.zIndex !== undefined) css.zIndex = style.zIndex;
    if (style.width !== undefined) css.width = normalizeUnit(style.width, simulatedViewport);
    if (style.height !== undefined) css.height = normalizeUnit(style.height, simulatedViewport);
    if (style.minWidth !== undefined) css.minWidth = normalizeUnit(style.minWidth, simulatedViewport);
    if (style.minHeight !== undefined) css.minHeight = normalizeUnit(style.minHeight, simulatedViewport);
    if (style.maxWidth !== undefined) css.maxWidth = normalizeUnit(style.maxWidth, simulatedViewport);
    if (style.maxHeight !== undefined) css.maxHeight = normalizeUnit(style.maxHeight, simulatedViewport);
    if (style.overflow) css.overflow = style.overflow;
    if (style.overflowX) css.overflowX = style.overflowX;
    if (style.overflowY) css.overflowY = style.overflowY;
    if (style.boxSizing) css.boxSizing = style.boxSizing;
    if (style.aspectRatio !== undefined) (css as Record<string, unknown>).aspectRatio = String(style.aspectRatio);
    if (style.visibility) css.visibility = style.visibility;
    if (style.cursor) css.cursor = style.cursor;
    if (style.pointerEvents) css.pointerEvents = style.pointerEvents;
    if (style.isolation) css.isolation = style.isolation;

    // 2. Spacing
    if (style.margin !== undefined) css.margin = normalizeUnit(style.margin, simulatedViewport);
    if (style.marginTop !== undefined) css.marginTop = normalizeUnit(style.marginTop, simulatedViewport);
    if (style.marginRight !== undefined) css.marginRight = normalizeUnit(style.marginRight, simulatedViewport);
    if (style.marginBottom !== undefined) css.marginBottom = normalizeUnit(style.marginBottom, simulatedViewport);
    if (style.marginLeft !== undefined) css.marginLeft = normalizeUnit(style.marginLeft, simulatedViewport);

    if (style.padding !== undefined) css.padding = normalizeUnit(style.padding, simulatedViewport);
    if (style.paddingTop !== undefined) css.paddingTop = normalizeUnit(style.paddingTop, simulatedViewport);
    if (style.paddingRight !== undefined) css.paddingRight = normalizeUnit(style.paddingRight, simulatedViewport);
    if (style.paddingBottom !== undefined) css.paddingBottom = normalizeUnit(style.paddingBottom, simulatedViewport);
    if (style.paddingLeft !== undefined) css.paddingLeft = normalizeUnit(style.paddingLeft, simulatedViewport);

    // 3. Flexbox
    if (style.flex !== undefined) css.flex = normalizeUnit(style.flex, simulatedViewport);
    if (style.flexDirection) css.flexDirection = style.flexDirection;
    if (style.flexWrap) css.flexWrap = style.flexWrap;
    if (style.alignItems) css.alignItems = style.alignItems;
    if (style.justifyContent) css.justifyContent = style.justifyContent;
    if (style.alignContent) css.alignContent = style.alignContent;
    if (style.alignSelf) css.alignSelf = style.alignSelf;
    if (style.justifyItems) (css as Record<string, unknown>).justifyItems = style.justifyItems;
    if (style.justifySelf) (css as Record<string, unknown>).justifySelf = style.justifySelf;
    if (style.flexGrow !== undefined) css.flexGrow = style.flexGrow;
    if (style.flexShrink !== undefined) css.flexShrink = style.flexShrink;
    if (style.flexBasis !== undefined) css.flexBasis = normalizeUnit(style.flexBasis, simulatedViewport);
    if (style.gap !== undefined) css.gap = normalizeUnit(style.gap, simulatedViewport);
    if (style.rowGap !== undefined) css.rowGap = normalizeUnit(style.rowGap, simulatedViewport);
    if (style.columnGap !== undefined) css.columnGap = normalizeUnit(style.columnGap, simulatedViewport);
    if (style.order !== undefined) css.order = style.order;

    // 4. Grid
    if (style.gridTemplateColumns) css.gridTemplateColumns = style.gridTemplateColumns;
    if (style.gridTemplateRows) css.gridTemplateRows = style.gridTemplateRows;
    if (style.gridTemplateAreas) css.gridTemplateAreas = style.gridTemplateAreas;
    if (style.gridAutoFlow) css.gridAutoFlow = style.gridAutoFlow;
    if (style.gridAutoRows) css.gridAutoRows = style.gridAutoRows;
    if (style.gridAutoColumns) css.gridAutoColumns = style.gridAutoColumns;
    if (style.gridColumn) css.gridColumn = style.gridColumn;
    if (style.gridRow) css.gridRow = style.gridRow;
    if (style.gridArea) css.gridArea = style.gridArea;
    if (style.placeItems) (css as Record<string, unknown>).placeItems = style.placeItems;
    if (style.placeContent) (css as Record<string, unknown>).placeContent = style.placeContent;

    // 5. Appearance & Background
    if (style.background) css.background = style.background;
    if (style.backgroundColor) css.backgroundColor = style.backgroundColor;
    if (style.backgroundImage) css.backgroundImage = style.backgroundImage;
    if (style.backgroundSize) css.backgroundSize = style.backgroundSize;
    if (style.backgroundPosition) css.backgroundPosition = style.backgroundPosition;
    if (style.backgroundRepeat) css.backgroundRepeat = style.backgroundRepeat;
    if (style.backgroundAttachment) css.backgroundAttachment = style.backgroundAttachment;
    if (style.backgroundBlendMode) (css as Record<string, unknown>).backgroundBlendMode = style.backgroundBlendMode;

    // 6. Borders & Outline
    if (style.border) css.border = style.border;
    if (style.borderWidth !== undefined) css.borderWidth = normalizeUnit(style.borderWidth, simulatedViewport);
    if (style.borderStyle) css.borderStyle = style.borderStyle;
    if (style.borderColor) css.borderColor = style.borderColor;
    if (style.borderTop) css.borderTop = style.borderTop;
    if (style.borderRight) css.borderRight = style.borderRight;
    if (style.borderBottom) css.borderBottom = style.borderBottom;
    if (style.borderLeft) css.borderLeft = style.borderLeft;
    if (style.borderRadius !== undefined) css.borderRadius = normalizeUnit(style.borderRadius, simulatedViewport);
    if (style.borderTopLeftRadius !== undefined) css.borderTopLeftRadius = normalizeUnit(style.borderTopLeftRadius, simulatedViewport);
    if (style.borderTopRightRadius !== undefined) css.borderTopRightRadius = normalizeUnit(style.borderTopRightRadius, simulatedViewport);
    if (style.borderBottomRightRadius !== undefined) css.borderBottomRightRadius = normalizeUnit(style.borderBottomRightRadius, simulatedViewport);
    if (style.borderBottomLeftRadius !== undefined) css.borderBottomLeftRadius = normalizeUnit(style.borderBottomLeftRadius, simulatedViewport);
    if (style.boxShadow) css.boxShadow = style.boxShadow;
    if (style.opacity !== undefined) css.opacity = style.opacity;
    if (style.outline) css.outline = style.outline;
    if (style.outlineOffset !== undefined) css.outlineOffset = normalizeUnit(style.outlineOffset, simulatedViewport);
    if (style.objectFit) css.objectFit = style.objectFit;
    if (style.objectPosition) css.objectPosition = style.objectPosition;
    if (style.accentColor) css.accentColor = style.accentColor;
    if (style.caretColor) css.caretColor = style.caretColor;

    // 7. Effects & Filters
    if (style.filter) css.filter = style.filter;
    if (style.backdropFilter) (css as Record<string, unknown>).backdropFilter = style.backdropFilter;
    if (style.mixBlendMode) (css as Record<string, unknown>).mixBlendMode = style.mixBlendMode;
    if (style.clipPath) css.clipPath = style.clipPath;
    if (style.maskImage) (css as Record<string, unknown>).maskImage = style.maskImage;

    // 8. Typography
    if (style.fontFamily) css.fontFamily = style.fontFamily;
    if (style.fontSize !== undefined) css.fontSize = normalizeUnit(style.fontSize, simulatedViewport);
    if (style.fontWeight !== undefined) css.fontWeight = style.fontWeight;
    if (style.fontStyle) css.fontStyle = style.fontStyle;
    if (style.lineHeight !== undefined) css.lineHeight = normalizeUnit(style.lineHeight, simulatedViewport);
    if (style.letterSpacing !== undefined) css.letterSpacing = normalizeUnit(style.letterSpacing, simulatedViewport);
    if (style.wordSpacing !== undefined) css.wordSpacing = normalizeUnit(style.wordSpacing, simulatedViewport);
    if (style.textAlign) css.textAlign = style.textAlign;
    if (style.color) css.color = style.color;
    if (style.textTransform) css.textTransform = style.textTransform;
    if (style.textDecoration) css.textDecoration = style.textDecoration;
    if (style.textDecorationColor) css.textDecorationColor = style.textDecorationColor;
    if (style.textDecorationStyle) css.textDecorationStyle = style.textDecorationStyle;
    if (style.whiteSpace) css.whiteSpace = style.whiteSpace;
    if (style.wordBreak) css.wordBreak = style.wordBreak;
    if (style.textOverflow) css.textOverflow = style.textOverflow;
    if (style.textShadow) css.textShadow = style.textShadow;
    if (style.textIndent !== undefined) css.textIndent = normalizeUnit(style.textIndent, simulatedViewport);
    if (style.verticalAlign) css.verticalAlign = style.verticalAlign;
    if (style.writingMode) (css as Record<string, unknown>).writingMode = style.writingMode;

    // 9. Transform
    const transformParts: string[] = [];
    if (style.translateX !== undefined) transformParts.push(`translateX(${normalizeUnit(style.translateX, simulatedViewport)})`);
    if (style.translateY !== undefined) transformParts.push(`translateY(${normalizeUnit(style.translateY, simulatedViewport)})`);
    if (style.translateZ !== undefined) transformParts.push(`translateZ(${normalizeUnit(style.translateZ, simulatedViewport)})`);
    if (style.scale !== undefined) transformParts.push(`scale(${style.scale})`);
    if (style.scaleX !== undefined) transformParts.push(`scaleX(${style.scaleX})`);
    if (style.scaleY !== undefined) transformParts.push(`scaleY(${style.scaleY})`);
    if (style.rotate !== undefined) transformParts.push(`rotate(${normalizeUnit(style.rotate, simulatedViewport)})`);
    if (style.rotateX !== undefined) transformParts.push(`rotateX(${normalizeUnit(style.rotateX, simulatedViewport)})`);
    if (style.rotateY !== undefined) transformParts.push(`rotateY(${normalizeUnit(style.rotateY, simulatedViewport)})`);
    if (style.rotateZ !== undefined) transformParts.push(`rotateZ(${normalizeUnit(style.rotateZ, simulatedViewport)})`);
    if (style.skewX !== undefined) transformParts.push(`skewX(${normalizeUnit(style.skewX, simulatedViewport)})`);
    if (style.skewY !== undefined) transformParts.push(`skewY(${normalizeUnit(style.skewY, simulatedViewport)})`);

    if (style.transformRaw) {
        css.transform = style.transformRaw;
    } else if (transformParts.length > 0) {
        css.transform = transformParts.join(" ");
    }
    if (style.transformOrigin) css.transformOrigin = style.transformOrigin;
    if (style.perspective !== undefined) css.perspective = normalizeUnit(style.perspective, simulatedViewport);
    if (style.backfaceVisibility) css.backfaceVisibility = style.backfaceVisibility;

    // 10. Transitions
    if (style.transitionProperty) css.transitionProperty = style.transitionProperty;
    if (style.transitionDuration !== undefined) css.transitionDuration = normalizeUnit(style.transitionDuration, simulatedViewport);
    if (style.transitionTimingFunction) css.transitionTimingFunction = style.transitionTimingFunction;
    if (style.transitionDelay !== undefined) css.transitionDelay = normalizeUnit(style.transitionDelay, simulatedViewport);

    // 11. Custom properties
    for (const [key, val] of Object.entries(style)) {
        if (key.startsWith("--") && val !== undefined) {
            (css as Record<string, unknown>)[key] = normalizeUnit(val, simulatedViewport);
        }
    }

    return css;
}

/**
 * Resolves effective styles by cascading base styles with active breakpoint styles,
 * and normalizing viewport units against the simulated canvas viewport.
 */
export function resolveEffectiveStyles(
    baseStyle?: Partial<ElementStyle>,
    breakpointStyle?: Partial<ElementStyle>,
    simulatedViewport?: SimulatedViewport
): React.CSSProperties {
    const merged: Partial<ElementStyle> = {
        ...(baseStyle || {}),
        ...(breakpointStyle || {}),
    };
    return styleToCss(merged, simulatedViewport);
}

/**
 * Generates CSS variables dictionary for all project design tokens.
 */
export function generateTokenCssVars(projectStyles?: import("@/types/project").ProjectStyles): Record<string, string> {
    const vars: Record<string, string> = {};
    if (!projectStyles) return vars;

    // Colors: --color-[name]
    if (projectStyles.colors) {
        for (const [k, v] of Object.entries(projectStyles.colors)) {
            vars[`--color-${k}`] = v;
        }
    }

    // Spacing: --spacing-[name]
    if (projectStyles.spacing) {
        for (const [k, v] of Object.entries(projectStyles.spacing)) {
            vars[`--spacing-${k}`] = typeof v === "number" ? `${v}px` : String(v);
        }
    }

    // Radii: --radius-[name]
    if (projectStyles.radii) {
        for (const [k, v] of Object.entries(projectStyles.radii)) {
            vars[`--radius-${k}`] = typeof v === "number" ? `${v}px` : String(v);
        }
    }

    // Shadows: --shadow-[name]
    if (projectStyles.shadows) {
        for (const [k, v] of Object.entries(projectStyles.shadows)) {
            vars[`--shadow-${k}`] = v;
        }
    }

    // Fonts: --font-[name]
    if (projectStyles.fonts) {
        for (const [k, v] of Object.entries(projectStyles.fonts)) {
            vars[`--font-${k}`] = v.fallback ? `${v.family}, ${v.fallback}` : v.family;
        }
    }

    // Typography presets: one CSS var per field, so a node that applies
    // a preset (var(--typography-[name]-font-size), etc.) keeps tracking
    // it live instead of baking in a snapshot at apply-time.
    if (projectStyles.typography) {
        for (const [k, tok] of Object.entries(projectStyles.typography)) {
            if (tok.fontFamily !== undefined) {
                vars[`--typography-${k}-font-family`] = tok.fontFamily;
            }
            if (tok.fontSize !== undefined) {
                vars[`--typography-${k}-font-size`] = typeof tok.fontSize === "number" ? `${tok.fontSize}px` : String(tok.fontSize);
            }
            if (tok.fontWeight !== undefined) {
                vars[`--typography-${k}-font-weight`] = String(tok.fontWeight);
            }
            if (tok.lineHeight !== undefined) {
                // Unitless by CSS convention (a multiplier), unlike spacing/radii.
                vars[`--typography-${k}-line-height`] = String(tok.lineHeight);
            }
            if (tok.letterSpacing !== undefined) {
                vars[`--typography-${k}-letter-spacing`] = typeof tok.letterSpacing === "number" ? `${tok.letterSpacing}px` : String(tok.letterSpacing);
            }
        }
    }

    // Variables: --[name]
    if (projectStyles.variables) {
        for (const [k, v] of Object.entries(projectStyles.variables)) {
            const name = k.startsWith("--") ? k : `--${k}`;
            vars[name] = typeof v === "number" ? `${v}px` : String(v);
        }
    }

    return vars;
}

/**
 * Resolves color string (including var(--color-xxx)) into actual displayable hex and token key.
 */
export function resolveColorValue(
    value: string | undefined,
    colorTokens: Record<string, string> = {},
    fallbackHex = "#3b82f6"
): { displayHex: string; tokenName: string | null; rawValue: string } {
    const rawValue = String(value || "");
    const tokenMatch = rawValue.match(/var\(--color-([^)]+)\)/);
    const tokenName = tokenMatch ? tokenMatch[1] : null;

    let displayHex = rawValue;
    if (tokenName && colorTokens[tokenName]) {
        displayHex = colorTokens[tokenName];
    } else if (displayHex.startsWith("#")) {
        displayHex = displayHex;
    } else {
        displayHex = fallbackHex;
    }

    return { displayHex, tokenName, rawValue };
}
