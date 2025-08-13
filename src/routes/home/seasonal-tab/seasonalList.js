const seasonalList = [
  {
    id: 1,
    month: 8,
    title: "수박",
    label: "비타민C",
    calorie: "100g / 30kcal",
    img: "/src/shared/assets/icon/home/watermelon.png",
    description: "시원한 과즙으로 더위를 날리는 여름 대표 과일, 수박을 즐겨보세요!",
    questions: [
      {
        q: "고르는 방법",
        a: "껍질이 단단하고 줄무늬가 선명하며, 두드렸을 때 청명한 소리가 나는 것이 좋아요!",
      },
      { q: "보관 방법", a: "통째로는 서늘한 곳에 두고, 자른 수박은 랩에 싸서 냉장 보관하세요." },
      { q: "손질 방법", a: "깨끗이 씻은 후 먹기 좋은 크기로 잘라 씨를 제거하세요." },
      { q: "꿀팁", a: "차갑게 먹으면 더 달고 시원합니다. 얼려서 수박빙수로 활용해도 좋아요!" },
    ],
    recipes: [
      {
        id: 1,
        title: "수박 화채",
        link: "/seasonal/1/1",
        questions: [
          { q: "준비물", a: "수박, 사이다, 얼음, 과일(포도, 키위 등), 큰 볼" },
          {
            q: "조리방법",
            a: "수박을 잘라 과육을 떠내고, 다른 과일과 함께 볼에 담아 사이다와 얼음을 넣어주세요.",
          },
          { q: "꿀팁", a: "레몬즙을 살짝 넣으면 상큼함이 배가됩니다." },
        ],
      },
      {
        id: 2,
        title: "수박 스무디",
        link: "/seasonal/1/2",
        questions: [
          { q: "준비물", a: "수박, 얼음, 꿀(선택), 블렌더" },
          { q: "조리방법", a: "씨를 제거한 수박과 얼음을 블렌더에 넣고 곱게 갈아줍니다." },
          { q: "꿀팁", a: "우유를 약간 넣으면 부드러운 맛을 즐길 수 있습니다." },
        ],
      },
    ],
  },
  {
    id: 2,
    month: 8,
    title: "망고",
    label: "비타민A",
    calorie: "100g / 60kcal",
    img: "/src/shared/assets/icon/home/watermelon.png",
    description: "부드럽고 진한 달콤함을 가득 담은 제철 과일, 망고가 제맛이에요",
    questions: [
      {
        q: "고르는 방법",
        a: "겉이 매끄럽고 향이 진하며 살짝 눌렀을 때 부드러운 것이 잘 익은 망고입니다.",
      },
      { q: "보관 방법", a: "덜 익은 망고는 상온에서 숙성하고, 익은 것은 냉장 보관하세요." },
      { q: "손질 방법", a: "씨를 중심으로 양쪽을 잘라서 격자무늬를 내고 껍질을 뒤집어 드세요." },
      { q: "꿀팁", a: "요거트나 샐러드에 넣으면 풍미가 배가됩니다." },
    ],
    recipes: [
      { id: 1, title: "망고 요거트 파르페", link: "/seasonal/2/1" },
      { id: 2, title: "망고 라씨", link: "/seasonal/2/2" },
    ],
  },
  {
    id: 3,
    month: 8,
    title: "문어",
    label: "단백질",
    calorie: "100g / 82kcal",
    img: "/src/shared/assets/icon/home/watermelon.png",
    description: "쫄깃한 식감으로 입맛을 사로잡는 제철 해산물, 문어를 챙겨보세요",
    questions: [
      { q: "고르는 방법", a: "살이 단단하고 빨판이 힘있게 붙는 것이 신선한 문어입니다." },
      { q: "보관 방법", a: "손질 후 밀폐해 냉장 보관하거나 장기 보관 시 냉동하세요." },
      { q: "손질 방법", a: "소금으로 문질러 미끈거림을 제거하고 깨끗이 씻으세요." },
      { q: "꿀팁", a: "삶을 때 무를 넣으면 잡내가 줄어듭니다." },
    ],
    recipes: [
      { id: 1, title: "문어 숙회", link: "/seasonal/3/1" },
      { id: 2, title: "문어 샐러드", link: "/seasonal/3/2" },
    ],
  },
  {
    id: 4,
    month: 8,
    title: "옥수수",
    label: "탄수화물",
    calorie: "100g / 96kcal",
    img: "/src/shared/assets/icon/home/watermelon.png",
    description: "부드럽고 진한 달콤함을 가득 담은 옥수수가 제맛이에요.",
    questions: [
      {
        q: "고르는 방법",
        a: "겉껍질이 축축하며 선명한 연녹색, 수염이 갈색이고 알맹이가 촘촘한 것이 좋아요!",
      },
      { q: "보관 방법", a: "껍질째로 신문지에 싸서 냉장 보관, 가능한 빨리 섭취하세요." },
      { q: "손질 방법", a: "씨눈 부분에 영양이 많으니 칼 대신 손으로 떼는 것을 추천합니다." },
      { q: "꿀팁", a: "전자레인지로 5분 조리하면 삶지 않아도 맛있게 먹을 수 있습니다." },
    ],
    recipes: [
      { id: 1, title: "통옥수수찜", link: "/seasonal/4/1" },
      { id: 2, title: "콘 샐러드", link: "/seasonal/4/2" },
    ],
  },
  {
    id: 5,
    month: 7,
    title: "복숭아",
    label: "비타민C",
    calorie: "100g / 39kcal",
    img: "/src/shared/assets/icon/home/watermelon.png",
    description: "달콤하고 부드러운 과즙이 가득한 여름 제철 과일, 복숭아를 맛보세요!",
    questions: [
      {
        q: "고르는 방법",
        a: "향이 진하고 보송보송하며, 손으로 살짝 눌렀을 때 탄력이 있는 것이 좋아요.",
      },
      { q: "보관 방법", a: "상온에서 숙성 후 먹기 직전에 냉장 보관하세요." },
      { q: "손질 방법", a: "껍질째 먹거나 껍질을 벗겨 드세요. 껍질에 영양이 많습니다." },
      { q: "꿀팁", a: "껍질이 거슬리면 뜨거운 물에 10초 담갔다가 벗기면 쉽게 벗겨집니다." },
    ],
    recipes: [
      { id: 1, title: "복숭아 아이스티", link: "/seasonal/5/1" },
      { id: 2, title: "복숭아 타르트", link: "/seasonal/5/2" },
    ],
  },
  {
    id: 6,
    month: 7,
    title: "가지",
    label: "식이섬유",
    calorie: "100g / 25kcal",
    img: "/src/shared/assets/icon/home/watermelon.png",
    description: "부드럽고 은은한 맛의 여름 채소, 다양한 요리에 활용해보세요.",
    questions: [
      { q: "고르는 방법", a: "겉이 윤기 있고 보랏빛이 선명하며 단단한 것이 신선합니다." },
      { q: "보관 방법", a: "신문지에 싸서 서늘한 곳이나 냉장 보관하세요." },
      { q: "손질 방법", a: "꼭지를 잘라내고 필요에 따라 껍질을 벗기거나 그대로 사용하세요." },
      { q: "꿀팁", a: "기름을 잘 흡수하니 볶을 때 기름 양을 조절하세요." },
    ],
    recipes: [
      { id: 1, title: "가지나물", link: "/seasonal/6/1" },
      { id: 2, title: "가지 그라탱", link: "/seasonal/6/2" },
    ],
  },
];

export default seasonalList;
