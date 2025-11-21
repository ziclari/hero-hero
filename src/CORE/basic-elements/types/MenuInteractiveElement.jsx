import React from "react";

export default function MenuInteractiveElement({ onAction, status }) {
  const isInteraccion = status === "interaccion";
  const isFocus = status === "focus";
  const isIntro = status === "intro";
  return (
    <div className="menu-interactive">
      {/* --- TOP BAR --- */}
      <div className="base base__top">
        <button
          className="button icon clickable"
          style={{ opacity: isIntro || isFocus ? "0" : "1" }}
          onClick={() => onAction(`goto_scene:menu`)}
        >
          <img
            src="/interactivos/menu.png"
            alt="Menú principal"
            className="base__icon-top"
          />
        </button>

        <img
          src="/logos/ebc_logo.png"
          alt="Logo EBC"
          className="base__logo-top"
        />
      </div>

      {/* --- BOTTOM LOGO --- */}
      {!isInteraccion && !isIntro && (
        <div className="base base__bottom reveal-border">
          <img
            src="/logos/electro.png"
            alt="Logo Electro Conexiones del Bajío"
            className="slide-in-left base__logo"
          />
        </div>
      )}
    </div>
  );
}
