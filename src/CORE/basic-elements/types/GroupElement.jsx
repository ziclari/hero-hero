import React from "react";
import Element from "../Element";
import MotionWrapper from "../MotionWrapper";

export default function GroupElement({
  elements,
  assets,
  background,
  action,
  onAction,
  className
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
      style={{
        backgroundImage: background ? `url(${background})` : ""
      }}
      onClick={() => onAction?.(action)}
    >
      {elements.map((child, i) => {
        const isVisible =
          activeElements?.[child.id] !== false &&
          (activeElements?.[child.id] ||
            child.visible === undefined ||
            child.visible === true);

        if (!isVisible) return null;

        return (
          <MotionWrapper
            key={`group-${i}`}
            animate={child.animate}
            delay={child.delay}
          >
            <Element
              key={child.id || i}
              {...child}
              assets={assets}
              // resolución automática de paths
              src={assets?.[child.src] || child.src}
              img={assets?.[child.img] || child.img}
              icon={assets?.[child.icon] || child.icon}
              button={
                child.button
                  ? {
                      ...child.button,
                      icon: assets?.[child.button.icon] || child.button.icon,
                    }
                  : undefined
              }
              background={assets?.[child.background] || child.background}
              onAction={onAction}
            />
          </MotionWrapper>
        );
      })}
    </div>
  );
}
