import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Swiper from "swiper";
import { Autoplay } from "swiper/modules";
import "swiper/swiper-bundle.css";
import SeasonalCard from "./SeasonalCard";
import leftArrow from "@icon/home/arrow_left.svg";
import rightArrow from "@icon/home/arrow_right.svg";
import { APIService } from "../../../shared/lib/api";
import LoadingSpinner from "../../../shared/commons/loading/LoadingSpinner";

export default function SeasonalView() {
  const swiperContainerRef = useRef(null);
  const swiperInstanceRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [currentMonth] = useState(now.getMonth() + 1);

  const [seasonalList, setSeasonalList] = useState([]);

  useEffect(() => {
    async function fetchSeasonItems() {
      try {
        const res = await APIService.private.get("/season-items");
        setSeasonalList(res.data);
      } catch (error) {
        console.error("Failed to fetch season items:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSeasonItems();
  }, []);

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

  if (loading) return <LoadingSpinner />;
  const items = seasonalList.filter((item) => item.seasonMonth === currentMonth);

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
            {items.map((item) => (
              <div className="swiper-slide" key={item.id}>
                <SeasonalCard
                  id={item.id}
                  title={item.itemname}
                  description={item.shortDescription}
                  img={item.imageUrl}
                  onClick={() => navigate(`/seasonal/${item.id}`)}
                />
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
  min-height: 600px;
  height: 75vh;
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
