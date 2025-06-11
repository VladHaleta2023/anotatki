import React, { useEffect, useState, useRef } from "react";
import { ApiTopic } from "@/app/api/ApiTopic";
import showAlert from "@/app/utils/alert";
import { TopicNotes } from "@/app/api/ApiTopic";
import Spinner from "@/app/components/spinner";
import { ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import "@/app/styles/notes.css";
import { useRouter } from "next/navigation";

type NotesProps = {
  isAdminOn: boolean;
  categoryId: string;
  topicId: string;
  textTitle: string;
};

export default function Notes({ isAdminOn, categoryId, topicId, textTitle }: NotesProps) {
  const router = useRouter();
  const [textContent, setTextContent] = useState("");
  const [notes, setNotes] = useState<TopicNotes | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const editableRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      if (!topicId || topicId === "Main Body") {
        setTextContent("");
        setNotes(null);
        setIsLoading(false);
        return;
      }

      try {
        const topicData = await ApiTopic.fetchTopicById(categoryId, topicId);
        if (topicData) {
          setNotes(topicData);
          setTextContent(topicData.current?.content || "");
        } else {
          setTextContent("");
          setNotes(null);
        }
      } catch (err) {
        showAlert(500, `Błąd ładowania tematu: ${err}`);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [categoryId, topicId]);

  useEffect(() => {
    if (editableRef.current && editableRef.current.innerText !== textContent) {
      editableRef.current.innerText = textContent;
    }
  }, [textContent]);

  async function saveNotes() {
    if (!topicId || topicId === "") return;
    await ApiTopic.updateTopicNotes(categoryId, topicId, textContent);
  }

  function exitNotes() {
    sessionStorage.removeItem("activeTopic");
    sessionStorage.removeItem("activeTopicName");
    window.location.reload();
  }

  function handleBehavior() {
    const behaviorTopicId = notes?.behavior?.id;
    if (behaviorTopicId) {
      sessionStorage.setItem("activeTopic", behaviorTopicId);
      sessionStorage.setItem("activeTopicName", notes?.behavior?.title || "");
      router.refresh();
    }
  }

  function handleNext() {
    const nextTopicId = notes?.next?.id;
    if (nextTopicId) {
      sessionStorage.setItem("activeTopic", nextTopicId);
      sessionStorage.setItem("activeTopicName", notes?.next?.title || "");
      router.refresh();
    }
  }

  return (
    <>
      {isLoading ? (
        <main>
          <Spinner />
        </main>
      ) : (
        <main>
          <div className="form">
            <div className="btnsNotes">
              <div className="btnsNavigation">
                <button className="btnProperty" onClick={exitNotes} style={{ marginBottom: 0 }}>
                  <ArrowUp size={24} />
                </button>
                {notes?.behavior && (
                  <button
                    className="btnProperty"
                    onClick={handleBehavior}
                    style={{ marginBottom: 0 }}
                  >
                    <ArrowLeft size={24} />
                  </button>
                )}
                {notes?.next && (
                  <button
                    className="btnProperty"
                    onClick={handleNext}
                    style={{ marginBottom: 0 }}
                  >
                    <ArrowRight size={24} />
                  </button>
                )}
              </div>
              {isAdminOn && (
                <button className="btnSaveNotes" onClick={saveNotes}>
                  Zapisz
                </button>
              )}
            </div>
            <div className="form-notes word-break">
              <div className="title-notes">{textTitle}</div>
              <hr />
              <div style={{ height: 12 }} />
              <div
                ref={editableRef}
                className="text"
                contentEditable={isAdminOn}
                suppressContentEditableWarning={true}
                role="textbox"
                aria-multiline="true"
                data-placeholder={isAdminOn ? "Wprowadź notatki..." : ""}
                onInput={(e) => setTextContent((e.target as HTMLDivElement).innerText)}
                onPaste={(e) => {
                  e.preventDefault();
                  const text = e.clipboardData.getData("text/plain");

                  const selection = window.getSelection();
                  if (!selection || !selection.rangeCount) return;

                  const range = selection.getRangeAt(0);
                  range.deleteContents();
                  const textNode = document.createTextNode(text);
                  range.insertNode(textNode);

                  range.setStartAfter(textNode);
                  range.setEndAfter(textNode);
                  selection.removeAllRanges();
                  selection.addRange(range);
                }}
                spellCheck={false}
                style={{
                  whiteSpace: "pre-wrap",
                  outline: "none",
                  cursor: isAdminOn ? "text" : "default",
                }}
              />
            </div>
          </div>
        </main>
      )}
    </>
  );
}