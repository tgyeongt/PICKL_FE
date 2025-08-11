import useHeader from "../../shared/hooks/useHeader";

export default function MyIngredientsPage() {
  useHeader({
    title: "찜한 식재료 목록",
    showBack: true,
  });

  return <p>MyIngredientsPage</p>;
}
