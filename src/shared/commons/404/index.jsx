import styled from "styled-components";
import icon_404 from "@icon/common/404.svg";

export default function NotFoundPage() {
  return (
    <Wrapper>
      <img src={icon_404} alt="404" />
      <p className="title">페이지를 찾을 수 없습니다</p>
      <p className="content">죄송합니다. 더 이상 존재하지 않는 페이지입니다.</p>
      <button className="btn">홈으로 이동</button>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 30vh;

  .title {
    font-size: 24px;
    font-weight: 700;
    margin: 5px 0;
  }

  .content {
    font-size: 14px;
    font-weight: 500;
    color: #5a5b6a;
  }

  .btn {
    background-color: #1c1b1a;
    color: white;
    font-size: 14px;
    font-weight: 600;
    padding: 10px 100px;
    border-radius: 10px;
    margin-top: 30px;
  }
`;
