import { test } from "node:test";
import assert from "node:assert/strict";
import { parseGithubRepoLink, cleanReadme } from "./github";

test("parses repo-root links", () => {
  assert.deepEqual(parseGithubRepoLink("https://github.com/vercel/next.js"), {
    owner: "vercel",
    repo: "next.js",
  });
  assert.deepEqual(
    parseGithubRepoLink("https://www.github.com/anthropics/claude-code/"),
    { owner: "anthropics", repo: "claude-code" },
  );
  assert.deepEqual(parseGithubRepoLink("https://github.com/prisma/prisma.git"), {
    owner: "prisma",
    repo: "prisma",
  });
});

test("rejects deep links, reserved paths, and non-github hosts", () => {
  assert.equal(parseGithubRepoLink("https://github.com/vercel/next.js/issues/123"), null);
  assert.equal(parseGithubRepoLink("https://github.com/vercel"), null);
  assert.equal(parseGithubRepoLink("https://github.com/topics/typescript"), null);
  assert.equal(parseGithubRepoLink("https://github.com/orgs/anthropics"), null);
  assert.equal(parseGithubRepoLink("https://gitlab.com/owner/repo"), null);
  assert.equal(parseGithubRepoLink("https://gist.github.com/owner/abc123"), null);
  assert.equal(parseGithubRepoLink("not a url"), null);
});

test("cleanReadme strips badges, html, and collapses whitespace", () => {
  const md = `# Title\n\n[![CI](https://img.shields.io/badge.svg)](https://ci.example.com)\n\n<img src="logo.png">\n\nReal   content\nhere.`;
  const cleaned = cleanReadme(md);
  assert.ok(!cleaned.includes("shields.io"));
  assert.ok(!cleaned.includes("<img"));
  assert.ok(cleaned.includes("Real content here."));
});
