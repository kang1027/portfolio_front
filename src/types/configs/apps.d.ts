export interface AppsData {
  id: string;
  title: string;
  desktop: boolean;
  img: string;
  show?: boolean;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  aspectRatio?: number;
  x?: number;
  y?: number;
  content?: JSX.Element;
  // 모바일 셸에서 GenericAppMobile로 마운트할 때 사용하는 콘텐츠.
  // Desktop 컨테이너 전제(MacWindow 등)인 content를 모바일에 그대로 박지 않도록
  // 명시적으로 분리한다. 이 값이 없는 앱은 모바일에서 자동 라우팅되지 않는다.
  contentMobile?: JSX.Element;
  link?: string;
}
