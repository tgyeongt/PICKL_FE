import useHeader from "../../shared/hooks/useHeader";

export default function MyRecipesPage() {
  useHeader({
    title: "찜한 레시피 목록",
    showBack: true,
  });

  return <p>MyRecipesPage</p>;
}
