import React, { useEffect, useState, useRef, useCallback } from "react";
import { ApiTopic } from "@/app/api/ApiTopic";
import showAlert from "@/app/utils/alert";
import { TopicNotes } from "@/app/api/ApiTopic";
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState("0:00");
  const [totalTimeFormatted, setTotalTimeFormatted] = useState("0:00");

  const editableRef = useRef<HTMLDivElement | null>(null);

  const handleFocus = useCallback(() => {
    setTimeout(() => {
      editableRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 350);
  }, []);

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
          const newContent = topicData.current?.content || "";
          setTextContent(newContent);

          const newAudioUrl = topicData.current?.audioUrl
            ? `${topicData.current.audioUrl}?t=${Date.now()}`
            : "";
          setAudioUrl(newAudioUrl);
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

  const handlePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const playAudio = async () => {
      try {
        if (isPlaying) await audioEl.play();
        else audioEl.pause();
      } catch (err) {
        console.log("Audio play blocked by browser", err);
      }
    };
    playAudio();
  }, [isPlaying]);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const updateProgress = () => {
      const currentTime = audioEl.currentTime;
      const duration = audioEl.duration || 0;
      const percent = duration ? (currentTime / duration) * 100 : 0;
      setProgress(percent);
      setCurrentTimeFormatted(formatTime(currentTime));
    };

    const interval = setInterval(updateProgress, 200);

    const handleLoadedMetadata = () => {
      setTotalTimeFormatted(formatTime(audioEl.duration));
    };

    audioEl.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      clearInterval(interval);
      audioEl.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [audioUrl]);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    audioEl.pause();
    audioEl.currentTime = 0;
    audioEl.src = audioUrl;
    setProgress(0);
    setCurrentTimeFormatted("0:00");
    setTotalTimeFormatted("0:00");
  }, [audioUrl]);

  const saveNotes = async () => {
    if (!topicId) return;

    try {
      await ApiTopic.updateTopicNotes(categoryId, topicId, textContent);
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
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
    const behaviorTopicId = notes?.behavior?.id;
    if (behaviorTopicId) {
      sessionStorage.setItem("activeTopic", behaviorTopicId);
      sessionStorage.setItem("activeTopicName", notes?.behavior?.title || "");
      window.location.reload();
    }
  };

  const handleNext = () => {
    const nextTopicId = notes?.next?.id;
    if (nextTopicId) {
      sessionStorage.setItem("activeTopic", nextTopicId);
      sessionStorage.setItem("activeTopicName", notes?.next?.title || "");
      window.location.reload();
    }
  };

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
                  <button className="btnProperty" onClick={handleBehavior} style={{ marginBottom: 0 }}>
                    <ArrowLeft size={24} />
                  </button>
                )}
                {notes?.next && (
                  <button className="btnProperty" onClick={handleNext} style={{ marginBottom: 0 }}>
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
              <div className="audio-player">
                <div className="audio-controls">
                  <button className="btnOption" onClick={handlePlayPause}>
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                  <div style={{ marginLeft: 8, flexGrow: 1 }}>
                    <progress
                      value={progress}
                      max={100}
                      className="progress-bar"
                      style={{ width: "100%" }}
                    />
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
                role="textbox"
                aria-multiline="true"
                data-placeholder={isAdminOn ? "Wprowadź notatki..." : ""}
                onFocus={handleFocus}
                onInput={(e) => {
                  const el = e.target as HTMLDivElement;
                  setTextContent(el.innerText);

                  el.style.height = "auto";
                  el.style.height = el.scrollHeight + "px";

                  el.scrollTop = el.scrollHeight;
                }}
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

                  const el = editableRef.current;
                  if (el) {
                    setTextContent(el.innerText);
                    el.style.height = "auto";
                    el.style.height = el.scrollHeight + "px";
                    el.scrollTop = el.scrollHeight;
                  }
                }}
                spellCheck={false}
                style={{
                  whiteSpace: "pre-wrap",
                  outline: "none",
                  cursor: isAdminOn ? "text" : "default",
                  overflowY: "hidden",
                  fontSize: "16px",
                }}
              />
            </div>
          </div>
        </main>
      )}
    </>
  );
}