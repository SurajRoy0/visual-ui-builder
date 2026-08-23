"use client";

import React from "react";

interface CanvasElementProps {
  id?: string;
  type: "box" | "text";
  tag?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  content?: string;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export const CanvasElement: React.FC<CanvasElementProps> = ({
  id,
  type,
  tag = "div",
  className = "",
  style,
  children,
  content,
  isSelected = false,
  onClick,
}) => {
  if (type === "text") {
    const Tag = (["p", "h1", "h2", "h3", "h4", "h5", "h6", "span", "div", "button", "a"].includes(tag)
      ? tag
      : "p") as keyof React.JSX.IntrinsicElements;

    return React.createElement(
      Tag,
      {
        id,
        style,
        onClick: (e: React.MouseEvent) => {
          if (onClick) {
            e.stopPropagation();
            onClick(e);
          }
        },
        className: `transition-all select-none cursor-pointer ${
          isSelected ? "outline-2 outline-blue rounded-xs" : "hover:outline-1 hover:outline-blue/40"
        } ${className}`,
      },
      content || children
    );
  }

  return (
    <div
      id={id}
      style={style}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick(e);
        }
      }}
      className={`transition-all select-none cursor-pointer ${
        isSelected ? "ring-2 ring-blue ring-offset-2 ring-offset-background" : "hover:ring-1 hover:ring-blue/30"
      } ${className}`}
    >
      {children}
    </div>
  );
};
