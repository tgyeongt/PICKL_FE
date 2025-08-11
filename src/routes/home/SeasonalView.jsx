import { useEffect, useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Swiper from "swiper";
import { Autoplay } from "swiper/modules";
import "swiper/swiper-bundle.css";
import SeasonalCard from "./SeasonalCard";
import leftArrow from "@icon/home/arrow_left.svg";
import rightArrow from "@icon/home/arrow_right.svg";

export default function SeasonalView() {
  const swiperContainerRef = useRef(null);
  const swiperInstanceRef = useRef(null);
  const navigate = useNavigate();

  const seasonalList = [
    {
      title: "수박",
      img: "/src/shared/assets/icon/home/watermelon.png",
      description: "시원한 과즙으로 더위를 날리는 \n 여름 대표 과일, 수박을 즐겨보세요!",
    },
    {
      title: "망고",
      img: "/src/shared/assets/icon/home/watermelon.png",
      description: "부드럽고 진한 달콤함을 가득 담은 제철 과일, 망고가 제맛이에요",
    },
    {
      title: "문어",
      img: "/src/shared/assets/icon/home/watermelon.png",
      description: "쫄깃한 식감으로 입맛을 사로잡는 제철 해산물, 문어를 챙겨보세요",
    },
    {
      title: "옥수수",
      img: "/src/shared/assets/icon/home/watermelon.png",
      description: "부드럽고 진한 달콤함을 가득 담은 옥수수가 제맛이에요. ",
    },
  ];

  useEffect(() => {
    if (!swiperContainerRef.current) return;

    swiperInstanceRef.current?.destroy();

    const timeout = setTimeout(() => {
      if (!swiperContainerRef.current) return;

      const swiperInstance = new Swiper(swiperContainerRef.current, {
        modules: [Autoplay],
        loop: true,
        centeredSlides: true,
        slideToClickedSlide: true,
        effect: "slide",
        spaceBetween: 20,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
        },
        speed: 700,
      });

      swiperInstanceRef.current = swiperInstance;
    }, 0);

    return () => {
      clearTimeout(timeout);
      swiperInstanceRef.current?.destroy();
    };
  }, [seasonalList]);

  return (
    <Wrapper>
      <TextBox>
        <p className="subtitle">여름의 신선함을 담았어요</p>
        <p className="title">이달의 Pick</p>
      </TextBox>
      <AnimationBox>
        <ArrowButton $left onClick={() => swiperInstanceRef.current?.slidePrev()}>
          <img src={leftArrow} alt="left" />
        </ArrowButton>
        <SwiperWrapper className="swiper" ref={swiperContainerRef}>
          <div className="swiper-wrapper">
            {seasonalList.map((item, i) => (
              <div className="swiper-slide" key={`${item.title}-${i}`}>
                <SeasonalCard {...item} />
              </div>
            ))}
          </div>
        </SwiperWrapper>
        <ArrowButton onClick={() => swiperInstanceRef.current?.slideNext()}>
          <img src={rightArrow} alt="right" />
        </ArrowButton>
      </AnimationBox>
      <ViewAllText onClick={() => navigate("/monthly-pick")}>전체보기</ViewAllText>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  text-align: center;
`;

const TextBox = styled.div`
  text-align: center;
  padding-top: 50px;

  .subtitle {
    font-size: 14px;
    color: #adadaf;
    font-weight: 500;
  }

  .title {
    font-size: 30px;
    color: #38b628;
    font-weight: 700;
  }
`;

const AnimationBox = styled.div`
  position: relative;
  width: 370px;
  height: px;
  overflow: hidden;
  margin: 26px auto 0;
`;

const ArrowButton = styled.button`
  position: absolute;
  top: 50%;
  ${(props) => (props.$left ? "left: 5px" : "right: 28px")};
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  z-index: 10;
`;

const SwiperWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: visible;

  .swiper-wrapper {
    display: flex;
    padding-left: 65px;
    align-items: center;
  }
`;

const ViewAllText = styled.p`
  margin-top: 27px;
  font-size: 14px;
  color: #5a5b6a;
  text-decoration: underline;
  cursor: pointer;
`;
