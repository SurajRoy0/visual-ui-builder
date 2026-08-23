// ============================================================
// lib/elementRules.ts
//
// Centralized HTML Parent/Child compatibility and element
// validation rules for the visual editor.
//
// NOTE: This is editor-only validation logic and does NOT
// modify or pollute the persisted Project/ElementNode schema.
// ============================================================

import type { HTMLTagName, TreeNode } from "@/types/project";
import {
  ALL_ELEMENT_DEFINITIONS,
  type ElementDefinitionItem,
} from "./elementDefinitions";

/**
 * Fast O(1) lookup map of element definitions by tag name.
 */
export const ELEMENT_DEFINITIONS_BY_TAG: Partial<
  Record<HTMLTagName, ElementDefinitionItem>
> = ALL_ELEMENT_DEFINITIONS.reduce(
  (acc, def) => {
    acc[def.tag] = def;
    return acc;
  },
  {} as Partial<Record<HTMLTagName, ElementDefinitionItem>>
);

/**
 * Fast lookup by definition ID.
 */
export const ELEMENT_DEFINITIONS_BY_ID: Record<string, ElementDefinitionItem> =
  ALL_ELEMENT_DEFINITIONS.reduce((acc, def) => {
    acc[def.id] = def;
    return acc;
  }, {} as Record<string, ElementDefinitionItem>);

/**
 * Returns the definition for a given tag or definition ID.
 */
export function getElementDefinition(
  tagOrId: HTMLTagName | string
): ElementDefinitionItem | undefined {
  return (
    ELEMENT_DEFINITIONS_BY_TAG[tagOrId as HTMLTagName] ||
    ELEMENT_DEFINITIONS_BY_ID[tagOrId]
  );
}

/**
 * HTML void elements that cannot contain any child nodes.
 */
export const VOID_TAGS: ReadonlySet<HTMLTagName> = new Set<HTMLTagName>([
  "img",
  "input",
  "hr",
  "br",
  "source",
]);

/**
 * Checks whether a tag is a void (leaf) element that cannot have children.
 */
export function isVoidElement(tag: HTMLTagName): boolean {
  return VOID_TAGS.has(tag);
}

/**
 * Checks whether a node or tag can accept children in general.
 */
export function canAcceptChildren(
  parent: TreeNode | HTMLTagName | null | undefined
): boolean {
  if (!parent) return false;
  const parentTag = typeof parent === "string" ? parent : parent.type === "element" ? parent.tag : null;
  if (!parentTag) return false;

  const def = getElementDefinition(parentTag);
  if (def?.isVoid || isVoidElement(parentTag)) {
    return false;
  }

  return true;
}

export interface DropValidationResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Centralized rule utility to determine whether an element can be dropped/inserted
 * into a given parent.
 *
 * @param child - The ElementDefinitionItem or HTMLTagName of the child to be inserted.
 * @param parent - The parent TreeNode or HTMLTagName (null = root/canvas context).
 */
export function canDropElementIntoParent(
  child: ElementDefinitionItem | HTMLTagName,
  parent: TreeNode | HTMLTagName | null | undefined
): DropValidationResult {
  const childTag: HTMLTagName =
    typeof child === "string" ? child : child.tag;
  const childDef =
    typeof child === "string" ? getElementDefinition(child) : child;

  // 1. Parent is null/undefined: Root or document level insertion
  if (!parent) {
    if (childDef?.allowedParentTags && childDef.allowedParentTags.length > 0) {
      return {
        allowed: false,
        reason: `<${childTag}> must be placed inside <${childDef.allowedParentTags.join(
          "> or <"
        )}>`,
      };
    }
    return { allowed: true };
  }

  // 2. Resolve parent tag
  const parentTag: HTMLTagName | null =
    typeof parent === "string"
      ? parent
      : parent.type === "element"
        ? parent.tag
        : null;

  if (!parentTag) {
    return {
      allowed: false,
      reason: "Invalid parent node.",
    };
  }

  const parentDef = getElementDefinition(parentTag);

  // 3. Parent is a void element
  if (isVoidElement(parentTag) || parentDef?.isVoid) {
    return {
      allowed: false,
      reason: `<${parentTag}> is a void element and cannot contain children.`,
    };
  }

  // 4. Child requires specific parent tags (e.g. li -> ul/ol, option -> select, tr -> thead/tbody/table, etc.)
  if (childDef?.allowedParentTags && childDef.allowedParentTags.length > 0) {
    if (!childDef.allowedParentTags.includes(parentTag)) {
      return {
        allowed: false,
        reason: `<${childTag}> is only valid inside <${childDef.allowedParentTags.join(
          ">, <"
        )}> (attempted in <${parentTag}>).`,
      };
    }
  }

  // 5. Parent specifies strict allowed child tags (e.g. ul -> only li, select -> only option/optgroup, tr -> only th/td)
  if (parentDef?.allowedChildTags && parentDef.allowedChildTags.length > 0) {
    if (!parentDef.allowedChildTags.includes(childTag)) {
      return {
        allowed: false,
        reason: `<${parentTag}> only accepts <${parentDef.allowedChildTags.join(
          ">, <"
        )}> children.`,
      };
    }
  }

  // 6. Parent specifies disallowed child tags
  if (parentDef?.disallowedChildTags && parentDef.disallowedChildTags.length > 0) {
    if (parentDef.disallowedChildTags.includes(childTag)) {
      return {
        allowed: false,
        reason: `<${childTag}> cannot be placed directly inside <${parentTag}>.`,
      };
    }
  }

  // 7. General HTML semantics checks
  // - Cannot place a <form> inside another <form>
  if (childTag === "form" && parentTag === "form") {
    return {
      allowed: false,
      reason: "Nested <form> elements are not valid in HTML.",
    };
  }

  // - Cannot place interactive elements inside <button> or <a>
  if ((parentTag === "button" || parentTag === "a") && (childTag === "button" || childTag === "a")) {
    return {
      allowed: false,
      reason: `Nested <${childTag}> inside <${parentTag}> is invalid.`,
    };
  }

  return { allowed: true };
}
