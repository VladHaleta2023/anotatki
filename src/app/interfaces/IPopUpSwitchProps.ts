import { ReactNode } from "react";

export default interface IPopUpSwitchProps {
  visible?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  textConfirm?: string;
  textCancel?: string;
  isMessageVisible?: boolean;
  message?: string;
  children?: ReactNode;
  bodyMaxWidth?: string;
  btnsWidth?: string;
}