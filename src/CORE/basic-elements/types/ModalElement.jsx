// src/components/types/ModalElement.js
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Element from "../Element";

export default function ModalElement({
  id,
  elements = [],
  assets,
  className,
  background,
  skin,
  onAction,
}) {
  const resolvedSkin = skin || {};
  const Root = resolvedSkin.Root || "div";
  const Container = resolvedSkin.Container || "div";
  const CloseButton = resolvedSkin.CloseButton || "button";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        className={resolvedSkin.overlayClassName || "fixed inset-0 bg-black/70 flex items-center justify-center z-50"}
        initial={resolvedSkin.initial || { opacity: 0 }}
        animate={resolvedSkin.animate || { opacity: 1 }}
        exit={resolvedSkin.exit || { opacity: 0 }}
      >
        <Root className={className || ""}>
          <Container
            className={resolvedSkin.containerClassName}
            style={{
              backgroundImage: background ? `url(${background})` : "",
              backgroundSize: "cover",
              backgroundPosition: "center",
              ...resolvedSkin.containerStyle,
            }}
          >
            <CloseButton
              className={resolvedSkin.closeButtonClassName}
              onClick={() => onAction(`hide:${id}`)}
            >
              {resolvedSkin.closeIcon || "✕"}
            </CloseButton>

            {elements.map((child, index) => {
              const isVisible =
                activeElements?.[child.id] !== false &&
                (activeElements?.[child.id] ||
                  child.visible === undefined ||
                  child.visible === true);

              if (!isVisible) return null;

              return (
                <Element
                  key={child.id || index}
                  {...child}
                  assets={assets}
                  src={assets?.[child.src] || child.src}
                  img={assets?.[child.img] || child.img}
                  icon={assets?.[child.icon] || child.icon}
                  button={
                    child.button
                      ? {
                          ...child.button,
                          icon:
                            assets?.[child.button.icon] ||
                            child.button.icon,
                        }
                      : undefined
                  }
                  background={assets?.[child.background] || child.background}
                  onAction={onAction}
                />
              );
            })}
          </Container>
        </Root>
      </motion.div>
    </AnimatePresence>
  );
}
