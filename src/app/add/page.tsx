'use client';

import React, { useEffect, useState, useCallback } from "react";
import "@/app/styles/formTable.css";
import { useRouter } from "next/navigation";
import Header from "@/app/components/header";
import { updateRole } from "@/app/scripts/utils";
import Spinner from "@/app/components/spinner";
import { AxiosError } from "axios";
import showAlert from "@/app/utils/alert";
import { ApiCategory } from "../api/ApiCategory";
import { ApiTopic } from "@/app/api/ApiTopic";

export default function AddPage() {
    const router = useRouter();
    const [text, setText] = useState<string>("");

    const [isLoading, setIsLoading] = useState(true);
    const [isAdminOn, setIsAdminOn] = useState<boolean>(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);
    const [activeTopic, setActiveTopic] = useState<string | null>(null);
    const [activeTopicName, setActiveTopicName] = useState<string | null>(null);

    const updateSelection = (
        catId: string | null,
        catName: string | null,
        topId: string | null,
        topName: string | null
    ) => {
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
    };

    const isCategory = useCallback(() => activeCategory === "Main Body", [activeCategory]);

    useEffect(() => {
        const init = () => {
            const role = updateRole();
            if (!role) {
                sessionStorage.setItem("adminStatus", "false");
                router.push('/');
                return;
            }

            sessionStorage.setItem("adminStatus", "true");
            setIsAdminOn(true);

            const cat = sessionStorage.getItem("activeCategory");
            const catName = sessionStorage.getItem("activeCategoryName");
            const top = sessionStorage.getItem("activeTopic");
            const topName = sessionStorage.getItem("activeTopicName");

            setActiveCategory(cat);
            setActiveCategoryName(catName);
            setActiveTopic(top);
            setActiveTopicName(topName);

            setIsLoading(false);
        };

        init();
    }, [router]);

    async function onConfirm() {
        try {
            if (isCategory()) {
                if (await ApiCategory.createCategory(text)) {
                    router.push('/');
                }
            } else {
                if (activeCategory && await ApiTopic.createTopic(activeCategory, text)) {
                    router.push('/');
                }
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
        router.push('/');
    }

    return (
        <>
            <Header
                visible={false}
                isAdminOn={isAdminOn}
                activeCategory={activeCategory}
                activeCategoryName={activeCategoryName}
                activeTopic={activeTopic}
                activeTopicName={activeTopicName}
                updateSelection={updateSelection}
            />
            {isLoading ? (
                <main>
                    <Spinner />
                </main>
            ) : (
                <main>
                    <div className="form">
                        <div className="formTable no-select">
                            <div className="title">{isCategory() ? "Kategoria" : "Temat"}</div>
                            <textarea
                                id="textarea"
                                name="textarea"
                                className="inputCustomText"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Wprowadź tekst..."
                            />
                            <div className="btnsSwitchPopUp" style={{ marginTop: "20px" }}>
                                <button
                                    style={{ width: "120px", maxWidth: "120px" }}
                                    className="btnSwicthPopUp confirm"
                                    onClick={onConfirm}
                                >
                                    Dodać
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
            )}
        </>
    );
}