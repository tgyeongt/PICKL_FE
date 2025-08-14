import CheaperCard from "./CheaperCard";

export default function TraditionalMarket({ selected }) {
  const dummyData = [
    {
      name: "배추",
      weight: "1포기",
      marketPrice: "3,500 원",
      martPrice: "4,200 원",
    },
    {
      name: "무",
      weight: "1개",
      marketPrice: "1,200 원",
      martPrice: "1,800 원",
    },
    {
      name: "시금치",
      weight: "300g",
      marketPrice: "2,000 원",
      martPrice: "2,700 원",
    },
    {
      name: "파프리카",
      weight: "2개",
      marketPrice: "3,800 원",
      martPrice: "4,500 원",
    },
  ];

  return (
    <>
      {dummyData.map((item, idx) => (
        <CheaperCard key={idx} selected={selected} {...item} />
      ))}
    </>
  );
}
