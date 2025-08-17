import { publicAPI } from "../../shared/lib/api";
import styled from "styled-components";
import { motion } from "framer-motion";
import PicklImg from "@image/pickl_motion.png";

export default function StartPage() {
  const handleStart = async () => {
    try {
      const res = await publicAPI.post("/auths/test-login");

      if (res?.success) {
        const { accessToken, refreshToken } = res.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        window.location.reload();
      } else {
        alert("로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("로그인 요청 중 오류:", error);
    }
  };

  return (
    <Wrapper>
      <TextWrapper>
        <p className="slogan">매일의 식탁에</p>
        <span className="slogan">계절을 담다, </span>
        <span className="pickl">피클</span>
      </TextWrapper>

      <MotionImg
        src={PicklImg}
        animate={{ y: [0, -20, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
      />

      <LoginBtn onClick={handleStart}>테스트 계정으로 로그인하기</LoginBtn>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 130px 30px 30px 30px;
  background-color: #58d848;
  height: 100vh;
  max-width: 390px;
  position: relative;
`;

const TextWrapper = styled.div`
  .slogan {
    color: #bcffae;
    font-size: 38px;
    font-weight: 600;
    line-height: normal;
  }

  .pickl {
    color: #fff;
    font-size: 38px;
    font-weight: 700;
    line-height: normal;
  }
`;

const MotionImg = styled(motion.img)`
  position: absolute;
  right: 0;
  bottom: 150px;
`;

const LoginBtn = styled.button`
  background-color: #252525;
  color: #fff;
  width: 100%;
  text-align: center;
  padding: 15px 0;
  font-size: 16px;
  font-weight: 700;
  border-radius: 10px;
  cursor: pointer;
`;
