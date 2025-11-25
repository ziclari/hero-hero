import React from "react";
import Element from "../Element";
import MotionWrapper from "../MotionWrapper";
import { computeLayout } from "../../render/computeLayout";
import { isVisible } from "../../render/isVisible";
import { resolveElement } from "../../render/resolveElement";
export default function GroupElement({
  elements,
  assets,
  className,
  onAction,
  activeElements,
  setActiveElements,
}) {
  const classes = [
    "group",          // Clase base estándar para grupos
    "group-bg",       // Clase para fondos (bg-cover, etc.)
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      onClick={(e) => e.stopPropagation()}
    >
      {elements.map((el, i) => {
        if (!isVisible(el, activeElements)) return null;

        const resolved = resolveElement(el, assets);
        const layout = computeLayout(resolved);

        return (
          <MotionWrapper
            key={resolved.id || i}
            animate={el.animate}
            delay={el.delay ?? el.animate?.delay}
            style={layout}
          >
            <Element
              {...resolved}
              assets={assets}
              activeElements={activeElements}
              setActiveElements={setActiveElements}
              onAction={(action) => onAction?.(action, resolved.id)}
            />
          </MotionWrapper>
        );
      })}
    </div>
  );
}
