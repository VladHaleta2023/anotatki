'use client';

import React, { useState } from "react";
import { Edit, Trash2, Plus } from 'lucide-react';
import Message from "@/app/components/message";
import { TypeCategory } from "@/app/types/TypeCategory";
import showAlert from "@/app/utils/alert";
import { ApiCategory } from "@/app/api/ApiCategory";
import { renderTextWithLineBreaks } from "@/app/scripts/utils";
import "@/app/styles/formTable.css";
import "@/app/styles/globals.css";
import { useRouter } from "next/navigation";
import Spinner from "@/app/components/spinner";

interface CategoriesProps {
  isAdminOn: boolean;
  categories: TypeCategory[];
  activeCategory?: string | null;
  onRefresh: () => Promise<void>;
}

export default function Categories({
  isAdminOn,
  categories,
  onRefresh
}: CategoriesProps) {
  const router = useRouter(); 
  const [messageVisible, setMessageVisible] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handleItemClick = (id: string, name: string) => {
    sessionStorage.setItem("activeCategory", id);
    sessionStorage.setItem("activeCategoryName", name);
    window.location.reload();
  };

  const handleDelete = async (): Promise<void> => {
    setMessageVisible(false);
    if (!categoryToDelete) return;

    setIsLoading(true);
    try {
      await ApiCategory.deleteCategory(categoryToDelete);
      await onRefresh(); // Обнови список категорий
    } catch (err) {
      showAlert(500, `Błąd usuwania: ${err}`);
    } finally {
      setIsLoading(false);
      setCategoryToDelete(null);
    }
  }

  const handleEdit = (id: string, name: string) => {
    sessionStorage.setItem("activeCategory", id);
    sessionStorage.setItem("activeCategoryName", name);
    router.push("/edit");
  }

  const handleAdd = () => {
    router.push("/add");
  }

  return (<>
    <Message
      visible={messageVisible}
      setVisible={setMessageVisible}
      message={`Czy na pewno chcesz usunąć tą kategorię?`}
      textConfirm={"Tak"}
      textCancel={"Nie"}
      onConfirm={handleDelete}
    />
    <main>
      {isLoading ? 
        <Spinner /> :
        <div className='form'>
          {isAdminOn && 
            <button
              className='btnProperty'
              onClick={handleAdd}
            >
              <Plus size={24} />
            </button>
          }
          <div className='formTable no-select'>
            <div className='element elementTitle'>Kategorie</div>
            {categories.map((item) => (
              <div
                className='element'
                key={item.id}
                onClick={() => handleItemClick(item.id, item.name)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleItemClick(item.id, item.name);
                  }
                }}>
                <div className='text'>{renderTextWithLineBreaks(item.name)}</div>
                {isAdminOn && (
                  <div className='btnsContent'>
                    <button
                      className='btnContent'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item.id, item.name);
                      }}
                    >
                      <Edit size={24} />
                    </button>
                    <button
                      className='btnContent'
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategoryToDelete(item.id);
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
      }
    </main>
  </>);
}