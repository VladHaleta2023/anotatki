'use client'

import React, { useEffect } from "react";
import "@/app/styles/popupSwitch.css";
import IPopUpSwitchProps from "@/app/interfaces/IPopUpSwitchProps";
import showAlert from "@/app/utils/alert";

export default function SwitchPopUp({ 
    visible = false,
    textConfirm = "Confirm",
    textCancel = "Cancel",
    isMessageVisible = true,
    message = "Message",
    children = null,
    bodyMaxWidth = "600px",
    btnsWidth = "200px",
    onClose,
    onConfirm,
  }: IPopUpSwitchProps) {
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [visible]);

  if (!visible) return null;

  const handleConfirm = async () => {
    try {
      if (onConfirm) await onConfirm();
    } catch (e) {
      showAlert(500, `Server error: ${e}`);
    }
  }

  return (
    <div className="popup-overlay">
      <div className="switchPopUp word-break no-select" style={{
        maxWidth: bodyMaxWidth,
      }}>
        { isMessageVisible ? <div className="text">{message}</div> : null }
        {children}
        <div className="btnsSwitchPopUp">
          <button 
            style={{
              width: btnsWidth,
              maxWidth: btnsWidth
            }}
            className="btnSwicthPopUp confirm"
            onClick={handleConfirm}>{textConfirm}</button>
          <button
            style={{
              width: btnsWidth,
              maxWidth: btnsWidth
            }}
            className="btnSwicthPopUp cancel"
            onClick={onClose}>{textCancel}</button>
        </div>
      </div>
    </div>
  );
}
