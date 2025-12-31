import type { BearData } from "~/types";

const bear: BearData[] = [
  {
    id: "profile",
    title: "Profile",
    icon: "i-fa-solid:user-circle",
    md: [
      {
        id: "about-me",
        title: "About Me",
        file: "markdown/about-me.md",
        icon: "i-fa-solid:user",
        excerpt: "Rust와 React Native로 서비스를 만들고 운영하는 풀스택 개발자입니다..."
      },
      {
        id: "skills",
        title: "Skills & Style",
        file: "markdown/skills.md",
        icon: "i-fa-solid:code",
        excerpt: "다양한 기술 스택을 활용한 실전 프로젝트 경험..."
      }
    ]
  },
  {
    id: "project",
    title: "Projects",
    icon: "i-octicon:repo",
    md: [
      {
        id: "omninews",
        title: "OmniNews",
        file: "markdown/omninews.md",
        icon: "i-fa-solid:newspaper",
        excerpt: "Rust 백엔드와 React Native 프론트엔드를 사용한 뉴스 애그리게이터...",
        link: "https://github.com/Omni-News"
      },
      {
        id: "classicmap",
        title: "ClassicMap",
        file: "markdown/classicmap.md",
        icon: "i-fa-solid:music",
        excerpt:
          "클래식 음악 입문자를 위한 로드맵 서비스. Apple Music, Spotify API 연동...",
        link: "https://github.com/ClassicMap"
      },
      {
        id: "wisefee",
        title: "WISEFEE",
        file: "markdown/wisefee.md",
        icon: "i-fa-solid:recycle",
        excerpt: "친환경 텀블러 공유 서비스. 대학 연합 동아리 프로젝트...",
        link: "https://github.com/WISEFEE/SKLookie_SMU_Wisefee_Server"
      },
      {
        id: "tokenest",
        title: "TokeNest",
        file: "markdown/tokenest.md",
        icon: "i-fa-solid:coins",
        excerpt: "블록체인 기반 원재료 가격 관리 시스템. Klaytn과 Solidity 활용...",
        link: "https://github.com/TokeNest"
      }
    ]
  },
  {
    id: "experience",
    title: "Experience",
    icon: "i-fa-solid:briefcase",
    md: []
  }
];

export default bear;
