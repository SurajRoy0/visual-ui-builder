// ============================================================
// lib/styleUtils.ts
//
// Helpers to merge base styles with breakpoint overrides and
// convert project ElementStyle objects into valid React.CSSProperties.
// ============================================================

import type { CSSValue, ElementStyle } from "@/types/project";
import React from "react";

/**
 * Normalizes CSS value by appending 'px' to numbers where appropriate.
 */
function normalizeUnit(value: CSSValue | undefined): string | undefined {
    if (value === undefined || value === null || value === "") return undefined;
    if (typeof value === "number") {
        return `${value}px`;
    }
    return String(value);
}

/**
 * Converts project ElementStyle to valid React.CSSProperties.
 */
export function styleToCss(style?: Partial<ElementStyle>): React.CSSProperties {
    if (!style) return {};

    const css: React.CSSProperties = {};

    // Layout
    if (style.display) css.display = style.display;
    if (style.position) css.position = style.position;
    if (style.top !== undefined) css.top = normalizeUnit(style.top);
    if (style.right !== undefined) css.right = normalizeUnit(style.right);
    if (style.bottom !== undefined) css.bottom = normalizeUnit(style.bottom);
    if (style.left !== undefined) css.left = normalizeUnit(style.left);
    if (style.zIndex !== undefined) css.zIndex = style.zIndex;
    if (style.width !== undefined) css.width = normalizeUnit(style.width);
    if (style.height !== undefined) css.height = normalizeUnit(style.height);
    if (style.minWidth !== undefined) css.minWidth = normalizeUnit(style.minWidth);
    if (style.minHeight !== undefined) css.minHeight = normalizeUnit(style.minHeight);
    if (style.maxWidth !== undefined) css.maxWidth = normalizeUnit(style.maxWidth);
    if (style.maxHeight !== undefined) css.maxHeight = normalizeUnit(style.maxHeight);
    if (style.overflow) css.overflow = style.overflow;
    if (style.overflowX) css.overflowX = style.overflowX;
    if (style.overflowY) css.overflowY = style.overflowY;
    if (style.boxSizing) css.boxSizing = style.boxSizing;

    // Spacing
    if (style.margin !== undefined) css.margin = normalizeUnit(style.margin);
    if (style.marginTop !== undefined) css.marginTop = normalizeUnit(style.marginTop);
    if (style.marginRight !== undefined) css.marginRight = normalizeUnit(style.marginRight);
    if (style.marginBottom !== undefined) css.marginBottom = normalizeUnit(style.marginBottom);
    if (style.marginLeft !== undefined) css.marginLeft = normalizeUnit(style.marginLeft);

    if (style.padding !== undefined) css.padding = normalizeUnit(style.padding);
    if (style.paddingTop !== undefined) css.paddingTop = normalizeUnit(style.paddingTop);
    if (style.paddingRight !== undefined) css.paddingRight = normalizeUnit(style.paddingRight);
    if (style.paddingBottom !== undefined) css.paddingBottom = normalizeUnit(style.paddingBottom);
    if (style.paddingLeft !== undefined) css.paddingLeft = normalizeUnit(style.paddingLeft);

    // Flexbox
    if (style.flexDirection) css.flexDirection = style.flexDirection;
    if (style.flexWrap) css.flexWrap = style.flexWrap;
    if (style.alignItems) css.alignItems = style.alignItems;
    if (style.justifyContent) css.justifyContent = style.justifyContent;
    if (style.alignContent) css.alignContent = style.alignContent;
    if (style.alignSelf) css.alignSelf = style.alignSelf;
    if (style.flexGrow !== undefined) css.flexGrow = style.flexGrow;
    if (style.flexShrink !== undefined) css.flexShrink = style.flexShrink;
    if (style.flexBasis !== undefined) css.flexBasis = normalizeUnit(style.flexBasis);
    if (style.gap !== undefined) css.gap = normalizeUnit(style.gap);
    if (style.rowGap !== undefined) css.rowGap = normalizeUnit(style.rowGap);
    if (style.columnGap !== undefined) css.columnGap = normalizeUnit(style.columnGap);
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
    if (style.borderWidth !== undefined) css.borderWidth = normalizeUnit(style.borderWidth);
    if (style.borderStyle) css.borderStyle = style.borderStyle;
    if (style.borderColor) css.borderColor = style.borderColor;
    if (style.borderRadius !== undefined) css.borderRadius = normalizeUnit(style.borderRadius);
    if (style.borderTopLeftRadius !== undefined) css.borderTopLeftRadius = normalizeUnit(style.borderTopLeftRadius);
    if (style.borderTopRightRadius !== undefined) css.borderTopRightRadius = normalizeUnit(style.borderTopRightRadius);
    if (style.borderBottomRightRadius !== undefined) css.borderBottomRightRadius = normalizeUnit(style.borderBottomRightRadius);
    if (style.borderBottomLeftRadius !== undefined) css.borderBottomLeftRadius = normalizeUnit(style.borderBottomLeftRadius);
    if (style.boxShadow) css.boxShadow = style.boxShadow;
    if (style.opacity !== undefined) css.opacity = style.opacity;

    // Typography
    if (style.fontFamily) css.fontFamily = style.fontFamily;
    if (style.fontSize !== undefined) css.fontSize = normalizeUnit(style.fontSize);
    if (style.fontWeight !== undefined) css.fontWeight = style.fontWeight;
    if (style.fontStyle) css.fontStyle = style.fontStyle;
    if (style.lineHeight !== undefined) css.lineHeight = normalizeUnit(style.lineHeight);
    if (style.letterSpacing !== undefined) css.letterSpacing = normalizeUnit(style.letterSpacing);
    if (style.textAlign) css.textAlign = style.textAlign;
    if (style.color) css.color = style.color;
    if (style.textTransform) css.textTransform = style.textTransform;
    if (style.textDecoration) css.textDecoration = style.textDecoration;
    if (style.whiteSpace) css.whiteSpace = style.whiteSpace;
    if (style.wordBreak) css.wordBreak = style.wordBreak;

    // Transform
    const transformParts: string[] = [];
    if (style.translateX !== undefined) transformParts.push(`translateX(${normalizeUnit(style.translateX)})`);
    if (style.translateY !== undefined) transformParts.push(`translateY(${normalizeUnit(style.translateY)})`);
    if (style.scale !== undefined) transformParts.push(`scale(${style.scale})`);
    if (style.rotate !== undefined) transformParts.push(`rotate(${normalizeUnit(style.rotate)})`);
    if (style.rotateX !== undefined) transformParts.push(`rotateX(${normalizeUnit(style.rotateX)})`);
    if (style.rotateY !== undefined) transformParts.push(`rotateY(${normalizeUnit(style.rotateY)})`);

    if (style.transformRaw) {
        css.transform = style.transformRaw;
    } else if (transformParts.length > 0) {
        css.transform = transformParts.join(" ");
    }

    if (style.cursor) css.cursor = style.cursor;
    if (style.transitionProperty) css.transitionProperty = style.transitionProperty;
    if (style.transitionDuration !== undefined) css.transitionDuration = normalizeUnit(style.transitionDuration);

    return css;
}

/**
 * Resolves effective styles by cascading base styles with active breakpoint styles.
 */
export function resolveEffectiveStyles(
    baseStyle?: Partial<ElementStyle>,
    breakpointStyle?: Partial<ElementStyle>
): React.CSSProperties {
    const merged: Partial<ElementStyle> = {
        ...(baseStyle || {}),
        ...(breakpointStyle || {}),
    };
    return styleToCss(merged);
}
