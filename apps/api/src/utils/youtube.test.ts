import { test } from "node:test";
import assert from "node:assert/strict";
import { getYouTubeVideoId, parseTimedText, chunkTranscript } from "./youtube";

test("getYouTubeVideoId handles link shapes", () => {
  assert.equal(
    getYouTubeVideoId("https://www.youtube.com/watch?v=kJQP7kiw5Fk"),
    "kJQP7kiw5Fk",
  );
  assert.equal(
    getYouTubeVideoId("https://www.youtube.com/watch?v=kJQP7kiw5Fk&t=42s&list=RD"),
    "kJQP7kiw5Fk",
  );
  assert.equal(getYouTubeVideoId("https://youtu.be/kJQP7kiw5Fk?si=abc"), "kJQP7kiw5Fk");
  assert.equal(
    getYouTubeVideoId("https://www.youtube.com/shorts/kJQP7kiw5Fk"),
    "kJQP7kiw5Fk",
  );
  assert.equal(
    getYouTubeVideoId("https://m.youtube.com/watch?v=kJQP7kiw5Fk"),
    "kJQP7kiw5Fk",
  );
  assert.equal(
    getYouTubeVideoId("https://www.youtube.com/embed/kJQP7kiw5Fk"),
    "kJQP7kiw5Fk",
  );
  assert.equal(getYouTubeVideoId("https://www.youtube.com/watch?v=short"), null);
  assert.equal(getYouTubeVideoId("https://www.youtube.com/@channel"), null);
  assert.equal(getYouTubeVideoId("https://vimeo.com/12345"), null);
  assert.equal(getYouTubeVideoId("not a url"), null);
});

test("parseTimedText extracts timed segments", () => {
  const xml = `<?xml version="1.0"?><timedtext format="3"><body>
<p t="433" d="27100" wp="1">first line</p>
<p t="27566" d="1534">second &amp; third
wrapped</p>
<p t="30000" d="100"><s>nested</s> <s>segs</s></p>
<p t="31000" d="100">   </p>
</body></timedtext>`;
  assert.deepEqual(parseTimedText(xml), [
    { startSec: 0, text: "first line" },
    { startSec: 27, text: "second & third wrapped" },
    { startSec: 30, text: "nested segs" },
  ]);
});

test("chunkTranscript groups by size and keeps chunk start times", () => {
  const segments = Array.from({ length: 10 }, (_, i) => ({
    startSec: i * 10,
    text: "x".repeat(300),
  }));
  const chunks = chunkTranscript(segments, 800);
  assert.equal(chunks.length, 4); // 3 segments per chunk (903 chars), 10 segs -> 4 chunks
  assert.deepEqual(
    chunks.map((c) => c.startSec),
    [0, 30, 60, 90],
  );
  assert.deepEqual(
    chunks.map((c) => c.sequence),
    [0, 1, 2, 3],
  );
  assert.equal(chunkTranscript([]).length, 0);
});
