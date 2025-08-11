import useHeader from "../../shared/hooks/useHeader";

export default function MyHistoryPage() {
  useHeader({
    title: "AI피클히스토리",
    showBack: true,
  });

  return <p>MyHistoryPage</p>;
}
