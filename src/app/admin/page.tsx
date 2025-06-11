'use client';

import React, { useCallback, useEffect, useState } from "react";
import "../styles/formTable.css";
import showAlert from "@/app/utils/alert";
import api from "@/app/utils/api";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import Header from "@/app/components/header";
import { updateRole } from "../scripts/utils";
import Spinner from "../components/spinner";

export default function AdminPage() {
  const router = useRouter();
  const [password, setPassword] = useState<string>("");
  const [isAdminOn, setIsAdminOn] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [activeTopicName, setActiveTopicName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);

      const role = updateRole();
      setIsAdminOn(role);

      setActiveCategory(sessionStorage.getItem("activeCategory"));
      setActiveCategoryName(sessionStorage.getItem("activeCategoryName"));
      setActiveTopic(sessionStorage.getItem("activeTopic"));
      setActiveTopicName(sessionStorage.getItem("activeTopicName"));

      setIsLoading(false);
    };
    init();
  }, []);

  const updateSelection = useCallback((catId: string | null, catName: string | null, topId: string | null, topName: string | null) => {
    setActiveCategory(catId);
    setActiveCategoryName(catName);
    setActiveTopic(topId);
    setActiveTopicName(topName);

    if (catId) sessionStorage.setItem("activeCategory", catId);
    else sessionStorage.removeItem("activeCategory");

    if (catName) sessionStorage.setItem("activeCategoryName", catName);
    else sessionStorage.removeItem("activeCategoryName");

    if (topId) sessionStorage.setItem("activeTopic", topId);
    else sessionStorage.removeItem("activeTopic");

    if (topName) sessionStorage.setItem("activeTopicName", topName);
    else sessionStorage.removeItem("activeTopicName");
  }, []);

  async function onConfirm() {
    try {
      const res = await api.post("/users/admin/login", {
        username: "admin",
        password: password,
      });

      const message = res.data.message?.[0] || "OK";
      showAlert(res.data.statusCode, message);
      sessionStorage.setItem("adminStatus", "true");
      router.push("/");
      return true;
    } catch (error) {
      const err = error as AxiosError<{ message?: string | string[] }>;
      const status = err.response?.status || 500;
      const message = (err.response?.data?.message?.[0] as string) || "Unknown error";
      showAlert(status, message);
      sessionStorage.setItem("adminStatus", "false");
      return false;
    }
  }

  function onCancel() {
    router.push("/");
  }

  return (
    <>
      <Header
        isAdminOn={isAdminOn}
        visible={false}
        activeCategory={activeCategory}
        activeCategoryName={activeCategoryName}
        updateSelection={updateSelection}
        activeTopic={activeTopic}
        activeTopicName={activeTopicName}
      />
      <main>
        {isLoading ? (
            <Spinner />
        ) : (
          <div className="form">
            <div className="formTable no-select">
              <label htmlFor="username">Użytkownik</label>
              <input id="username" name="username" type="text" value="admin" autoComplete="username" readOnly />
              <br />
              <label htmlFor="password">Hasło</label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Wprowadź Hasło Admina"
              />
              <div
                className="btnsSwitchPopUp"
                style={{
                  marginTop: "20px",
                }}
              >
                <button
                  style={{
                    width: "200px",
                    maxWidth: "200px",
                  }}
                  className="btnSwicthPopUp confirm"
                  onClick={onConfirm}
                >
                  Potwierdź
                </button>
                <button
                  style={{
                    width: "200px",
                    maxWidth: "200px",
                  }}
                  className="btnSwicthPopUp cancel-on-white"
                  onClick={onCancel}
                >
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}