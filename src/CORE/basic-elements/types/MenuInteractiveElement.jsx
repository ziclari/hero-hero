import React from "react";

export default function MenuInteractiveElement({
  onAction,
  status,
  layout = {},      // ← configuración externa para posiciones, visibilidad y assets
  className = ""
}) {
  // Reglas de estado por defecto
  const defaultVisibility = {
    top: !(status === "intro" || status === "focus"),
    bottom: !(status === "intro" || status === "interaccion"),
    left: true,
    right: true
  };

  const visibility = {
    ...defaultVisibility,
    ...layout.visibility
  };

  const items = {
    top: layout.top || [],
    bottom: layout.bottom || [],
    left: layout.left || [],
    right: layout.right || [],
    floating: layout.floating || []
  };

  return (
    <div className={`menu-interactive ${className}`}>
      {/* TOP SLOT */}
      {visibility.top && items.top.length > 0 && (
        <div className="menu-slot menu-slot__top">
          {items.top.map((item, i) => (
            <SlotItem key={`top-${i}`} item={item} onAction={onAction} />
          ))}
        </div>
      )}

      {/* BOTTOM SLOT */}
      {visibility.bottom && items.bottom.length > 0 && (
        <div className="menu-slot menu-slot__bottom">
          {items.bottom.map((item, i) => (
            <SlotItem key={`bottom-${i}`} item={item} onAction={onAction} />
          ))}
        </div>
      )}

      {/* LEFT SLOT */}
      {visibility.left && items.left.length > 0 && (
        <div className="menu-slot menu-slot__left">
          {items.left.map((item, i) => (
            <SlotItem key={`left-${i}`} item={item} onAction={onAction} />
          ))}
        </div>
      )}

      {/* RIGHT SLOT */}
      {visibility.right && items.right.length > 0 && (
        <div className="menu-slot menu-slot__right">
          {items.right.map((item, i) => (
            <SlotItem key={`right-${i}`} item={item} onAction={onAction} />
          ))}
        </div>
      )}

      {/* FLOATING SLOT (HUD, overlays, indicadores) */}
      {items.floating.length > 0 && (
        <div className="menu-slot menu-slot__floating">
          {items.floating.map((item, i) => (
            <SlotItem key={`float-${i}`} item={item} onAction={onAction} />
          ))}
        </div>
      )}
    </div>
  );
}

function SlotItem({ item, onAction }) {
  if (item.type === "button") {
    return (
      <button
        className={`menu-item menu-button ${item.className || ""}`}
        onClick={() => onAction(item.action)}
      >
        <img src={item.icon} alt={item.alt} />
      </button>
    );
  }

  if (item.type === "image") {
    return (
      <img
        className={`menu-item menu-image ${item.className || ""}`}
        src={item.src}
        alt={item.alt}
      />
    );
  }

  if (item.type === "text") {
    return (
      <p className={`menu-item menu-text ${item.className || ""}`}>
        {item.content}
      </p>
    );
  }

  return null;
}
