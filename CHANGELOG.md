# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
