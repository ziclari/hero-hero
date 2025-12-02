import React from "react";
import Element from "../Element";
import MotionWrapper from "../MotionWrapper";
import { computeLayout } from "../../render/computeLayout";
import { isVisible } from "../../render/isVisible";
import { resolveElement } from "../../render/resolveElement";
import { interpolate } from "../../render/interpolate";
import { stateManager } from "../../managers/stateManager";
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
        const state = stateManager.get();
        const custom = stateManager.getCustom();

        const context = { ...state, custom }; // ahora `custom` es accesible en las interpolaciones

        const interpolated = {};
        for (const [key, value] of Object.entries(resolved)) {
          interpolated[key] =
            typeof value === "string"
              ? interpolate(value, context)
              : value;
        }

        const layout = computeLayout(interpolated);

        return (
          <MotionWrapper
            key={resolved.id || i}
            animate={el.animate}
            delay={el.delay ?? el.animate?.delay}
            style={layout}
          >
            <Element
              {...interpolated}
              assets={assets}
              activeElements={activeElements}
              setActiveElements={setActiveElements}
              onAction={onAction}
              action={resolved.action}
            />
          </MotionWrapper>
        );
      })}
    </div>
  );
}
