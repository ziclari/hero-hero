import React from "react";
import Element from "../Element";
import MotionWrapper from "../MotionWrapper";

export default function GroupElement({
  elements,
  assets,
  background,
  action,
  onAction,
  className,
  skin // ← añadido para usar JSON skins
}) {
  const s = skin || {};

  const finalClass = `${className || ""} ${s.className || ""}`.trim();

  return (
    <div
      className={`${finalClass} bg-cover bg-center`}
      style={{
        backgroundImage: background ? `url(${background})` : "",
        ...(s.style || {}) // json plano
      }}
      onClick={() => onAction?.(action)}
      {...(s.wrapperProps || {})}
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
              skin={child.skinObject} 
              assets={assets}
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
