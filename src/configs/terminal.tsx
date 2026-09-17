import type { TerminalData } from "~/types";

const terminal: TerminalData[] = [
  {
    id: "about",
    title: "about",
    type: "folder",
    children: [
      {
        id: "about-bio",
        title: "bio.txt",
        type: "file",
        content: (
          <div className="py-1">
            <div>
              안녕하세요, 강동현입니다. Rust와 React Native를 사용해 직접 웹/앱을 개발하고
              배포 및 운영하는 풀스택 개발자입니다. 현재 개인사업자로 외주 개발과 자체
              제품 개발을 병행하고 있으며 Rust 라이브러리를 개발하고 오픈소스에 기여하는
              데 열정을 갖고 있습니다.
            </div>
          </div>
        )
      },
      {
        id: "about-interests",
        title: "interests.txt",
        type: "file",
        content:
          "Rust Backend Development / Full Stack Engineering / Security & Performance Optimization"
      },
      {
        id: "about-status",
        title: "status.txt",
        type: "file",
        content:
          "특성화고에서 개발 기초를 다졌고, 직장에서의 대규모 DB 운영과 스타트업 풀스택 개발 경험을 거쳐, 현재는 개인사업자로 외주 개발과 자체 서비스 개발·운영을 병행하고 있습니다."
      },
      {
        id: "about-contact",
        title: "contact.txt",
        type: "file",
        content: (
          <ul className="list-disc ml-6">
            <li>
              Email:{" "}
              <a
                className="text-blue-300"
                href="mailto:kang3171611@naver.com"
                target="_blank"
                rel="noreferrer"
              >
                kang3171611@naver.com
              </a>
            </li>
            <li>
              Github:{" "}
              <a
                className="text-blue-300"
                href="https://github.com/kang1027"
                target="_blank"
                rel="noreferrer"
              >
                @kang1027
              </a>
            </li>
            <li>
              Instagram:{" "}
              <a
                className="text-blue-300"
                href="https://instagram.com/donghyeon179"
                target="_blank"
                rel="noreferrer"
              >
                @donghyeon179
              </a>
            </li>
            <li>Location: Gyeonggi-do, Korea</li>
          </ul>
        )
      }
    ]
  },
  {
    id: "about-dream",
    title: "my-dream.rs",
    type: "file",
    content: (
      <div className="py-1">
        <div>
          <span className="text-yellow-400">loop</span> <span>{"{"}</span>
        </div>
        <div>
          <span className="text-blue-400 ml-9">create_awesome_service</span>();
        </div>
        <div>
          <span className="text-blue-400 ml-9">deploy_to_production</span>();
        </div>
        <div>
          <span className="text-blue-400 ml-9">user_satisfaction</span>
          <span className="text-yellow-400">++</span>;
        </div>
        <div>
          <span>{"}"}</span>
        </div>
      </div>
    )
  }
];

export default terminal;
