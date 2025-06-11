'use client';

import React, { useEffect, useState, useCallback } from "react";
import { TypeCategory } from "@/app/types/TypeCategory";
import { TypeTopic } from "@/app/types/TypeTopic";
import showAlert from "@/app/utils/alert";
import { ApiCategory } from "@/app/api/ApiCategory";
import { ApiTopic } from "@/app/api/ApiTopic";
import "@/app/styles/formTable.css";
import "@/app/styles/globals.css";
import Header from "@/app/components/header";
import Categories from "./components/categories";
import Spinner from "./components/spinner";
import Topics from "./components/topics";
import Notes from "./components/notes";

export default function HomePage() {
  const [isAdminOn, setIsAdminOn] = useState<boolean>(false);
  const [categories, setCategories] = useState<TypeCategory[]>([]);
  const [topics, setTopics] = useState<TypeTopic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [activeCategory, setActiveCategory] = useState<string>("Main Body");
  const [activeCategoryName, setActiveCategoryName] = useState<string>("Kategorie");
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [activeTopicName, setActiveTopicName] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const fetchedCategories = await ApiCategory.fetchCategories();
      setCategories(fetchedCategories);

      if (activeCategory && activeCategory !== "Main Body") {
        const fetchedTopics = await ApiTopic.fetchTopics(activeCategory);
        setTopics(fetchedTopics);
      } else {
        setTopics([]);
      }
    } catch (err) {
      showAlert(500, `Server error: ${err}`);
    }
  }, [activeCategory]);

  useEffect(() => {
    const init = async () => {
    setIsLoading(true);

    const storedAdminStatus = sessionStorage.getItem("adminStatus");
    const isAdmin = storedAdminStatus === "true";
    setIsAdminOn(isAdmin);

    const storedCatId = sessionStorage.getItem("activeCategory");
    const storedCatName = sessionStorage.getItem("activeCategoryName");
    const storedTopId = sessionStorage.getItem("activeTopic");
    const storedTopName = sessionStorage.getItem("activeTopicName");

    if (storedCatId) setActiveCategory(storedCatId);
    else sessionStorage.setItem("activeCategory", "Main Body");

    if (storedCatName) setActiveCategoryName(storedCatName);
    else sessionStorage.setItem("activeCategoryName", "Kategorie");

    if (storedTopId) setActiveTopic(storedTopId);
    else sessionStorage.removeItem("activeTopic");

    if (storedTopName) setActiveTopicName(storedTopName);
    else sessionStorage.removeItem("activeTopicName");

    await fetchData();
      setIsLoading(false);
    };
    init();
  }, [fetchData]);

  const updateSelection = (
    catId: string | null,
    catName: string | null,
    topId: string | null,
    topName: string | null
  ) => {
    setActiveCategory(catId ?? "Main Body");
    setActiveCategoryName(catName ?? "Kategorie");
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

    if (catId && catId !== "Main Body") {
      ApiTopic.fetchTopics(catId)
        .then(setTopics)
        .catch(err => showAlert(500, `Server error: ${err}`));
    } else {
      setTopics([]);
    }
  };

  return (
    <>
      <Header 
        categories={categories} 
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
      ) : activeCategory === "Main Body" ? (
        <Categories
          isAdminOn={isAdminOn}
          categories={categories}
          activeCategory={activeCategory}
          onRefresh={fetchData}
        />
      ) : !activeTopic ? (
        <Topics
          isAdminOn={isAdminOn}
          activeCategory={activeCategory}
          activeCategoryName={activeCategoryName}
          topics={topics}
          refreshTopics={fetchData}
        />
      ) : (
        <Notes
          isAdminOn={isAdminOn}
          categoryId={activeCategory}
          topicId={activeTopic}
          textTitle={activeTopicName || ""}
        />
      )}
    </>
  );
}