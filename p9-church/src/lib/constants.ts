export const CHURCH_NAME = "혜성교회";
export const CHURCH_NAME_EN = "Hyesung Presbyterian Church";
export const CHURCH_DESCRIPTION =
  "서울 종로구 혜화동에 위치한 대한예수교장로회 혜성교회입니다.";

export const NAV_ITEMS = [
  { label: "홈", href: "/" },
  { label: "담임목사 소개", href: "/about" },
  { label: "다음세대와 사역", href: "/departments" },
  { label: "예배 안내", href: "/contact" },
] as const;

export const HERO_SECTION = {
  backgroundImage: "/hyesung/hero/main-hero.jpg",
  primaryLogo: "/hyesung/logos/hyesung-logo.png",
  secondaryLogo: "/hyesung/logos/umh-logo.png",
  eyebrow: "Hysung Presbyterian Church",
  summary:
    "혜화동의 일상 한가운데에서 예배와 말씀, 다음 세대 사역으로 하나님 나라를 증언하는 공동체입니다.",
  actions: [
    {
      label: "온라인 헌금 안내",
      href: "/contact#offering-guide",
      external: false,
      tone: "muted" as const,
    },
    {
      label: "온라인 주일예배 드리기",
      href: "http://www.youtube.com/c/%ED%98%9C%EC%84%B1%EA%B5%90%ED%9A%8C/live",
      external: true,
      tone: "light" as const,
    },
    {
      label: "온라인 새가족 등록",
      href: "https://docs.google.com/forms/d/13uzgiiQfF9Wx9czZNoxQf0JEMuGErYNvnfe2qT_Oqz4/edit",
      external: true,
      tone: "light" as const,
    },
  ],
} as const;

export const SOCIAL_LINKS = [
  {
    name: "YouTube",
    href: "https://www.youtube.com/@hyesung-church",
    icon: "youtube" as const,
  },
  {
    name: "KakaoTalk",
    href: "http://pf.kakao.com/_xjfxixaxj",
    icon: "message-circle" as const,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/thedisciple_community/",
    icon: "instagram" as const,
  },
] as const;

export const QUICK_LINKS = [
  {
    title: "주일예배",
    subtitle: "Sunday Worship",
    image: "/hyesung/quick-links/sunday-worship.png",
    href: "https://youtube.com/playlist?list=PLKNapzXSFRfc7jrK8cBe19xdbYMmMgKCq",
  },
  {
    title: "금요비전",
    subtitle: "Friday Vision",
    image: "/hyesung/quick-links/friday-vision.png",
    href: "https://youtube.com/playlist?list=PLKNapzXSFRfdaM8crM38RD4DsGZkq1w_h",
  },
  {
    title: "수요예배",
    subtitle: "Wednesday Worship",
    image: "/hyesung/quick-links/wednesday.png",
    href: "https://youtube.com/playlist?list=PLKNapzXSFRfcZnKnC8rAKcs9BZKZ4dNvS",
  },
  {
    title: "새벽기도",
    subtitle: "Early Morning Prayer",
    image: "/hyesung/quick-links/dawn.png",
    href: "https://www.youtube.com/playlist?list=PLKNapzXSFRfejBBeR07yn2y3C0hdBI2Vt",
  },
] as const;

