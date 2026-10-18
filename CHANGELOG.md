# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-10-17

### Security

- `GET /v1/usuarios/:id` is no longer readable by any authenticated user. A new
  `StaffOrSelfGuard` allows the request when the caller is the target, or when the
  caller holds the `SOCIOS` permission through an active `PersonalOrganizacion` row in
  an organización the target has an `Inscripcion` in; otherwise it answers `403`.
  Self-only was not possible — the web panel's member-detail screen reads other users —
  and role alone is not enough, since `rol` exists only per organización: without the
  membership condition, staff of one club could read every user in the system. This
  mirrors the panel's own `SociosGuard`, so the server now enforces what the UI already
  assumed. Soft-deleted inscripciones count, so a former member's detail screen keeps
  working after a baja.
- **The `asistencias` module is now scoped to the organización.** All four routes were
  authenticated but unscoped, and `POST /v1/asistencias/:idOrg` — the endpoint the
  mobile app posts to after scanning a club's QR — took the member's id from the
  **request body**, so any authenticated user could record attendance for anyone, at
  any club. It now takes the member from the token, ignores the body entirely, and
  refuses with `403` unless that user has an `Inscripcion` in the organización being
  scanned. The QR proves which club was scanned, never who scanned it.
- The three staff routes (`POST /asistencias/crear`, `POST /asistencias`,
  `GET /asistencias/:idOrg`) now require the caller to be personnel of that
  organización holding the `ASISTENCIA` permission, via a new reusable `OrgStaffGuard`
  and `@PermisoOrganizacion()` decorator. The two reads previously handed any
  authenticated caller any club's attendance sheets. This mirrors the web panel's
  `AsistenciaGuard`. `GET /asistencias/:id`'s param was renamed `:idOrg` (same URL).
  **`socios`, `pagos`, `tarifas` and `organizaciones` have the same unscoped problem
  and can reuse this guard** — see `API_AUDIT.md` #7.
- `POST /v1/auth/recover` no longer reveals which email addresses have accounts. It
  answered `200` when the address was registered, `400` when it was not (a `TypeError`
  from dereferencing a null user — the endpoint is public, so that was also an
  unauthenticated crash path) and `401` when the mail failed to send. It now answers
  `200 { data: 'Password email sent' }` in every case and logs failures server-side.
  Response *timing* still differs, since a registered address does a bcrypt hash and an
  email send; that needs the work moved off the request path.
- **Request validation is now enforced.** Every request DTO carries
  `class-validator` decorators (29 of 29; `FileUploadDto` is a Swagger-only multipart
  schema), and the global pipe is
  `new ValidationPipe({ whitelist: true, transform: true })`. Undeclared properties are
  stripped before they reach a service, which closes the mass-assignment path in the
  three `update()` methods that loop over the body (`usuarios`, `tarifas`,
  `organizaciones`) — `UpdateUsuarioDto` omitting `password`, `verificado` and `dni` is
  now enforced rather than just documented. Decoration had to land before whitelisting:
  `whitelist` strips anything without validation metadata, so turning it on first would
  have emptied most request bodies.
- A shared `DomicilioDto` replaces the `Domicilio` entity used as a DTO in five places.
  It declares no `id`, so a nested `domicilio.id` is now stripped by the pipe as well as
  by the service.

### Fixed

- `PATCH /v1/organizaciones/:id` now merges the address instead of replacing it.
  Assigning the incoming object wholesale blanked any field the caller didn't send —
  the same bug already fixed for users in 0.2.2.
- `registerAttendanceWithEmail()` no longer dereferences a null user when the email has
  no account; it throws a 404 instead of a `TypeError`.

### Changed

