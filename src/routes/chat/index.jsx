import styled from "styled-components";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import PickL from "@image/chat_character.png";

export default function Chat() {
  const navigate = useNavigate();

  const handleCardClick = (text) => {
    navigate("/chat/new-chat", { state: { question: text }, replace: true });
  };

  return (
    <Wrapper>
      <Header />
      <img className="img" src={PickL} />
      <TextBox>
        <p className="greeting">
          <span className="text_18_500">반가워요. </span>
          <span className="text_18_700">AI피클</span>
          <span className="text_18_500">입니다.</span>
        </p>

        <p className="text_14_500">건강한 식사, 똑똑한 소비</p>
        <p className="text_14_500">제가 함께 도와드릴게요.</p>
      </TextBox>

      <AnimationBox>
        <motion.div
          className="track"
          animate={{ x: ["-100%", "0%"] }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: "linear",
          }}
        >
          <QuestionCard onClick={() => handleCardClick("요즘 피곤한데 뭐먹으면 좋을까?")}>
            요즘 피곤한데 뭐먹으면 좋을까?
          </QuestionCard>
          <QuestionCard onClick={() => handleCardClick("지금 토마토 비싸?")}>
            지금 토마토 비싸?
          </QuestionCard>
          <QuestionCard onClick={() => handleCardClick("다이어트 코치가 되어줘")}>
            다이어트 코치가 되어줘
          </QuestionCard>
          <QuestionCard onClick={() => handleCardClick("요즘 피곤한데 뭐먹으면 좋을까?")}>
            요즘 피곤한데 뭐먹으면 좋을까?
          </QuestionCard>
          <QuestionCard onClick={() => handleCardClick("지금 토마토 비싸?")}>
            지금 토마토 비싸?
          </QuestionCard>
          <QuestionCard onClick={() => handleCardClick("다이어트 코치가 되어줘")}>
            다이어트 코치가 되어줘
          </QuestionCard>
        </motion.div>

        <motion.div
          className="track"
          animate={{ x: ["0%", "-100%"] }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: "linear",
          }}
        >
          <QuestionCard onClick={() => handleCardClick("비타민 많은 음식 추천해줘")}>
            비타민 많은 음식 추천해줘
          </QuestionCard>
          <QuestionCard onClick={() => handleCardClick("요즘 제철 과일 뭐야?")}>
            요즘 제철 과일 뭐야?
          </QuestionCard>
          <QuestionCard onClick={() => handleCardClick("저녁 메뉴 추천")}>
            저녁 메뉴 추천
          </QuestionCard>
          <QuestionCard onClick={() => handleCardClick("비타민 많은 음식 추천해줘")}>
            비타민 많은 음식 추천해줘
          </QuestionCard>
          <QuestionCard onClick={() => handleCardClick("요즘 제철 과일 뭐야?")}>
            요즘 제철 과일 뭐야?
          </QuestionCard>
          <QuestionCard onClick={() => handleCardClick("저녁 메뉴 추천")}>
            저녁 메뉴 추천
          </QuestionCard>
        </motion.div>
      </AnimationBox>
      <ChatBtn
        onClick={() => {
          navigate(`/chat/new-chat`);
        }}
      >
        피클이와 채팅하기
      </ChatBtn>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 80px;
  height: auto;

  .img {
    margin-top: 80px;
    margin-bottom: 20px;
    height: 250px;
  }
`;

const TextBox = styled.div`
  text-align: center;

  .greeting {
    margin-bottom: 10px;
  }

  .text_18_500 {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 10px;
  }
  .text_18_700 {
    font-size: 18px;
    font-weight: 700;
    color: #38b628;
    margin-bottom: 10px;
  }
  .text_14_500 {
    font-size: 14px;
    font-weight: 500;
    color: #5a5b6a;
  }
`;

const AnimationBox = styled.div`
  overflow: hidden;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 40px 0;

  .track {
    display: flex;
    gap: 15px;
    white-space: nowrap;
  }
`;

const QuestionCard = styled.div`
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 500;
  background-color: #eaeaed;
  border-radius: 30px;
  cursor: pointer;
  user-select: none;
`;

const ChatBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1c1b1a;
  color: #fff;
  border-radius: 10px;
  width: 90%;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 50px;
`;