export const FEATURED_MEDIA = [
  {
    title: "주일 설교",
    description: "세상을 살아가는 하나님의 사람들",
    image: "/hyesung/graphics/sermon-sunday.jpg",
    href: "https://www.youtube.com/watch?v=w9ActLmzdNY",
  },
  {
    title: "주일 찬양팀",
    description: "찬양 중에 눈을 들어(Hosanna)",
    image: "/hyesung/graphics/praise-team.jpg",
    href: "https://www.youtube.com/watch?v=CsWUvobeh78",
  },
  {
    title: "할렐루야 찬양대",
    description: "26.3.29 할렐루야 찬양대",
    image: "/hyesung/graphics/hallelujah-choir.jpg",
    href: "https://www.youtube.com/watch?v=n2X-QsB2Hcw",
  },
  {
    title: "사역 스케치",
    description: "한 주간의 사역을 짧게 돌아봅니다.",
    image: "/hyesung/graphics/ministry-sketch.jpg",
    href: "https://www.youtube.com/watch?v=t-8AJGXT5k8",
  },
  {
    title: "온라인 주일 예배",
    description: "주일 현장 예배를 온라인으로 함께 드립니다.",
    image: "/hyesung/graphics/online-worship.jpg",
    href: "https://www.youtube.com/watch?v=NE9uAbP-rU4",
  },
  {
    title: "언더우드기념관 준공기념영상",
    description: "준공감사예배의 순간을 다시 봅니다.",
    image: "/hyesung/graphics/underwood-dedication.jpg",
    href: "https://www.youtube.com/watch?v=7mZQo8ubadc",
  },
  {
    title: "한아름유치원 홍보 영상",
    description: "다음 세대 사역의 일상을 소개합니다.",
    image: "/hyesung/graphics/hanarum-promo.jpg",
    href: "https://www.youtube.com/watch?v=Oi1ATkcb5eM",
  },
  {
    title: "이야기학교 홍보 영상",
    description: "주중학교의 교육 환경을 만나보세요.",
    image: "/hyesung/graphics/storyschool-promo.jpg",
    href: "https://www.youtube.com/watch?v=irLdbUi1Q1o",
  },
  {
    title: "정명호 담임목사 20주년 기념 영상",
    description: "공동체의 시간을 함께 돌아보는 기록입니다.",
    image: "/hyesung/graphics/pastor-anniversary.jpg",
    href: "https://www.youtube.com/watch?v=GxT3sRtOqN4",
  },
] as const;

export const WORSHIP_GUIDE = {
  image: "/hyesung/graphics/worship-board.png",
  note: "모든 예배는 언더우드기념관에서 드려집니다.",
} as const;

export const DEPARTMENTS = [
  {
    name: "영아부",
    age: "0-4세",
    description: "가장 어린 아이들과 가정이 함께 예배의 기쁨을 배우는 공동체입니다.",
    image: "/hyesung/departments/infants.png",
    href: "https://www.youtube.com/channel/UC3Gk-YvE7mDXJvNzF6OCgHg",
  },
  {
    name: "유치부",
    age: "5-7세",
    description: "놀이와 찬양, 말씀 묵상을 통해 복음을 가까이 배우는 부서입니다.",
    image: "/hyesung/departments/kindergarten.png",
    href: "https://www.youtube.com/channel/UCzVLlndEKuiKCByQ50YEDFg",
  },
  {
    name: "유년부",
    age: "1-3학년",
    description: "말씀의 기초를 세우며 친구들과 함께 자라는 초등 저학년 공동체입니다.",
    image: "/hyesung/departments/children-younger.png",
    href: "https://www.youtube.com/channel/UC6V98rMQFdhALTzfqzYOImA",
  },
  {
    name: "초등부",
    age: "4-6학년",
    description: "예배와 훈련을 통해 스스로 믿음을 고백하도록 돕는 초등 고학년 부서입니다.",
    image: "/hyesung/departments/children-older.png",
    href: "https://www.youtube.com/channel/UCgnXGDGf0t_BsnBPIW4KVcg",
  },
  {
    name: "청소년부",
    age: "중1-고3",
    description: "학업과 일상 속에서 복음으로 살아가는 제자를 세우는 청소년 공동체입니다.",
    image: "/hyesung/departments/youth.png",
    href: "https://www.youtube.com/channel/UC_wVd36NaiBT6IG5WIs4VuQ",
  },
  {
    name: "청년교구",
    age: "청년",
    description: "도심의 삶 속에서 예배와 선교의 리듬을 함께 만들어 가는 청년 공동체입니다.",
    image: "/hyesung/departments/young-adults.png",
    href: "https://www.youtube.com/c/%ED%98%9C%EC%84%B1%EA%B5%90%ED%9A%8C",
  },
] as const;

