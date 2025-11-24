import React from "react";
import AudioElement from "./types/AudioElement";
import ButtonElement from "./types/ButtonElement";
import FileUploadElement from "./types/FileUploadElement";
import GroupElement from "./types/GroupElement";
import ImageElement from "./types/ImageElement";
import LinkElement from "./types/LinkElement";
import TextElement from "./types/TextElement";
import DialogElement from "./types/DialogElement";
import CardElement from "./types/CardElement";
import ModalElement from "./types/ModalElement";
import MenuInteractiveElement from "./types/MenuInteractiveElement";
import Button from "./types/AriaButton";
const typeMap = {
  Button: Button,
  audio: AudioElement,
  icon_button: ButtonElement,
  fileupload: FileUploadElement,
  group: GroupElement,
  image: ImageElement,
  link: LinkElement,
  text: TextElement,
  dialog: DialogElement,
  card: CardElement,
  modal: ModalElement,
  menuInteractive: MenuInteractiveElement,
};

export default function Element({ type, onAction, ...props }) {
  // Props comunes para todos los elementos
  const commonProps = {
    onAction,
    className: props.className || "",
    renderElement: Element,
  };

  const SpecificElement = typeMap[type];

  if (!SpecificElement) return null;
  return <SpecificElement key={type + props.id} {...props} {...commonProps} />;
}
