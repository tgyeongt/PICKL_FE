import useHeader from "../../shared/hooks/useHeader";

export default function Home() {
  useHeader({
    title: "상품 상세",
    showBack: true,
    showHeart: true,
    onHeartClick: ClickMe,
  });

  function ClickMe() {
    alert("찜하기 완료");
  }

  return <p>home</p>;
}
