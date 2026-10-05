// 글마다 공유 미리보기(og:image) 카드를 만든다.
// 블로그 다크 테마의 수묵 레일(scripts/og/card-bg.png) 위에 갈래·제목·요약·날짜를 얹어 1200x630 PNG로 굽는다.
import { promises as fs } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
import satori from "satori";

const require = createRequire(import.meta.url);
const BACKGROUND_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "og/card-bg.png"
);

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

const COLOR = {
  title: "#f2f2f2",
  muted: "#9e9e9e",
  faint: "#8c8c8c",
  accent: "#db6155"
};

let wasmReady;
function ensureWasm() {
  wasmReady ??= fs
    .readFile(require.resolve("@resvg/resvg-wasm/index_bg.wasm"))
    .then((wasm) => initWasm(wasm));
  return wasmReady;
}

let backgroundDataUri;
async function background() {
  backgroundDataUri ??= `data:image/png;base64,${(await fs.readFile(BACKGROUND_PATH)).toString("base64")}`;
  return backgroundDataUri;
}

// satori는 woff2를 못 읽는다. 구글 폰트는 text 파라미터를 주면 그 글자만 담은 TTF를 돌려줘서
// 한글 폰트 전체를 레포에 넣지 않아도 된다.
async function loadGoogleFont(family, weight, text) {
  const uniqueText = [...new Set(text)].join("");
  const cssUrl = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(uniqueText)}`;
  const css = await (await fetch(cssUrl)).text();
  const source = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/);
  if (!source) throw new Error(`${family} ${weight} 폰트 주소를 찾지 못함`);
  const response = await fetch(source[1]);
  if (!response.ok)
    throw new Error(`${family} ${weight} 폰트 다운로드 실패 (${response.status})`);
  return response.arrayBuffer();
}

function titleFontSize(title) {
  if (title.length <= 18) return 68;
  if (title.length <= 32) return 60;
  if (title.length <= 48) return 54;
  return 46;
}

// satori는 빈 배열 children도 여러 자식으로 보고 display 지정을 요구해서, 자식이 없으면 아예 뺀다.
function el(type, style, children) {
  const hasChildren = Array.isArray(children)
    ? children.length > 0
    : children !== undefined;
  return { type, props: hasChildren ? { style, children } : { style } };
}

export async function renderPostCard({
  title,
  summary,
  groupTitle,
  dateLabel,
  readingLabel
}) {
  const footerLeft = `${dateLabel} · ${readingLabel}`;
  const footerRight = "kang1027.com · 견현사제";
  const [titleFont, bodyFont, bg] = await Promise.all([
    loadGoogleFont("Noto Serif KR", 900, title),
    loadGoogleFont(
      "Noto Sans KR",
      400,
      `${groupTitle}${summary}${footerLeft}${footerRight}…`
    ),
    background(),
    ensureWasm()
  ]);

  const tree = el(
    "div",
    { display: "flex", width: CARD_WIDTH, height: CARD_HEIGHT, position: "relative" },
    [
      {
        type: "img",
        props: {
          src: bg,
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          style: { position: "absolute", top: 0, left: 0 }
        }
      },
      el(
        "div",
        {
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 404,
          right: 72,
          display: "flex",
          flexDirection: "column",
          paddingTop: 72,
          paddingBottom: 60,
          fontFamily: "Noto Sans KR"
        },
        [
          el(
            "div",
            { display: "flex", alignItems: "center", fontSize: 24, color: COLOR.muted },
            [
              el(
                "div",
                { width: 12, height: 12, backgroundColor: COLOR.accent, marginRight: 14 },
                []
              ),
              groupTitle
            ]
          ),
          el(
            "div",
            {
              marginTop: 36,
              fontFamily: "Noto Serif KR",
              fontWeight: 900,
              fontSize: titleFontSize(title),
              lineHeight: 1.22,
              color: COLOR.title,
              display: "block",
              wordBreak: "keep-all",
              lineClamp: 3
            },
            title
          ),
          el(
            "div",
            {
              marginTop: 28,
              fontSize: 28,
              lineHeight: 1.5,
              color: COLOR.muted,
              display: "block",
              wordBreak: "keep-all",
              lineClamp: 2
            },
            summary
          ),
          el("div", { flexGrow: 1 }, []),
          el(
            "div",
            {
              display: "flex",
              justifyContent: "space-between",
              fontSize: 22,
              color: COLOR.faint
            },
            [el("div", {}, footerLeft), el("div", {}, footerRight)]
          )
        ]
      )
    ]
  );

  const svg = await satori(tree, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    fonts: [
      { name: "Noto Serif KR", data: titleFont, weight: 900, style: "normal" },
      { name: "Noto Sans KR", data: bodyFont, weight: 400, style: "normal" }
    ]
  });
  return Buffer.from(
    new Resvg(svg, { fitTo: { mode: "width", value: CARD_WIDTH } }).render().asPng()
  );
}
