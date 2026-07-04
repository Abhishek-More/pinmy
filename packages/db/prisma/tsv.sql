-- Full-text search infrastructure. Lives OUTSIDE Prisma (schema.prisma only
-- declares the tsv columns as Unsupported). Applied manually to the database;
-- kept here so the current state is reproducible.

CREATE OR REPLACE FUNCTION pin_tsv_trigger() RETURNS trigger AS $$
BEGIN
  NEW.tsv := to_tsvector('english',
    coalesce(NEW.title, '') || ' ' || coalesce(NEW.description, '') || ' ' || coalesce(NEW.note, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION pin_chunk_tsv_trigger() RETURNS trigger AS $$
BEGIN
  NEW.tsv := to_tsvector('english', coalesce(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pin_tsv_update ON "Pin";
CREATE TRIGGER pin_tsv_update BEFORE INSERT OR UPDATE ON "Pin"
  FOR EACH ROW EXECUTE FUNCTION pin_tsv_trigger();

DROP TRIGGER IF EXISTS pin_chunk_tsv_update ON "pin_chunk";
CREATE TRIGGER pin_chunk_tsv_update BEFORE INSERT OR UPDATE ON "pin_chunk"
  FOR EACH ROW EXECUTE FUNCTION pin_chunk_tsv_trigger();

-- Backfill after changing the trigger definition:
-- UPDATE "Pin" SET tsv = to_tsvector('english',
--   coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(note, ''));
