// 옵시디언 vault의 블로그 폴더를 단일 소스로 삼아 src/content/blog/posts를 재생성한다.
// 사용법: npm run blog:sync  (vault 경로는 OBSIDIAN_BLOG_DIR로 재정의 가능)
//
// 규칙
// - vault의 1뎁스 폴더명 = 갈래(예: "설계와 구현" → dev). 매핑에 없는 폴더는 경고 후 건너뜀.
// - frontmatter `publish: true`인 노트만 발행. 나머지는 초고로 간주.
// - `![[이미지]]` 첨부는 public/blog/<slug>/로 복사하고 표준 마크다운 경로로 재작성.
// - `[[노트]]` 링크는 대상이 발행 노트면 /blog/<slug> 링크, 아니면 일반 텍스트로 변환.
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VAULT_BLOG_DIR =
  process.env.OBSIDIAN_BLOG_DIR ??
  "/Users/kang1027/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian Vault/08 Me/blog";
const VAULT_ROOT = path.resolve(VAULT_BLOG_DIR, "../../..");
const OUT_POSTS_DIR = path.join(REPO_ROOT, "src/content/blog/posts");
const OUT_ASSETS_DIR = path.join(REPO_ROOT, "public/blog");

const GROUP_BY_FOLDER = {
  "설계와 구현": "dev",
  "생각과 질문": "essay",
  "읽기와 보기": "review",
  "견문과 모임": "meetup",
  "해의 회고": "memoir"
};

const DEFAULT_ICON_BY_GROUP = {
  dev: "i-fa-solid:code",
  essay: "i-fa-solid:feather-alt",
  review: "i-fa-solid:book",
  meetup: "i-fa-solid:users",
  memoir: "i-fa-solid:hourglass-half"
};

const ASSET_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".mp4",
  ".mov",
  ".webm"
]);

const warnings = [];

// 옵시디언 properties는 블록 리스트(- 항목)와 인라인 리스트가 섞여서,
// 레포 로더의 단순 파서 대신 둘 다 받는 파서가 필요하다.
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: raw };

  const data = {};
  let currentListKey = null;
  for (const line of match[1].split(/\r?\n/)) {
    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && currentListKey) {
      data[currentListKey].push(stripQuotes(listItem[1]));
      continue;
    }

    const divider = line.indexOf(":");
    if (divider < 1) continue;
    const key = line.slice(0, divider).trim();
    const value = line.slice(divider + 1).trim();
    if (value === "") {
      data[key] = [];
      currentListKey = key;
    } else if (value.startsWith("[") && value.endsWith("]")) {
      data[key] = value.slice(1, -1).split(",").map(stripQuotes).filter(Boolean);
      currentListKey = null;
    } else {
      data[key] = stripQuotes(value);
      currentListKey = null;
    }
  }
  return { data, body: raw.slice(match[0].length) };
}

function stripQuotes(value) {
  return String(value).trim().replace(/^["']|["']$/g, "");
}

function toList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.length > 0) return [value];
  return [];
}

function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-{2,}/g, "-");
}

function sanitizeAssetName(name) {
  const ext = path.extname(name);
  return slugify(path.basename(name, ext)) + ext.toLowerCase();
}

async function walk(dir, { skip = new Set() } = {}) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".") || skip.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full, { skip })));
    else out.push(full);
  }
  return out;
}

// 첨부는 vault 어디에 있어도 basename으로 찾는다 (옵시디언 기본 동작과 동일).
async function buildAssetIndex() {
  const index = new Map();
  const files = await walk(VAULT_ROOT, { skip: new Set([".obsidian", ".trash"]) });
  for (const file of files) {
    if (!ASSET_EXTENSIONS.has(path.extname(file).toLowerCase())) continue;
    const base = path.basename(file);
    if (!index.has(base)) index.set(base, file);
  }
  return index;
}

