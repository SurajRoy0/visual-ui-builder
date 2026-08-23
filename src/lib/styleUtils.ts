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

    // Layout
    if (style.display) css.display = style.display;
    if (style.position) css.position = style.position;
    if (style.top !== undefined) css.top = normalizeUnit(style.top, simulatedViewport);
    if (style.right !== undefined) css.right = normalizeUnit(style.right, simulatedViewport);
    if (style.bottom !== undefined) css.bottom = normalizeUnit(style.bottom, simulatedViewport);
    if (style.left !== undefined) css.left = normalizeUnit(style.left, simulatedViewport);
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

    // Spacing
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

    // Flexbox
    if (style.flexDirection) css.flexDirection = style.flexDirection;
    if (style.flexWrap) css.flexWrap = style.flexWrap;
    if (style.alignItems) css.alignItems = style.alignItems;
    if (style.justifyContent) css.justifyContent = style.justifyContent;
    if (style.alignContent) css.alignContent = style.alignContent;
    if (style.alignSelf) css.alignSelf = style.alignSelf;
    if (style.flexGrow !== undefined) css.flexGrow = style.flexGrow;
    if (style.flexShrink !== undefined) css.flexShrink = style.flexShrink;
    if (style.flexBasis !== undefined) css.flexBasis = normalizeUnit(style.flexBasis, simulatedViewport);
    if (style.gap !== undefined) css.gap = normalizeUnit(style.gap, simulatedViewport);
    if (style.rowGap !== undefined) css.rowGap = normalizeUnit(style.rowGap, simulatedViewport);
    if (style.columnGap !== undefined) css.columnGap = normalizeUnit(style.columnGap, simulatedViewport);
    if (style.order !== undefined) css.order = style.order;

    // Grid
    if (style.gridTemplateColumns) css.gridTemplateColumns = style.gridTemplateColumns;
    if (style.gridTemplateRows) css.gridTemplateRows = style.gridTemplateRows;
    if (style.gridAutoFlow) css.gridAutoFlow = style.gridAutoFlow;
    if (style.gridColumn) css.gridColumn = style.gridColumn;
    if (style.gridRow) css.gridRow = style.gridRow;

    // Appearance & Background
    if (style.background) css.background = style.background;
    if (style.backgroundColor) css.backgroundColor = style.backgroundColor;
    if (style.backgroundImage) css.backgroundImage = style.backgroundImage;
    if (style.backgroundSize) css.backgroundSize = style.backgroundSize;
    if (style.backgroundPosition) css.backgroundPosition = style.backgroundPosition;
    if (style.backgroundRepeat) css.backgroundRepeat = style.backgroundRepeat;

    // Border
    if (style.border) css.border = style.border;
    if (style.borderWidth !== undefined) css.borderWidth = normalizeUnit(style.borderWidth, simulatedViewport);
    if (style.borderStyle) css.borderStyle = style.borderStyle;
    if (style.borderColor) css.borderColor = style.borderColor;
    if (style.borderRadius !== undefined) css.borderRadius = normalizeUnit(style.borderRadius, simulatedViewport);
    if (style.borderTopLeftRadius !== undefined) css.borderTopLeftRadius = normalizeUnit(style.borderTopLeftRadius, simulatedViewport);
    if (style.borderTopRightRadius !== undefined) css.borderTopRightRadius = normalizeUnit(style.borderTopRightRadius, simulatedViewport);
    if (style.borderBottomRightRadius !== undefined) css.borderBottomRightRadius = normalizeUnit(style.borderBottomRightRadius, simulatedViewport);
    if (style.borderBottomLeftRadius !== undefined) css.borderBottomLeftRadius = normalizeUnit(style.borderBottomLeftRadius, simulatedViewport);
    if (style.boxShadow) css.boxShadow = style.boxShadow;
    if (style.opacity !== undefined) css.opacity = style.opacity;

    // Typography
    if (style.fontFamily) css.fontFamily = style.fontFamily;
    if (style.fontSize !== undefined) css.fontSize = normalizeUnit(style.fontSize, simulatedViewport);
    if (style.fontWeight !== undefined) css.fontWeight = style.fontWeight;
    if (style.fontStyle) css.fontStyle = style.fontStyle;
    if (style.lineHeight !== undefined) css.lineHeight = normalizeUnit(style.lineHeight, simulatedViewport);
    if (style.letterSpacing !== undefined) css.letterSpacing = normalizeUnit(style.letterSpacing, simulatedViewport);
    if (style.textAlign) css.textAlign = style.textAlign;
    if (style.color) css.color = style.color;
    if (style.textTransform) css.textTransform = style.textTransform;
    if (style.textDecoration) css.textDecoration = style.textDecoration;
    if (style.whiteSpace) css.whiteSpace = style.whiteSpace;
    if (style.wordBreak) css.wordBreak = style.wordBreak;

    // Transform
    const transformParts: string[] = [];
    if (style.translateX !== undefined) transformParts.push(`translateX(${normalizeUnit(style.translateX, simulatedViewport)})`);
    if (style.translateY !== undefined) transformParts.push(`translateY(${normalizeUnit(style.translateY, simulatedViewport)})`);
    if (style.scale !== undefined) transformParts.push(`scale(${style.scale})`);
    if (style.rotate !== undefined) transformParts.push(`rotate(${normalizeUnit(style.rotate, simulatedViewport)})`);
    if (style.rotateX !== undefined) transformParts.push(`rotateX(${normalizeUnit(style.rotateX, simulatedViewport)})`);
    if (style.rotateY !== undefined) transformParts.push(`rotateY(${normalizeUnit(style.rotateY, simulatedViewport)})`);

    if (style.transformRaw) {
        css.transform = style.transformRaw;
    } else if (transformParts.length > 0) {
        css.transform = transformParts.join(" ");
    }

    if (style.cursor) css.cursor = style.cursor;
    if (style.transitionProperty) css.transitionProperty = style.transitionProperty;
    if (style.transitionDuration !== undefined) css.transitionDuration = normalizeUnit(style.transitionDuration, simulatedViewport);

    // Custom properties
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
