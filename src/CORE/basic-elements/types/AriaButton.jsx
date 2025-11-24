import { Button as AriaButton } from 'react-aria-components';
import React from 'react';

// Extiende las props de react-aria-components Button y añade la prop 'variant'.
/**
 * @typedef {Object} CustomButtonProps
 * @property {'primary' | 'secondary' | 'danger' | string} [variant='primary'] - Define la variante visual del botón para estilos personalizados.
 * @property {ButtonProps} [ButtonProps] - Todas las props nativas del componente Button de react-aria-components.
 */

/**
 * Componente Button personalizado basado en react-aria-components.
 * Permite pasar todas las props de `Button` y una prop extra `variant` para estilos.
 *
 * @param {ButtonProps & CustomButtonProps} props - Las props del botón.
 * @returns {JSX.Element} El componente botón.
 */
const Button = React.forwardRef(({ variant, className, ...props }, ref) => {
  // Aquí puedes añadir lógica para clasificar o estilizar
  // basándote en la prop 'variant'. Por ejemplo, añadiendo una clase.
  // En un entorno real, usarías esta `variant` para aplicar estilos con CSS/Tailwind/etc.
  const finalClassName =
  className != null
    ? (variant != null ? `ui-button--${variant} ${className}` : className)
    : undefined;

  return (
    <AriaButton
      {...props}
      ref={ref}
      {...(finalClassName ? { className: finalClassName } : {})}
    >
      {props?.text}
    </AriaButton>
  );
});

Button.displayName = 'Button';

export default Button;