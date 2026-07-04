import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isMapLink,
  extractCoordsFromUrl,
  extractCoordsFromHtml,
  placeNameFromUrl,
} from "./maps";

test("isMapLink detects map providers", () => {
  assert.ok(isMapLink("https://www.google.com/maps/place/Blue+Bottle/@40.72,-73.99,17z"));
  assert.ok(isMapLink("https://maps.google.com/?q=40.6892,-74.0445"));
  assert.ok(isMapLink("https://maps.app.goo.gl/AbCdEf123"));
  assert.ok(isMapLink("https://goo.gl/maps/AbCdEf123"));
  assert.ok(isMapLink("https://maps.apple.com/?ll=37.3349,-122.0090"));
  assert.ok(isMapLink("https://www.openstreetmap.org/#map=19/51.501476/-0.140634"));
  assert.ok(isMapLink("https://waze.com/ul?ll=34.0522,-118.2437"));
  assert.ok(isMapLink("https://www.bing.com/maps?cp=47.6062~-122.3321"));
  assert.ok(!isMapLink("https://www.google.com/search?q=maps"));
  assert.ok(!isMapLink("https://example.com/article"));
  assert.ok(!isMapLink("not a url"));
});

test("google place pin (!3d!4d) wins over viewport (@)", () => {
  const url =
    "https://www.google.com/maps/place/Blue+Bottle/@40.7263,-73.9945,17z/data=!4m6!3m5!8m2!3d40.7262773!4d-73.9944906";
  assert.deepEqual(extractCoordsFromUrl(url), {
    latitude: 40.7262773,
    longitude: -73.9944906,
  });
});

test("google viewport-only URL falls back to @", () => {
  assert.deepEqual(
    extractCoordsFromUrl("https://www.google.com/maps/@37.7749,-122.4194,12z"),
    { latitude: 37.7749, longitude: -122.4194 },
  );
});

test("query params: q, encoded destination, ll, coordinate", () => {
  assert.deepEqual(
    extractCoordsFromUrl("https://maps.google.com/?q=40.6892,-74.0445"),
    { latitude: 40.6892, longitude: -74.0445 },
  );
  assert.deepEqual(
    extractCoordsFromUrl(
      "https://www.google.com/maps/dir/?api=1&destination=41.8781%2C-87.6298",
    ),
    { latitude: 41.8781, longitude: -87.6298 },
  );
  assert.deepEqual(
    extractCoordsFromUrl("https://maps.apple.com/?ll=37.3349,-122.0090&q=Apple%20Park"),
    { latitude: 37.3349, longitude: -122.009 },
  );
  assert.deepEqual(
    extractCoordsFromUrl("https://maps.apple.com/place?coordinate=37.7756,-122.4358"),
    { latitude: 37.7756, longitude: -122.4358 },
  );
});

test("osm, waze, bing", () => {
  assert.deepEqual(
    extractCoordsFromUrl("https://www.openstreetmap.org/#map=19/51.501476/-0.140634"),
    { latitude: 51.501476, longitude: -0.140634 },
  );
  assert.deepEqual(
    extractCoordsFromUrl(
      "https://www.openstreetmap.org/?mlat=48.8584&mlon=2.2945#map=16/48.8584/2.2945",
    ),
    { latitude: 48.8584, longitude: 2.2945 },
  );
  assert.deepEqual(
    extractCoordsFromUrl("https://waze.com/ul?ll=34.0522,-118.2437&navigate=yes"),
    { latitude: 34.0522, longitude: -118.2437 },
  );
  assert.deepEqual(
    extractCoordsFromUrl("https://ul.waze.com/ul?to=ll.34.0522%2C-118.2437"),
    { latitude: 34.0522, longitude: -118.2437 },
  );
  assert.deepEqual(
    extractCoordsFromUrl("https://www.bing.com/maps?cp=47.6062~-122.3321&lvl=15"),
    { latitude: 47.6062, longitude: -122.3321 },
  );
});

test("rejects garbage", () => {
  assert.equal(extractCoordsFromUrl("https://maps.apple.com/?q=Apple+Park"), null);
  assert.equal(extractCoordsFromUrl("https://maps.google.com/?q=91.0,200.0"), null);
  assert.equal(extractCoordsFromUrl("https://maps.google.com/?ll=0,0"), null);
});

test("html fallbacks: og place, geo.position, embedded json", () => {
  assert.deepEqual(
    extractCoordsFromHtml(
      `<meta property="place:location:latitude" content="40.7580"/>
       <meta property="place:location:longitude" content="-73.9855"/>`,
    ),
    { latitude: 40.758, longitude: -73.9855 },
  );
  assert.deepEqual(
    extractCoordsFromHtml(`<meta name="geo.position" content="52.5200; 13.4050">`),
    { latitude: 52.52, longitude: 13.405 },
  );
  assert.deepEqual(
    extractCoordsFromHtml(`{"location":{"latitude":35.6595,"longitude":139.7005}}`),
    { latitude: 35.6595, longitude: 139.7005 },
  );
  assert.equal(extractCoordsFromHtml("<html><body>no coords here</body></html>"), null);
});

test("placeNameFromUrl derives names, skips coordinate q params", () => {
  assert.equal(
    placeNameFromUrl("https://www.google.com/maps/place/Blue+Bottle+Coffee/@40.72,-73.99,17z"),
    "Blue Bottle Coffee",
  );
  assert.equal(
    placeNameFromUrl("https://maps.apple.com/?ll=37.3349,-122.0090&q=Apple%20Park"),
    "Apple Park",
  );
  assert.equal(placeNameFromUrl("https://maps.google.com/?q=40.6892,-74.0445"), null);
  assert.equal(placeNameFromUrl("https://maps.app.goo.gl/AbCdEf123"), null);
});