- **`npm run lint` works again.** `eslint-plugin-prettier@4` called
  `prettier.resolveConfig.sync`, which Prettier 3 removed, so every file crashed the
  linter with `TypeError: prettier.resolveConfig.sync is not a function`. Bumped to
  `eslint-plugin-prettier@^5` and `eslint-config-prettier@^9`; ESLint itself stays on 8
  (v9 needs a flat-config migration). Applied the 403 accumulated Prettier fixes across
  77 files, and configured `no-unused-vars` to ignore `_`-prefixed names, since
  `const { password: _password, ...safe }` is the idiom used to drop fields. Removed 13
  genuinely unused imports. Down from a hard crash to 0 errors and 17 warnings, all of
  them unused locals and non-null assertions in `seed.ts`.

### Removed

- **`GET /v1/usuarios`.** It returned every user in the system to any authenticated
  caller, from any organización. No client called it: the Angular panel's three
  `/usuarios` calls all append an id, it has no users route and no platform-admin UI,
  and every people-listing screen is organización-scoped already —
  `GET /socios/organizacion/:idOrg` and `GET /organizaciones/:idOrg/personal` both
  return the user records embedded. The now-unused `UsuariosService.findAll()` was
  removed with it. If a platform-admin console is built later this endpoint should come
  back behind a guard for the `POST /admin/login` identity, not open to member tokens.
- **`GET /v1/usuarios/email/:email`.** It returned a full user record for any email
  address to any authenticated caller, making it both a data leak and an
  account-enumeration oracle. No client has ever called it — it appears in neither
  client's git history — and `UsuariosService.findByEmail()` is untouched, since login,
  email verification, password recovery, adding staff by email and attendance by email
  all use it server-side.
- Removed `socios/dto/date.query.dto.ts`, a dead DTO no endpoint used.

## [0.3.0] - 2026-10-17

### Security

- **Auth is now deny-by-default.** `JwtAuthGuard` is registered as an `APP_GUARD` and
  honours a new `@Public()` decorator, so **74 endpoints that required no
  authentication at all are now protected** — the whole of `socios`, `actividades`,
  `tarifas`, `pagos`, `notificaciones` and `asistencias`, 14 of 15 `organizaciones`
  routes, plus `POST /auth/change_password`, `POST /auth/socio` and
  `DELETE /uploads/:id`. Previously protection was opt-in per handler and most
  handlers never opted in; there was no global guard at all. 86 endpoints are now
  protected and 7 are explicitly public (the pre-auth `auth` routes, `admin/login`,
  and `GET /uploads/:path`, which serves images to clients that cannot send headers).
  The full per-endpoint matrix is in `API_AUDIT.md`.
- Added `SelfGuard`, applied to `PATCH /v1/usuarios/:id` and
  `DELETE /v1/usuarios/:id`. Both were behind `JwtAuthGuard`, which only proves the
  token is valid — nothing compared the token's subject to the `:id` being acted on, so
  any authenticated user could edit or delete any other account. Combined with
  `POST /v1/auth/recover`, that was an account-takeover path: change a victim's email,
  then have a fresh password mailed to the new address.
- `GET /v1/usuarios/:id` is intentionally **not** covered: the web panel's
  member-detail screen reads other users and self-only would break it. It needs a
  staff-aware policy instead — see `API_AUDIT.md`.

- `PATCH /v1/usuarios/:id` now clears `verificado` when the email address changes, so
  an account cannot be moved to an unconfirmed address while staying verified. A no-op
  update that resends the same address leaves verification intact.

### Fixed

- Four stale test assertions that had been failing against current behaviour: three in
  `notificaciones.service.spec.ts` expected a returned `Error` where the service throws,
  and one in `admin.service.spec.ts` asserted a log message that changed when scheduler
  logging was added. The suite is now fully green (97 tests).

### Changed

- Swagger (`/v1/docs`) now documents a response for **all 93 endpoints** across the 11
  controllers, up from 4. Because every handler writes its response manually via
  `@Res()`, Nest could not infer any of these — each shape had to be declared.
  Added `ApiDataResponse` / `ApiErrorResponse` helpers so the `{ data: ... }` envelope
  doesn't need a wrapper class per model.