export const AFFILIATES = [
  {
    name: "한아름유치원",
    image: "/hyesung/departments/hanarum.png",
    href: "http://hanarum.kidis.co.kr/",
  },
  {
    name: "러빙",
    image: "/hyesung/departments/loving.png",
    href: "/departments#affiliates",
  },
  {
    name: "이야기학교",
    image: "/hyesung/departments/storyschool.png",
    href: "http://storyschool.net/",
  },
] as const;

export const MINISTRY_BANNER = {
  image: "/hyesung/graphics/ministry-banner.gif",
  alt: "혜성교회 사역 스케치 배너",
} as const;

export const STAFF_MEMBERS = [
  {
    name: "정 명 호 목사",
    role: "담임",
    description: "복음과 예배, 도심 선교의 방향을 함께 세우는 혜성교회의 담임목사입니다.",
    detail: "정명호 담임목사 20주년 기념 페이지 운영",
    image: "/hyesung/staff/chung-myungho.jpg",
    href: "https://www.hyesung.or.kr/myunghochung",
  },
  {
    name: "박 광 옥 목사",
    role: "원로",
    description: "오랜 시간 공동체를 세워 온 원로목사입니다.",
    detail: "공동체의 뿌리를 기억하게 하는 원로 사역",
    image: "/hyesung/staff/park-kwangok.jpg",
    href: undefined,
  },
  {
    name: "원 영 섭 목사",
    role: "전임 / 1교구",
    description: "시니어 공동체와 훈련반 총괄을 맡고 있습니다.",
    detail: "예배위원회, 훈련반 총괄",
    image: "/hyesung/staff/won-youngsup.jpg",
    href: undefined,
  },
  {
    name: "김 종 철 목사",
    role: "전임 / 2교구",
    description: "장년 사역과 Missional Community 사역을 섬깁니다.",
    detail: "사회봉사위원회, 세례반, 성장반, 기도학교",
    image: "/hyesung/staff/kim-jongchul.png",
    href: undefined,
  },
  {
    name: "김 영 선 목사",
    role: "전임 / 3교구",
    description: "장년 사역과 말씀 훈련을 담당합니다.",
    detail: "서무위원회, 증인반, 교리학교",
    image: "/hyesung/staff/kim-youngsun.jpeg",
    href: undefined,
  },
  {
    name: "유 재 경 목사",
    role: "전임 / 4교구",
    description: "신혼 공동체와 행정 사역을 함께 맡고 있습니다.",
    detail: "Ministry Facilitator, 증인반, 비전반",
    image: "/hyesung/staff/yoo-jaekyung.png",
    href: undefined,
  },
  {
    name: "박 정 욱 선교사",
    role: "전임 / 5교구",
    description: "청년 공동체와 전도·선교 사역을 섬깁니다.",
    detail: "Gospel Catalyst, 복음반, 선교학교",
    image: "/hyesung/staff/park-jungwook.jpeg",
    href: undefined,
  },
  {
    name: "문 소 라 전도사",
    role: "전임 / 청소년부",
    description: "청소년부와 교육 훈련 사역을 담당하고 있습니다.",
    detail: "교육위원회, 교사대학, 성경통독학교",
    image: "/hyesung/staff/moon-sora.jpeg",
    href: undefined,
  },
] as const;

