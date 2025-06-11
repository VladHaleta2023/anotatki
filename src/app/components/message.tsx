'use client'

import React from 'react';
import "@/app/styles/globals.css";
import SwitchPopUp from "@/app/components/switchPopUp";

export type TypeMessage = {
  visible?: boolean;
  setVisible: (visible: boolean) => void;
  message?: string;
  textConfirm?: string;
  textCancel?: string;
  onConfirm?: () => Promise<void> | void;
  btnsWidth?: string;
  bodyMaxWidth?: string;
};

export default function Message({
        visible=true,
        message="Message",
        textConfirm="Yes",
        textCancel="No",
        btnsWidth='100px',
        bodyMaxWidth='600px',
        setVisible,
        onConfirm
    }: TypeMessage) {
    const handleConfirm = async () => {
        try {
            if (onConfirm) await onConfirm();
        } finally {
            setVisible(false);
        }
    };

    return (
        <SwitchPopUp
            visible={visible}
            onClose={() => setVisible(false)}
            onConfirm={handleConfirm}
            isMessageVisible={true}
            message={message}
            textConfirm={textConfirm}
            textCancel={textCancel}
            bodyMaxWidth={bodyMaxWidth}
            btnsWidth={btnsWidth}/>
    )
}