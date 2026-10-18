# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