export const PASTOR_PROFILE = {
  image: "/hyesung/staff/chung-myungho.jpg",
  title: "정명호 목사",
  subtitle: "담임목사",
  href: "https://www.hyesung.or.kr/myunghochung",
  introduction: [
    "혜성교회는 서울 혜화동의 일상 속에서 복음을 분명하게 전하고, 바른 예배와 훈련을 통해 성도를 세워 가는 공동체입니다.",
    "정명호 담임목사는 예배의 중심성과 제자훈련의 깊이를 함께 붙드는 목회를 통해, 도심 교회가 세상 속에서 어떻게 사랑과 진리를 드러낼지 꾸준히 질문해 왔습니다.",
    "교회와 다음 세대, 지역과 선교를 하나의 이야기로 엮어 가는 혜성교회의 방향을 담임목사 소개 페이지와 최근 메시지에서 계속 확인할 수 있습니다.",
  ],
  focusPoints: [
    "신앙은 하나님과 관계 맺기입니다",
    "삶의 어려움과 고난을 지나가는 이들에게 주는 하나님의 손길",
    "개혁주의 신학의 바른 예배와 예식의 표준을 제시하다",
    "그리스도 교회의 공적 고백",
    "그리스도 교회의 공적 간구",
    "십자가와 부활의 복음",
  ],
} as const;

export const ANNIVERSARY = {
  title: "65주년 기념 책 & 화보집",
  image: "/hyesung/graphics/anniversary-banner.png",
  href: "https://drive.google.com/drive/folders/1sKgz6DNBzHhuKqrUROrNfqwC-errJ6gJ?usp=sharing",
} as const;

export const CONTACT_INFO = {
  addressPrimary: "본관 (주중학교) 서울 종로구 혜화로6길 80",
  addressSecondary: "언더우드기념관 (교회) 서울 종로구 혜화로 74",
  phone: "02-763-0191",
  phoneAlt: "02-762-0903",
  fax: "02-765-1024",
  mapLinks: [
    {
      label: "본관 길찾기",
      href: "https://www.google.com/maps/search/?api=1&query=%EC%84%9C%EC%9A%B8+%EC%A2%85%EB%A1%9C%EA%B5%AC+%ED%98%9C%ED%99%94%EB%A1%9C6%EA%B8%B8+80",
    },
    {
      label: "언더우드기념관 길찾기",
      href: "https://www.google.com/maps/search/?api=1&query=%EC%84%9C%EC%9A%B8+%EC%A2%85%EB%A1%9C%EA%B5%AC+%ED%98%9C%ED%99%94%EB%A1%9C+74",
    },
  ],
} as const;

export const CONTACT_LINKS = [
  {
    title: "온라인 주일예배 드리기",
    description: "실시간 예배와 최근 예배 영상을 바로 연결합니다.",
    href: "http://www.youtube.com/c/%ED%98%9C%EC%84%B1%EA%B5%90%ED%9A%8C/live",
  },
  {
    title: "온라인 새가족 등록",
    description: "처음 방문하신 분들을 위한 등록 폼입니다.",
    href: "https://docs.google.com/forms/d/13uzgiiQfF9Wx9czZNoxQf0JEMuGErYNvnfe2qT_Oqz4/edit",
  },
  {
    title: "2025 기부금 영수증 발급",
    description: "기부금 영수증 발급 시스템으로 이동합니다.",
    href: "https://ch2ch.or.kr/onLine",
  },
  {
    title: "정명호 담임목사 소개",
    description: "목회 철학과 최근 글을 확인할 수 있습니다.",
    href: "https://www.hyesung.or.kr/myunghochung",
  },
] as const;

export const OFFERING_GUIDE = {
  title: "온라인 헌금 안내",
  description:
    "홈 화면의 안내 버튼은 원본 사이트에서 팝업 안내로 제공됩니다. 이 구현에서는 문의와 연결 동선을 유지하기 위해 교회 연락처와 카카오채널을 함께 안내합니다.",
  bullets: [
    "헌금 및 입금 문의는 교회 사무실 전화로 가장 빠르게 안내받을 수 있습니다.",
    "카카오채널을 통해 새가족 등록, 예배 참여, 온라인 헌금 안내를 함께 문의할 수 있습니다.",
    "기부금 영수증 발급은 별도의 외부 시스템에서 처리됩니다.",
  ],
} as const;
