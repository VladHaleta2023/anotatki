import React, { useEffect, useState, useRef } from "react";
import { ApiTopic, TopicNotes } from "@/app/api/ApiTopic";
import showAlert from "@/app/utils/alert";
import Spinner from "@/app/components/spinner";
import { ArrowLeft, ArrowRight, ArrowUp, Pause, Play } from "lucide-react";
import "@/app/styles/notes.css";

type NotesProps = {
  isAdminOn: boolean;
  categoryId: string;
  topicId: string;
  textTitle: string;
};

export default function Notes({ isAdminOn, categoryId, topicId, textTitle }: NotesProps) {
  const [textContent, setTextContent] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [notes, setNotes] = useState<TopicNotes | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const audioRef = useRef<HTMLAudioElement>(null);
  const editableRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState("0:00");
  const [totalTimeFormatted, setTotalTimeFormatted] = useState("0:00");

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      if (!topicId || topicId === "Main Body") {
        setTextContent("");
        setAudioUrl("");
        setNotes(null);
        setIsLoading(false);
        return;
      }

      try {
        const topicData = await ApiTopic.fetchTopicById(categoryId, topicId);
        if (topicData) {
          setNotes(topicData);
          setTextContent(topicData.current?.content || "");
          setAudioUrl(
            topicData.current?.audioUrl
              ? `${topicData.current.audioUrl}?t=${Date.now()}`
              : ""
          );
        } else {
          setTextContent("");
          setAudioUrl("");
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

  /* -------- MOBILE KEYBOARD FIX -------- */
  useEffect(() => {
    const el = editableRef.current;
    if (!el) return;

    const handleFocus = () => {
      setTimeout(() => {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 200);
    };

    const handleViewportResize = () => {
      el.scrollIntoView({ block: "center" });
    };

    el.addEventListener("focus", handleFocus);

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportResize);
    }

    return () => {
      el.removeEventListener("focus", handleFocus);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleViewportResize);
      }
    };
  }, []);

  /* -------- AUDIO -------- */

  const handlePlayPause = () => {
    setIsPlaying((p) => !p);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const play = async () => {
      try {
        if (isPlaying) await audio.play();
        else audio.pause();
      } catch {}
    };

    play();
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const update = () => {
      const cur = audio.currentTime;
      const dur = audio.duration || 0;
      setProgress(dur ? (cur / dur) * 100 : 0);
      setCurrentTimeFormatted(formatTime(cur));
    };

    const interval = setInterval(update, 200);

    audio.addEventListener("loadedmetadata", () => {
      setTotalTimeFormatted(formatTime(audio.duration));
    });

    return () => clearInterval(interval);
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.src = audioUrl;
  }, [audioUrl]);

  /* -------- SAVE -------- */

  const saveNotes = async () => {
    if (!topicId) return;

    try {
      await ApiTopic.updateTopicNotes(categoryId, topicId, textContent);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      showAlert(500, `Błąd zapisywania notatek: ${err}`);
    }
  };

  const exitNotes = () => {
    sessionStorage.removeItem("activeTopic");
    sessionStorage.removeItem("activeTopicName");
    window.location.reload();
  };

  const handleBehavior = () => {
    const id = notes?.behavior?.id;
    if (!id) return;
    sessionStorage.setItem("activeTopic", id);
    sessionStorage.setItem("activeTopicName", notes?.behavior?.title || "");
    window.location.reload();
  };

  const handleNext = () => {
    const id = notes?.next?.id;
    if (!id) return;
    sessionStorage.setItem("activeTopic", id);
    sessionStorage.setItem("activeTopicName", notes?.next?.title || "");
    window.location.reload();
  };

  /* -------- TEXT INPUT -------- */

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setTextContent(el.innerText);

    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";

    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();
    const node = document.createTextNode(text);
    range.insertNode(node);

    range.setStartAfter(node);
    range.setEndAfter(node);
    selection.removeAllRanges();
    selection.addRange(range);

    const el = editableRef.current;
    if (!el) return;

    setTextContent(el.innerText);
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  return (
    <>
      {isLoading ? (
        <main><Spinner /></main>
      ) : (
        <main>
          <div className="form">
            <div className="btnsNotes">
              <div className="btnsNavigation">
                <button className="btnProperty" onClick={exitNotes}>
                  <ArrowUp size={24} />
                </button>
                {notes?.behavior && (
                  <button className="btnProperty" onClick={handleBehavior}>
                    <ArrowLeft size={24} />
                  </button>
                )}
                {notes?.next && (
                  <button className="btnProperty" onClick={handleNext}>
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

            <div className="form-notes">
              <div className="audio-player">
                <div className="audio-controls">
                  <button className="btnOption" onClick={handlePlayPause}>
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>

                  <div style={{ flexGrow: 1 }}>
                    <progress value={progress} max={100} className="progress-bar" />
                    <div style={{ fontSize: 14 }}>
                      {currentTimeFormatted} / {totalTimeFormatted}
                    </div>
                  </div>
                </div>

                <audio
                  ref={audioRef}
                  preload="metadata"
                  onEnded={() => setIsPlaying(false)}
                />
              </div>

              <div className="title-notes">{textTitle}</div>
              <hr />
              <div style={{ height: 12 }} />

              <div
                ref={editableRef}
                className="text"
                contentEditable={isAdminOn}
                suppressContentEditableWarning={true}
                data-placeholder={isAdminOn ? "Wprowadź notatki..." : ""}
                onInput={handleInput}
                onPaste={handlePaste}
                spellCheck={false}
              />
            </div>
          </div>
        </main>
      )}
    </>
  );
}