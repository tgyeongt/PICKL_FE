import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { privateAPI } from "../lib/api.js";

// AI 피클 히스토리 관련 API 함수들
export const chatbotAPI = {
  // 대화 목록 조회 (제목 + ID)
  getConversations: async () => {
    const response = await privateAPI.get("/chatbot/conversations");
    return response.data;
  },

  // 특정 대화의 채팅 내역 조회
  getConversationHistory: async (conversationId) => {
    const response = await privateAPI.get(`/chatbot/conversations/${conversationId}`);
    return response.data;
  },

  // 대화 삭제
  deleteConversation: async (conversationId) => {
    const response = await privateAPI.delete(`/chatbot/conversations/${conversationId}`);
    return response.data;
  },
};

export default function useChatbot() {
  const { id } = useParams();
  const location = useLocation();

  const [conversationId, setConversationId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesEndRef = useRef(null);
  const conversationIdRef = useRef(conversationId);
  const typingQueueRef = useRef([]);
  const typingIntervalRef = useRef(null);
  const questionHandledRef = useRef(false);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  // URL에서 넘어온 id로 conversationId 세팅
  useEffect(() => {
    if (id && !conversationId) {
      setConversationId(id);
      conversationIdRef.current = id;
    }
  }, [id, conversationId]);

  // 이전 대화 불러오기
  useEffect(() => {
    const fetchHistory = async () => {
      if (!conversationId) return;
      try {
        const resData = await chatbotAPI.getConversationHistory(conversationId);
        if (resData?.data?.messages) {
          const apiMessages = resData.data.messages;
          const mapped = apiMessages.map((m) => ({
            role: m.role.toLowerCase(),
            text: m.content,
          }));
          setMessages((prev) => (prev.length > 0 ? prev : mapped));
        }
      } catch (err) {
        console.error("이전 대화 불러오기 실패:", err);
      }
    };
    fetchHistory();
  }, [conversationId]);

  // 다른 페이지에서 질문 넘어온 경우
  useEffect(() => {
    if (location.state?.question && !isStreaming && !questionHandledRef.current) {
      handleSearch(location.state.question);
      questionHandledRef.current = true;
      window.history.replaceState({}, "", location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, isStreaming]);

  // 메시지 추가될 때 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 타이핑 관련 로직
  const startTyping = () => {
    if (typingIntervalRef.current) return;

    typingIntervalRef.current = setInterval(() => {
      if (typingQueueRef.current.length === 0) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
        return;
      }
      const nextToken = typingQueueRef.current.shift();
      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
          updated[lastIdx] = {
            role: "assistant",
            text: (updated[lastIdx].text || "") + nextToken,
          };
        }
        return updated;
      });
    }, 100);
  };

  const enqueueAssistantText = (chunk) => {
    if (!chunk) return;

    let normalized = chunk;
    if (normalized === "-") {
      normalized = "\n\n-";
    }
    typingQueueRef.current.push(normalized);
    startTyping();
  };

  // 스트리밍
  const streamChat = async (message) => {
    setIsStreaming(true);
    const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;
    const url = `${baseUrl}/chatbot/chat/stream`;
    const token = localStorage.getItem("accessToken");

    try {
      const currentConvId = conversationIdRef.current || null;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId: 1,
          conversationId: currentConvId,
          message,
        }),
      });

      if (!res.ok || !res.body) throw new Error("스트림 시작 실패");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      const processEvent = (eventChunk) => {
        const lines = eventChunk.split("\n");
        let currentEvent = null;

        for (const line of lines) {
          if (line.startsWith("event:")) {
            currentEvent = line.replace("event:", "").trim();
          } else if (line.startsWith("data:")) {
            const dataStr = line.slice(5);
            const dataTrimStr = line.slice(5).trim();

            if (currentEvent === "conversationId") {
              const newId = Number(dataTrimStr);
              if (!isNaN(newId)) {
                setConversationId(newId);
                conversationIdRef.current = newId;
                window.history.replaceState(null, "", `/chat/${newId}`);
              }
            } else {
              enqueueAssistantText(dataStr);
            }
          }
        }
      };

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        for (let i = 0; i < parts.length - 1; i++) processEvent(parts[i]);
        buffer = parts[parts.length - 1];
      }

      if (buffer) processEvent(buffer);
    } catch (err) {
      console.error("streamChat 오류:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "죄송해요. 답변 중 오류가 발생했어요." },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  // 질문 핸들링
  const handleSearch = async (text) => {
    const content = text || searchText;
    if (!content || isStreaming) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: content },
      { role: "assistant", text: "" },
    ]);
    setSearchText("");

    await streamChat(content);
  };

  return {
    messages,
    searchText,
    setSearchText,
    handleSearch,
    isStreaming,
    messagesEndRef,
  };
}
