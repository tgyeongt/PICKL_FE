import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import useHeader from "../../shared/hooks/useHeader";
import Arrow from "@icon/chat/arrow.svg";

export default function ChatbotPage() {
  useHeader({
    title: "피클이와 대화중",
    showBack: true,
  });

  const { id } = useParams();
  const [conversationId, setConversationId] = useState(null);
  const location = useLocation();
  const [searchText, setSearchText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);

  const conversationIdRef = useRef(conversationId);
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  const firstDataProcessedRef = useRef(false);

  useEffect(() => {
    if (id && !conversationId) {
      setConversationId(id);
      conversationIdRef.current = id;
    }
  }, [id, conversationId]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!conversationId) return;
      try {
        const baseUrl = import.meta.env.VITE_SERVER_BASE_URL;
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${baseUrl}/chatbot/conversations/${conversationId}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const resData = await res.json();
        if (res.ok) {
          const apiMessages = resData.data?.messages || [];
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

  const questionHandledRef = useRef(false);

  useEffect(() => {
    if (location.state?.question && !isStreaming && !questionHandledRef.current) {
      handleSearch(location.state.question);
      questionHandledRef.current = true;
      window.history.replaceState({}, "", location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, isStreaming]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const typingQueueRef = useRef([]);
  const typingIntervalRef = useRef(null);

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
    typingQueueRef.current.push(chunk);
    startTyping();
  };

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
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const dataStr = line.slice(5);
          const dataForIdCheck = dataStr.trim();

          if (!firstDataProcessedRef.current) {
            if (/^\d+$/.test(dataForIdCheck)) {
              const newId = Number(dataForIdCheck);
              setConversationId(newId);
              conversationIdRef.current = newId;
              window.history.replaceState(null, "", `/chat/${newId}`);
              firstDataProcessedRef.current = true;
              continue;
            }
            firstDataProcessedRef.current = true;
          }

          try {
            const payload = JSON.parse(dataStr);
            const tokenText = payload?.token ?? payload?.content ?? payload?.text ?? "";
            if (tokenText) enqueueAssistantText(tokenText);
          } catch {
            if (firstDataProcessedRef.current) {
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

  return (
    <Wrapper>
      <MessageList>
        {messages.map((m, i) => (
          <Message key={i} $role={m.role}>
            {m.text}
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </MessageList>
      <SearchBox>
        <input
          type="text"
          placeholder="피클이에게 궁금한 걸 물어보세요!"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button onClick={() => handleSearch()} disabled={isStreaming}>
          <img src={Arrow} alt="" />
        </button>
      </SearchBox>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 480px;
  padding: 80px 15px 90px;
  box-sizing: border-box;
`;

const Message = styled.div`
  align-self: ${(props) => (props.$role === "user" ? "flex-end" : "flex-start")};
  background: ${(props) => (props.$role === "user" ? "#38b628" : "#eaeaed")};
  color: ${(props) => (props.$role === "user" ? "#fff" : "#1c1b1a")};
  padding: 10px 12px;
  border-radius: 12px;
  max-width: 85%;
  white-space: pre-wrap;
`;

const SearchBox = styled.div`
  position: fixed;
  bottom: 20px;
  display: flex;
  gap: 8px;
  width: 90%;
  height: 50px;
  max-width: 400px;
  border: 1px solid #ccc;
  border-radius: 30px;
  padding: 5px;
  background: white;
  transition: bottom 0.3s ease;

  input {
    flex: 1;
    padding: 10px 15px;
    font-size: 14px;
  }

  button {
    height: 40px;
    width: 40px;
    cursor: pointer;
  }
`;
