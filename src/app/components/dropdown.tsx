'use client';

import React, { useEffect, useState, useRef } from "react";
import { TypeCategory } from "@/app/types/TypeCategory";
import "@/app/styles/globals.css";
import "@/app/styles/dropdown.css";
import { useRouter } from "next/navigation";

export type TypeCategories = TypeCategory[];

interface DropdownProps {
  categories: TypeCategories;
  activeCategory: string | null;
  activeCategoryName: string | null;
  activeTopic: string | null;
  activeTopicName: string | null;
  visible?: boolean;
  setActiveCategory: (catId: string, catName: string) => void;
  setActiveTopic: (catId: string, topicId: string, topicName: string, catName?: string) => void;
}

export default function Dropdown({
  categories,
  activeCategory,
  activeTopic,
  visible = true,
  setActiveCategory,
  setActiveTopic
}: DropdownProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, visible]);

  const handleCategoryClick = (id: string, name: string) => {
    if (!visible) return;

    const updatedOpenCategories = new Set(openCategories);
    if (updatedOpenCategories.has(id)) {
      updatedOpenCategories.delete(id);
    } else {
      updatedOpenCategories.add(id);
    }
    setOpenCategories(updatedOpenCategories);
    setActiveCategory(id, name);

    router.push("/");
  };

  const handleTopicClick = (catId: string, topicId: string, topicName: string, catName: string) => {
    if (!visible) return;

    setActiveTopic(catId, topicId, topicName, catName);

    router.push("/");
  };

  const toggleDropdown = () => {
    if (!visible) return;

    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!visible) return;

    const syncWithSession = () => {
      const catId = sessionStorage.getItem("activeCategory");
      const catName = sessionStorage.getItem("activeCategoryName");
      const topicId = sessionStorage.getItem("activeTopic");
      const topicName = sessionStorage.getItem("activeTopicName");

      if (catId && catName && (!activeCategory || activeCategory !== catId)) {
        setActiveCategory(catId, catName);
      }

      if (topicId && topicName && (!activeTopic || activeTopic !== topicId)) {
        setActiveTopic(catId ?? "", topicId, topicName, catName ?? "");

        setOpenCategories((prev) => {
          const updated = new Set(prev);
          if (catId) updated.add(catId);
          return updated;
        });
      }
    };

    window.addEventListener("storage", syncWithSession);

    syncWithSession();

    return () => {
      window.removeEventListener("storage", syncWithSession);
    };
  }, [activeCategory, activeTopic, setActiveCategory, setActiveTopic, visible]);

  return (
    <div className="dropdown no-select word-break" ref={dropdownRef}>
      <button
        className="dropbtn"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Toggle menu"
      >
        <div
          className="menuLine"
          style={{ backgroundColor: isOpen ? "#577A99" : "white" }}
        ></div>
        <div
          className="menuLine"
          style={{ backgroundColor: isOpen ? "#577A99" : "white" }}
        ></div>
        <div
          className="menuLine"
          style={{ backgroundColor: isOpen ? "#577A99" : "white" }}
        ></div>
      </button>

      <div className={`dropdown-content ${isOpen ? "show" : ""}`}>
        <div
          className={`element ${activeCategory === "Main Body" && !activeTopic ? "active" : ""}`}
          onClick={() => handleCategoryClick("Main Body", "Kategorie")}
        >
          <span>Kategorie</span>
        </div>

        {categories.map((category: TypeCategory) => (
          <React.Fragment key={category.id}>
            <div
              className={`element ${activeCategory === category.id && !activeTopic ? "active" : ""}`}
              onClick={() => handleCategoryClick(category.id, category.name ?? "Nieznana")}
            >
              <span>{category.name ?? ""}</span>
              {category.topics.length > 0 && (
                <span className="dropIcon">
                  {openCategories.has(category.id) ? "▲" : "▼"}
                </span>
              )}
            </div>
            {category.topics.length > 0 && openCategories.has(category.id) && (
              <div className="topics show">
                {category.topics.map((topic) => (
                  <div
                    key={topic.id}
                    className={`element topic ${activeTopic === topic.id ? "active" : ""}`}
                    onClick={() =>
                      handleTopicClick(
                        category.id,
                        topic.id,
                        topic.title ?? "Nieznana",
                        category.name ?? "Nieznana"
                      )
                    }
                  >
                    {topic.title ?? ""}
                  </div>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}