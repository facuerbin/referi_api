# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
