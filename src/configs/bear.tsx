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
    md: [
      {
        id: "exp-opark",
        title: "(주)오파크",
        file: "markdown/exp-opark.md",
        icon: "i-fa-solid:rocket",
        excerpt: "2026~ 풀스택. TOONT-M 플랫폼 개발과 TOONT 쇼핑몰 리뉴얼 담당..."
      },
      {
        id: "exp-army",
        title: "M/W 운용병",
        file: "markdown/exp-army.md",
        icon: "i-fa-solid:satellite-dish",
        excerpt: "2024~2025. 국가지휘통신사령부 53대대 마이크로웨이브 통신 운용..."
      },
      {
        id: "exp-jusung",
        title: "주성엔지니어링",
        file: "markdown/exp-jusung.md",
        icon: "i-fa-solid:industry",
        excerpt: "2020~2021. R&D센터 정보기술팀 ERP/PLM 관리자 및 자동화 개발..."
      }
    ]
  }
];

export default bear;
