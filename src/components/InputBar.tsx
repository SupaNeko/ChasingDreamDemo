"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Send, Mic, MicOff } from "lucide-react";
import { Button } from "./Button";

type SpeechRecognitionType = typeof window.SpeechRecognition | typeof window.webkitSpeechRecognition;

interface InputBarProps {
  onSend: (content: string, inputType: "text" | "voice") => void;
  loading: boolean;
}

export function InputBar({ onSend, loading }: InputBarProps) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const canSend = text.trim().length > 0 && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    const content = text.trim();
    try {
      await onSend(content, "text");
      setText("");
    } catch {
      // preserve text on failure
    }
  };

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("您的浏览器不支持语音输入");
      return;
    }

    setVoiceError(null);
    const recognition = new SpeechRecognition();
    recognition.lang = "zh-CN";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "not-allowed") {
        setVoiceError("请允许麦克风权限以使用语音输入");
      } else if (event.error === "no-speech") {
        setVoiceError("未检测到语音，请重试");
      } else {
        setVoiceError("语音识别出错，请重试");
      }
      setIsRecording(false);
    };
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        }
      }
      if (final) {
        setText((prev) => (prev ? prev + final : final));
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const hasSpeechSupport =
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 16px",
        background: "var(--color-surface)",
        borderTop: "1px solid var(--color-quiet-border)",
      }}
    >
      {hasSpeechSupport && (
        <button
          type="button"
          onClick={toggleRecording}
          disabled={loading}
          aria-label={isRecording ? "停止语音输入" : "开始语音输入"}
          aria-pressed={isRecording}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "none",
            background: isRecording
              ? "var(--color-rose-shadow)"
              : "var(--color-quiet-border)",
            color: "var(--color-ink-gray)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1,
            flexShrink: 0,
          }}
        >
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
      )}
      <input
        type="text"
        placeholder="讲述你的梦境碎片…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
        aria-label="梦境片段输入"
        style={{
          flex: 1,
          padding: "12px 16px",
          fontSize: "16px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-quiet-border)",
          background: "var(--color-night-paper)",
          color: "var(--color-ink-gray)",
          outline: "none",
        }}
      />
      <Button
        variant="primary"
        loading={loading}
        disabled={!canSend}
        style={{ flexShrink: 0 }}
        aria-label="发送"
      >
        <Send size={18} />
      </Button>
      {voiceError && (
        <span
          style={{
            position: "absolute",
            bottom: "100%",
            left: 16,
            background: "var(--color-error)",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "var(--radius-sm)",
            fontSize: "13px",
          }}
        >
          {voiceError}
        </span>
      )}
    </form>
  );
}