- The docs now call out the places where the response shape is **inconsistent**, since
  that has already caused client bugs: most endpoints wrap in `{ data: ... }`, but
  `auth/register`, `usuarios/email/:email`, `pagos` (POST and GET `:id`), `tarifas`
  (POST), `actividades` (POST/PATCH/detail), `organizaciones` (POST, detail,
  `:id/espacio`), `asistencias/:id`, `socios` (DELETE and all reports) and
  `notificaciones/read/:id` respond unwrapped.
- Documented two behaviours that are easy to get wrong from the outside:
  `POST /v1/auth/verify` answers 2xx for both correct and incorrect codes (callers must
  read `verified`), and `POST /v1/admin/login` can respond with the string
  `"UNAUTHORIZED"` rather than an error status.
- Documented that `POST /v1/uploads` only stores a file while `POST /v1/uploads/user`
  also persists it as the authenticated user's `fotoPerfil`, and that `actividades`
  detail serialises its lazy `tarifas` relation under the `__tarifas__` key.

### Known gaps

- Changing the email clears `verificado` but does **not** yet send a confirmation code
  to the new address. `EmailService` cannot be injected into `UsuariosService` without a
  circular module dependency (`EmailModule` already imports `UsuariosModule`). The clean
  fix is a dedicated `POST /v1/auth/change_email` in the seguridad module, which already
  owns `EmailService` and the verification flow — mirroring `change_password`.

## [0.2.2] - 2026-10-17

### Security

- `PATCH /v1/usuarios/:id` no longer includes the user's bcrypt password hash in the
  response body. The other `usuarios` read endpoints already stripped it; this one
  was missed.
- `PATCH /v1/usuarios/:id` now ignores an incoming `domicilio.id`, so a caller can no
  longer redirect the address write to another user's `domicilio` row.

### Fixed

- `PATCH /v1/usuarios/:id` now loads the `domicilio` relation, so the response is a
  complete user. Clients parsing the response as a full `Usuario` previously failed
  on the missing address even though the update itself had succeeded.
- `PATCH /v1/usuarios/:id` now merges address changes into the user's existing
  `Domicilio` row instead of assigning the incoming object to the relation. The
  previous behaviour dropped the row's id and put the user's address link at risk.
- `PATCH /v1/usuarios/:id` no longer allows `dni` to be overwritten. Combined with a
  client that sent a placeholder value, this silently corrupted stored identity data.
- `POST /v1/pagos` now validates `medioDePago` against the `MedioDePago` enum
  (`@IsEnum`) instead of casting the raw string. Values outside the enum — e.g.
  `"TRANSFERENCIA"` instead of `"TRANSFERENCIA BANCARIA"` — were silently persisted
  and would never match the enum in later comparisons.
- `pagos.service.spec.ts` imported `MedioDePago` from a module that never re-exported
  it, which left a permanent TypeScript error in the build. `tsc --noEmit` is now clean.

### Changed

- Documented the response shape of `PATCH /v1/usuarios/:id` in Swagger (`/v1/docs`).
- `UpdateUsuarioDto` now reflects what the endpoint actually honours: `password`,
  `verificado` and `dni` were removed (the service has always refused to update the
  first two), and every remaining field is marked optional, which is how PATCH has
  always behaved.
- `POST /v1/pagos` now advertises the allowed `medioDePago` values in Swagger.

## [0.2.1] - 2026-10-16

### Security

- `POST /v1/auth/login` and `POST /v1/auth/register` no longer include the user's
  bcrypt password hash in the response body. Both endpoints returned the full
  `Usuario` entity, including `password`, directly to the client.
- `GET /v1/notificaciones/:id` no longer includes the password hash of each
  notification recipient (`destinatarios[].destinatario`). The endpoint eagerly
  loaded the full `Usuario` relation and returned it as-is.

### Changed

- Documented the response shape of `POST /v1/auth/login` and `POST /v1/auth/register`
  in Swagger (`/v1/docs`).
