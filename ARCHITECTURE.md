# Vogit Architecture

Vogit is a version-controlled file storage system. A file can have many
versions, identified by content hashes, and the system is designed so the
core logic can be reused by multiple future clients (CLI, Web, Android)
through one HTTP API.

## Layers

```
presentation/     HTTP controllers, routing, error mapping (Bun.serve)
application/      Use cases + FileVersioningFacade (orchestration)
domain/           Entities, repository interfaces, domain errors
infrastructure/   Postgres + in-memory repositories, hashing, filesystem
```

Dependencies only point inward: `presentation -> application -> domain`.
`infrastructure` implements the abstractions declared in `domain`, and is
selected at startup by `infrastructure/repository/RepositoryFactory.ts` -
nothing in `domain` or `application` imports Postgres, Bun, or HTTP types.

```
Controller -> DTO -> Use Case / Facade -> Domain -> Repository interface -> Infrastructure
```

## Domain model

- **File** - a named, path-addressed resource (`domain/file/entities/File.ts`).
- **Version** - one snapshot of a File, identified by `(fileId, versionNumber)`.
  Stores only the line numbers that changed in that version (`lines`) plus
  the total line count (`totalLines`).
- **VersionLine** - one changed line of one version: `(fileId, versionNumber,
  lineNumber) -> hash`.
- **Hash** - a SHA-256 hash mapped to the line content it represents. Shared
  globally across all files/versions (content-addressed storage).

## Versioning & hashing algorithm (preserved from the original code)

This is Vogit's core algorithm, implemented in
`application/use-case/VersionBuilder.ts`, and it is unchanged from the
original implementation:

1. Split the incoming content into lines.
2. Hash every line with SHA-256 (`infrastructure/utils/hashManager.ts`).
   If that hash has never been seen before, store it once in the `Hash`
   table - identical line content is never duplicated, anywhere, across
   any file or version (`same content -> same hash`, deduplication).
3. For each line, walk backwards through *that file's* previous versions
   to find the most recent version that touched that line number. If the
   hash is unchanged, the new version does not store a row for that line
   at all - it implicitly inherits it from the earlier version. Only
   genuinely changed lines are persisted.
4. Reconstructing a version's full content
   (`application/use-case/GetFileVersion.ts#getContent`) walks every line
   from 1 to `totalLines` and, for lines not listed in that version's
   `lines` delta, looks up the nearest earlier version that did store
   that line.

### The one behavioral change, and why

In the original code, `Version` numbers were a single global counter
shared by every file, and step 3's backward search walked that global
version sequence with no awareness of which file a line belonged to.
Concretely: versioning `file A` and then `file B` would give `file B`
version 2, and the algorithm would compare `file B`'s lines against
whatever `file A` happened to store in version 1 - two unrelated files'
histories were interleaved and could silently corrupt each other's diffs.
There was also no way to list "all versions of file X", since versions
weren't attached to a file at all (`domain/file/interfaces/read/IVersionRepository.ts`
did declare a `getById(fileId, versionNumber)` method, suggesting this was
already the intended design, just not implemented consistently).

This directly conflicts with the stated project vision: independent
per-file histories (`file.txt -> v1, v2, v3`). The fix keeps the hashing
and line-diff algorithm byte-for-byte identical; it only adds a `fileId`
to `Version` and scopes every version lookup/insert by that `fileId`.
Version numbers now restart at 1 for every file, and diffing/reconstruction
only ever look at that file's own history. Hashing/dedup stays global,
since that is a deliberate content-addressing feature, not a bug.

As a consequence, the old `FileVersion` join entity/table/repository
(`file -> version` mapping) became redundant - a `Version` now carries its
`fileId` directly - and it also contained a pre-existing bug (it inserted
`fileId, versionNumber` but read them back as `version_number`, a column
that didn't match Postgres's lower-cased identifier). It has been removed
in favor of `IVersionRepository.getAllForFile` / `getLastForFile`, so
there is a single source of truth for "which versions belong to which
file". A few other pre-existing bugs were fixed in the same spirit
(without touching business logic): `HashRepository`/`FileRepository`
Postgres queries reading `row.hashValue` when Postgres actually returns
`row.hashvalue`, and `package.json` depending on `postgres`/`sqlite3`/
`typeorm` (unused) while the code imports `pg` (missing from
dependencies).

## Use cases

| File | Responsibility |
|---|---|
| `application/use-case/UploadFile.ts` (`AddFileUseCase`) | Add a file, create its version 1 |
| `application/use-case/AddVersion.ts` (`CreateVersionUseCase`) | Create a new version from new content (also used for "update a file") |
| `application/use-case/GetFileVersion.ts` (`GetFileVersionUseCase`) | List versions, get a version, reconstruct its content |
| `application/use-case/ChangeVersion.ts` (`RestoreVersionUseCase`) | Restore an old version by re-creating it as a new version |
| `application/use-case/VersionBuilder.ts` | The core diff/hash algorithm described above |

`application/facade/FileVersioningFacade.ts` wires these use cases together
and is the only thing the presentation layer talks to. It accepts and
returns DTOs (`application/dto/FileDTO.ts`) - domain entities never cross
that boundary.

`DeleteFile.ts`, `DownloadFile.ts`, and `VerifyFile.ts` are left as the
empty placeholders they already were; they weren't part of this phase's
required use cases (see project vision) and were left untouched rather than
filled with speculative logic.

## Repositories & persistence

`domain/file/interfaces/read/*.ts` declare the abstractions
(`IFileRepository`, `IVersionRepository`, `IVersionLineRepository`,
`IHashRepository`). Two implementations exist for each:

- `infrastructure/repository/in-memory/*` - default, zero setup, used by
  the automated tests.
- `infrastructure/repository/db/read/*` - Postgres, via `pg`
  (`infrastructure/database/sql/PostgresDatabase.ts`, itself behind the
  `IDatabase` interface so Postgres could be swapped later).

`infrastructure/repository/RepositoryFactory.ts` picks one set based on
`REPO_DRIVER` (`memory` by default, `postgres` when set) - this is the only
place that decides which concrete infrastructure is used.

## Errors

`domain/file/errors/DomainErrors.ts` defines `FileNotFoundError`,
`VersionNotFoundError`, `InvalidFileError`, `DuplicateContentError`, and
`StorageError`. `presentation/http/errorMapper.ts` maps them to HTTP status
codes (404 / 400 / 409 / 502) so no internal or Postgres error ever reaches
the client; anything unrecognized becomes a generic 500.

## API

| Method | Path | Description |
|---|---|---|
| POST | `/files` | Add a file: `{ "path": string, "content": string }` |
| GET | `/files` | List files |
| GET | `/files/:id` | Get a file |
| PUT | `/files/:id` | Update a file (creates a new version): `{ "content": string }` |
| POST | `/files/:id/versions` | Create a new version: `{ "content": string }` |
| GET | `/files/:id/versions` | List a file's versions |
| GET | `/files/:id/versions/:version` | Get a version (`?content=true` includes reconstructed text) |
| POST | `/files/:id/restore/:version` | Restore an old version as a new one |

## Running the project

```bash
bun install
bun run dev      # starts the API with in-memory repositories (default)
bun test         # runs the business-logic test suite
```

To use Postgres (e.g. via the existing `docker-compose.yml`):

```bash
REPO_DRIVER=postgres DATABASE_URL=postgresql://vogit_user:vogit_password@localhost:5432/vogit_db bun run start
```

or simply `docker compose up`, which already sets `DATABASE_URL` for the
`app` service - add `REPO_DRIVER: postgres` alongside it there when you're
ready to run against Postgres instead of the in-memory default.
