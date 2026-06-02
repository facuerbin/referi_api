# Referí — API

API REST del sistema de gestión de clubes y socios Referí. Desarrollada como proyecto final de la carrera Ingeniería en Sistemas de Información.

---

## Funcionalidades

- **Socios** — Alta, baja y modificación. Importación y exportación por CSV. Reportes por rango etario, estado y actividad.
- **Actividades** — ABM de actividades, turnos y horarios. Inscripción y baja de socios a turnos.
- **Tarifas** — Definición de tarifas por actividad con frecuencias de cobro.
- **Pagos** — Registro de pagos, historial por socio y organización, seguimiento de cuotas vencidas.
- **Asistencias** — Planillas de asistencia diarias. Registro por DNI o código QR.
- **Notificaciones** — Envío de notificaciones a socios, deudores, o inscriptos en una actividad o turno.
- **Organización** — Gestión de espacios físicos, personal y roles con permisos.
- **Reportes** — Inscriptos por mes, distribución por estado, deuda e ingresos por actividad.
- **Backups** — Generación y restauración de backups de la base de datos. Backup automático cada 12 horas.

---

## Requisitos

- Node.js 22+
- MySQL 8+ (o Docker para levantarlo con `docker compose up -d`)

---

## Configuración

Copiar el archivo de ejemplo y completar los valores:

```bash
cp src/config/development.env.example src/config/development.env
```

| Variable | Descripción | Default |
|---|---|---|
| `DB_HOST` | Host de MySQL | `localhost` |
| `DB_PORT` | Puerto de MySQL | `3306` |
| `DB_NAME` | Nombre de la base de datos | `referi_dev` |
| `DB_USER_NAME` | Usuario de MySQL | `root` |
| `DB_USER_PASSWORD` | Contraseña de MySQL | `toor` |
| `JWT_SECRET` | Clave para firmar tokens JWT | `somethingSecret` |
| `MAIL_API_KEY` | API key de SendGrid | — |
| `DEBUG_EMAIL` | Redirige todos los emails a esta dirección en lugar del destinatario real (debug) | — |
| `SKIP_EMAIL` | Si es `true`, omite el envío de emails y muestra códigos de verificación en consola | `true` |
| `API_DOC_PASS` | Contraseña para acceder a Swagger | — |

En desarrollo, `SKIP_EMAIL=true` permite registrar y verificar usuarios sin configurar SendGrid. Los códigos de verificación se imprimen en la consola del servidor.

En producción, configurar `MAIL_API_KEY` con una API key de SendGrid y verificar el dominio remitente (`no-reply@referiapp.com.ar`) en el panel de SendGrid.

En desarrollo, la base de datos se sincroniza automáticamente con las entidades. En producción se usan migraciones.

---

## Instalación y ejecución

```bash
# 1. Levantar la base de datos (requiere Docker)
docker compose up -d

# 2. Instalar dependencias
npm install

# 3. Cargar datos iniciales (roles, permisos, tipos, estados, frecuencias)
npm run seed

# 4. Iniciar el servidor
npm run start:dev      # desarrollo con hot-reload
npm run start:prod     # producción (requiere build previo)
npm run build
```

El seed es idempotente — puede ejecutarse más de una vez sin generar duplicados.

> **Nota:** si el seed no se ejecuta antes del primer inicio, el registro de usuarios fallará al asignar el rol `PROPIETARIO`.

---

## Tests

```bash
npm test               # unit tests
npm run test:cov       # cobertura
npm run test:e2e
```

---

## Migraciones (producción)

```bash
npm run migration:generate
npm run migration:run
```

---

## Documentación de la API

Swagger disponible en `/v1/docs` una vez levantado el servidor. Requiere autenticación básica:

- **Usuario:** `referiapp`
- **Contraseña:** valor de `API_DOC_PASS`

---

## Tecnologías

- **NestJS 11** con arquitectura modular
- **TypeScript 5**
- **TypeORM** con MySQL 8
- **Passport JWT** para autenticación
- **SendGrid** para envío de emails
- **Swagger / OpenAPI** para documentación
