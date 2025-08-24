import styled from "styled-components";
import icon_404 from "@icon/common/404.svg";

export default function NotFound() {
  return (
    <Wrapper>
      <img src={icon_404} alt="404" />
      <p className="title">준비중입니다</p>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 10vh;

  img {
    width: 30px;
    height: 30px;
  }

  .title {
    font-size: 20px;
    font-weight: 700;
    margin: 10px 0;
  }
`;
