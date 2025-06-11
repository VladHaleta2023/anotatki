'use client';

import React, { useEffect, useState } from "react";
import "@/app/styles/formTable.css";
import { useRouter } from "next/navigation";
import Header from "@/app/components/header";
import { updateRole } from "@/app/scripts/utils";
import Spinner from "@/app/components/spinner";
import { AxiosError } from "axios";
import showAlert from "@/app/utils/alert";
import { ApiCategory } from "@/app/api/ApiCategory";
import { ApiTopic } from "@/app/api/ApiTopic";

export default function EditPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isAdminOn, setIsAdminOn] = useState<boolean>(false);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);

  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [activeTopicName, setActiveTopicName] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const role = updateRole();
      setIsAdminOn(role);
      if (!role) {
        sessionStorage.setItem("adminStatus", "false");
        router.push("/");
        return;
      } else {
        sessionStorage.setItem("adminStatus", "true");
      }

      const catId = sessionStorage.getItem("activeCategory");
      const catName = sessionStorage.getItem("activeCategoryName");
      const topId = sessionStorage.getItem("activeTopic");
      const topName = sessionStorage.getItem("activeTopicName");

      setActiveCategory(catId);
      setActiveCategoryName(catName);
      setActiveTopic(topId);
      setActiveTopicName(topName);

      setIsLoading(false);
    };

    init();
  }, [router]);

  function resetSelection() {
    if (!activeTopic) {
      setActiveCategory("Main Body");
      setActiveCategoryName("Kategorie");
      setActiveTopic("");
      setActiveTopicName(null);

      sessionStorage.setItem("activeCategory", "Main Body");
      sessionStorage.setItem("activeCategoryName", "Kategorie");
      sessionStorage.removeItem("activeTopic");
      sessionStorage.removeItem("activeTopicName");
    } else {
      setActiveTopic("");
      setActiveTopicName(null);

      sessionStorage.removeItem("activeTopic");
      sessionStorage.removeItem("activeTopicName");
    }
  }

  async function onConfirm() {
    try {
      if (activeTopic && activeTopicName && activeCategory) {
        const success = await ApiTopic.updateTopic(
          activeCategory,
          activeTopic,
          activeTopicName
        );
        if (success) {
          resetSelection();
          router.push("/");
        }
      } else if (activeCategory && activeCategoryName) {
        const success = await ApiCategory.updateCategory(
          activeCategory,
          activeCategoryName
        );
        if (success) {
          resetSelection();
          router.push("/");
        }
      } else {
        resetSelection();
        router.push("/");
      }
    } catch (error) {
      const err = error as AxiosError<{ message?: string | string[] }>;
      const status = err.response?.status || 500;
      const message =
        (err.response?.data?.message?.[0] as string) || "Unknown error";
      showAlert(status, message);
      sessionStorage.setItem("adminStatus", "false");
    }
  }

  function onCancel() {
    resetSelection();
    router.push("/");
  }

  if (isLoading) {
    return (
      <>
        <Header
          isAdminOn={isAdminOn}
          visible={false}
          activeCategory={activeCategory}
          activeCategoryName={activeCategoryName}
          activeTopic={activeTopic}
          activeTopicName={activeTopicName}
          updateSelection={(
            catId,
            catName,
            topId,
            topName
          ) => {
            setActiveCategory(catId);
            setActiveCategoryName(catName);
            setActiveTopic(topId);
            setActiveTopicName(topName);
          }}
        />
        <main>
          <Spinner />
        </main>
      </>
    );
  }

  return (
    <>
      <Header
        isAdminOn={isAdminOn}
        visible={false}
        activeCategory={activeCategory}
        activeCategoryName={activeCategoryName}
        activeTopic={activeTopic}
        activeTopicName={activeTopicName}
        updateSelection={(
          catId,
          catName,
          topId,
          topName
        ) => {
          setActiveCategory(catId);
          setActiveCategoryName(catName);
          setActiveTopic(topId);
          setActiveTopicName(topName);
        }}
      />
      <main>
        <div className="form">
          <div className="formTable no-select">
            {activeTopic ? (
              <>
                <div className="title">Temat</div>
                <textarea
                  id="textarea"
                  name="textarea"
                  className="inputCustomText"
                  value={activeTopicName || ""}
                  onChange={(e) => setActiveTopicName(e.target.value)}
                  placeholder="Wprowadź tekst..."
                />
              </>
            ) : (
              <>
                <div className="title">Kategoria</div>
                <textarea
                  id="textarea"
                  name="textarea"
                  className="inputCustomText"
                  value={activeCategoryName || ""}
                  onChange={(e) => setActiveCategoryName(e.target.value)}
                  placeholder="Wprowadź tekst..."
                />
              </>
            )}
            <div className="btnsSwitchPopUp" style={{ marginTop: "20px" }}>
              <button
                style={{ width: "200px", maxWidth: "200px" }}
                className="btnSwicthPopUp confirm"
                onClick={onConfirm}
              >
                Aktualizować
              </button>
              <button
                style={{ width: "120px", maxWidth: "120px" }}
                className="btnSwicthPopUp cancel-on-white"
                onClick={onCancel}
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}