function firstParagraphSummary(body) {
  for (const block of body.split(/\n{2,}/)) {
    const text = block
      .replace(/^#+\s.*$/gm, "")
      .replace(/!?\[\[[^\]]*\]\]/g, "")
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/[*_`>#-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length > 0) return text.length > 90 ? `${text.slice(0, 90)}…` : text;
  }
  return "";
}

async function resolveDate(data, filePath) {
  for (const key of ["date", "created"]) {
    const value = data[key];
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      return value.slice(0, 10);
    }
  }
  const stat = await fs.stat(filePath);
  const fallback = (stat.birthtime ?? stat.mtime).toISOString().slice(0, 10);
  warnings.push(`${path.basename(filePath)}: date 속성이 없어 파일 생성일(${fallback}) 사용`);
  return fallback;
}

async function transformBody(body, slug, assetIndex, slugByNoteName) {
  // 코드 펜스/인라인 코드 안의 옵시디언 문법은 건드리지 않는다 (홀수 인덱스 = 코드)
  const segments = body.trim().split(/(```[\s\S]*?```|`[^`\n]*`)/g);
  const result = [];

  for (let index = 0; index < segments.length; index++) {
    if (index % 2 === 1) {
      result.push(segments[index]);
      continue;
    }

    let segment = segments[index].replace(/%%[\s\S]*?%%/g, "");

    // 임베드: ![[file.png|300]] → 자산 복사 + 표준 이미지 문법
    const embeds = [...segment.matchAll(/!\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)];
    for (const embed of embeds) {
      const target = embed[1].trim();
      const sourcePath = assetIndex.get(path.basename(target));
      if (!sourcePath) {
        warnings.push(`${slug}: 첨부 "${target}"를 vault에서 찾지 못해 그대로 둠`);
        continue;
      }
      const assetName = sanitizeAssetName(path.basename(target));
      const destDir = path.join(OUT_ASSETS_DIR, slug);
      await fs.mkdir(destDir, { recursive: true });
      await fs.copyFile(sourcePath, path.join(destDir, assetName));
      const markup = ASSET_EXTENSIONS.has(path.extname(assetName)) ? "!" : "";
      segment = segment.replace(embed[0], `${markup}[](/blog/${slug}/${assetName})`);
    }

    // 내부 링크: 발행 글이면 블로그 링크, 아니면 텍스트만 남긴다
    segment = segment.replace(/\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (_, target, alias) => {
      const label = alias?.trim() || target.trim();
      const linkedSlug = slugByNoteName.get(path.basename(target.trim(), ".md"));
      return linkedSlug ? `[${label}](/blog/${linkedSlug})` : label;
    });

    result.push(segment);
  }

  return result.join("");
}

function serializePost(meta, body) {
  const lines = [
    "---",
    `title: "${meta.title}"`,
    `summary: "${meta.summary.replace(/"/g, "'")}"`,
    `date: "${meta.date}"`,
    `group: "${meta.group}"`,
    `tags: [${meta.tags.map((tag) => `"${tag}"`).join(", ")}]`,
    `icon: "${meta.icon}"`
  ];
  if (meta.project) lines.push(`project: "${meta.project}"`);
  if (meta.projectHref) lines.push(`projectHref: "${meta.projectHref}"`);
  lines.push("---", "", body, "");
  return lines.join("\n");
}

async function collectNotes() {
  const notes = [];
  const folders = await fs.readdir(VAULT_BLOG_DIR, { withFileTypes: true });
  for (const folder of folders) {
    if (!folder.isDirectory() || folder.name.startsWith(".")) continue;
    const group = GROUP_BY_FOLDER[folder.name];
    if (!group) {
      warnings.push(`갈래 매핑에 없는 폴더 "${folder.name}" 건너뜀`);
      continue;
    }
    const files = await walk(path.join(VAULT_BLOG_DIR, folder.name));
    for (const file of files) {
      if (path.extname(file) !== ".md") continue;
      const raw = await fs.readFile(file, "utf8");
      const { data, body } = parseFrontmatter(raw);
      notes.push({ file, group, data, body });
    }
  }
  return notes;
}

async function main() {
  await fs.access(VAULT_BLOG_DIR).catch(() => {
    throw new Error(`vault 블로그 폴더가 없음: ${VAULT_BLOG_DIR}`);
  });

  const notes = await collectNotes();
  const published = notes.filter((note) => String(note.data.publish) === "true");
  const drafts = notes.length - published.length;

  const slugByNoteName = new Map();
  for (const note of published) {
    const name = path.basename(note.file, ".md");
    note.slug = typeof note.data.slug === "string" && note.data.slug ? note.data.slug : slugify(name);
    slugByNoteName.set(name, note.slug);
  }

  const seen = new Set();
  for (const note of published) {
    if (seen.has(note.slug)) throw new Error(`slug 중복: "${note.slug}" (${note.file})`);
    seen.add(note.slug);
  }

  const assetIndex = await buildAssetIndex();

  // 전량 재생성 — vault가 단일 소스
  await fs.mkdir(OUT_POSTS_DIR, { recursive: true });
  for (const stale of await fs.readdir(OUT_POSTS_DIR)) {
    if (stale.endsWith(".md")) await fs.rm(path.join(OUT_POSTS_DIR, stale));
  }

  for (const note of published) {
    const { data } = note;
    const body = await transformBody(note.body, note.slug, assetIndex, slugByNoteName);
    const tags = [...new Set([...toList(data.tags), ...toList(data.type), ...toList(data.domain)])]
      .map((tag) => String(tag).replace(/^#/, ""))
      .filter(Boolean);

    const meta = {
      title: typeof data.title === "string" && data.title ? data.title : path.basename(note.file, ".md"),
      summary:
        typeof data.summary === "string" && data.summary
          ? data.summary
          : typeof data.description === "string" && data.description
            ? data.description
            : firstParagraphSummary(body),
      date: await resolveDate(data, note.file),
      group: note.group,
      tags,
      icon: typeof data.icon === "string" && data.icon ? data.icon : DEFAULT_ICON_BY_GROUP[note.group],
      project: typeof data.project === "string" && data.project ? data.project : undefined,
      projectHref:
        typeof data.projectHref === "string" && data.projectHref ? data.projectHref : undefined
    };
    if (!meta.summary) {
      warnings.push(`${note.slug}: summary를 만들 본문이 없음 — 빈 값으로 발행됨`);
    }

    await fs.writeFile(path.join(OUT_POSTS_DIR, `${note.slug}.md`), serializePost(meta, body));
  }

  console.log(`발행 ${published.length}편, 초고 ${drafts}편 (vault: ${VAULT_BLOG_DIR})`);
  for (const warning of warnings) console.warn(`⚠ ${warning}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
