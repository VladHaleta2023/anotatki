'use client';

import React, { useState } from "react";
import { Edit, Trash2, Plus, ArrowUp } from 'lucide-react';
import Message from "@/app/components/message";
import showAlert from "@/app/utils/alert";
import { renderTextWithLineBreaks } from "@/app/scripts/utils";
import "@/app/styles/formTable.css";
import "@/app/styles/globals.css";
import Spinner from "@/app/components/spinner";
import { TypeTopic } from "@/app/types/TypeTopic";
import { ApiTopic } from "@/app/api/ApiTopic";
import { useRouter } from "next/navigation";

interface TopicsProps {
  isAdminOn: boolean;
  activeCategory: string | null;
  activeCategoryName: string | null;
  topics: TypeTopic[];
  refreshTopics: () => Promise<void>;
}

export default function Topics({
  isAdminOn,
  activeCategory,
  activeCategoryName,
  topics,
  refreshTopics
}: TopicsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messageVisible, setMessageVisible] = useState(false);
  const [activeTopicIdToDelete, setActiveTopicIdToDelete] = useState<string | null>(null);

  const handleDelete = async (): Promise<void> => {
    setMessageVisible(false);
    if (!activeCategory || !activeTopicIdToDelete) return;

    setIsLoading(true);
    try {
      await ApiTopic.deleteTopic(activeCategory, activeTopicIdToDelete);
      await refreshTopics();
    } catch (err) {
      showAlert(500, `Błąd usuwania: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id: string, name: string) => {
    sessionStorage.setItem("activeTopic", id);
    sessionStorage.setItem("activeTopicName", name);
    router.push("/edit");
  };

  const handleAdd = () => {
    router.push("/add");
  };

  const handleBackClick = () => {
    sessionStorage.setItem("activeCategory", "Main Body");
    sessionStorage.setItem("activeCategoryName", "Kategorie");
    sessionStorage.setItem("activeTopicName", "");
    router.refresh();
  };

  const handleItemClick = (id: string, name: string) => {
    sessionStorage.setItem("activeTopic", id);
    sessionStorage.setItem("activeTopicName", name);
    window.location.reload();
  };

  return (
    <>
      <Message
        visible={messageVisible}
        setVisible={setMessageVisible}
        message="Czy na pewno chcesz usunąć ten temat?"
        textConfirm="Tak"
        textCancel="Nie"
        onConfirm={handleDelete}
      />
      <main>
        {isLoading ? (
          <Spinner />
        ) : (
          <div className='form'>
            <button className='btnProperty' onClick={handleBackClick}>
              <ArrowUp size={24} />
            </button>
            {isAdminOn && (
              <button className='btnProperty' onClick={handleAdd}>
                <Plus size={24} />
              </button>
            )}
            <div className='formTable no-select'>
              <div className='element elementTitle'>{activeCategoryName}</div>
              {topics.map((item) => (
                <div
                  className='element'
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleItemClick(item.id, item.title)}
                  onClick={() => handleItemClick(item.id, item.title)}
                >
                  <div className='text'>
                    {renderTextWithLineBreaks(item.title)}
                  </div>
                  {isAdminOn && (
                    <div className='btnsContent'>
                      <button
                        className='btnContent'
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(item.id, item.title);
                        }}
                      >
                        <Edit size={24} />
                      </button>
                      <button
                        className='btnContent'
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTopicIdToDelete(item.id);
                          setMessageVisible(true);
                        }}
                        aria-label="Usuń"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}