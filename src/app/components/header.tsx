'use client';

import React, { useState } from "react";
import showAlert from "@/app/utils/alert";
import api from "@/app/utils/api";
import { AxiosError } from "axios"; 
import Message from "@/app/components/message";
import { useRouter } from "next/navigation";
import { TypeCategory } from "@/app/types/TypeCategory";
import Dropdown from "@/app/components/dropdown";
import "@/app/styles/globals.css";
import "@/app/styles/header.css";

interface HeaderProps {
  visible?: boolean;
  categories?: TypeCategory[];
  isAdminOn: boolean;
  activeCategory: string | null;
  activeCategoryName: string | null;
  activeTopic: string | null;
  activeTopicName: string | null;
  updateSelection: (
    catId: string | null,
    catName: string | null,
    topId: string | null,
    topName: string | null
  ) => void;
}

export default function Header({
  visible = true,
  categories = [],
  isAdminOn,
  activeCategory,
  activeCategoryName,
  activeTopic,
  activeTopicName,
  updateSelection
}: HeaderProps) {
  const router = useRouter();

  const [messageVisible, setMessageVisible] = useState(false);

  const logoutAdmin = async () => {
    try {
      const res = await api.post("/users/admin/logout");
      const message = res.data.message[0];
      showAlert(res.data.statusCode, message);
    } catch (error) {
      const err = error as AxiosError<{ message?: string | string[] }>;

      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message?.[0] || "Unknown error";
        showAlert(status, message);
      } else if (err.request) {
        showAlert(500, "No response from server");
      } else {
        showAlert(500, "Request setup error");
      }
    } finally {
      sessionStorage.setItem("adminStatus", "false");
      setMessageVisible(false);
      window.location.reload();
    }
  };

  const toggleAdmin = async () => {
    if (isAdminOn) {
      setMessageVisible(true);
    }
    else {
      router.push("/admin")
    }
  };

  return (<>
    <Message
      visible={messageVisible}
      setVisible={setMessageVisible}
      message={"Czy na pewno chcesz wyłączyć tryb Admina?"}
      textConfirm={"Tak"}
      textCancel={"Nie"}
      onConfirm={async () => { await logoutAdmin() }}
    />
    <header className="header">
        <Dropdown
            visible={visible}
            categories={categories}
            activeCategory={activeCategory}
            activeCategoryName={activeCategoryName}
            activeTopic={activeTopic}
            activeTopicName={activeTopicName}
            setActiveCategory={(catId: string, catName: string) => updateSelection(catId, catName, null, null)}
            setActiveTopic={(catId: string, topId: string, topName: string, catName?: string) =>
                updateSelection(catId, catName ?? activeCategoryName, topId, topName)
            }
        />
        <span style={{ fontSize: "26px", marginLeft: "14px" }}>ANotatki</span>
        <button className="btnHeader" onClick={toggleAdmin}>
            Admin: {isAdminOn ? "on" : "off"}
        </button>
    </header>
  </>);
}