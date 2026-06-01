# Revisión de ciberseguridad - deckbuilder-me

Fecha: 1 de junio de 2026

## Resumen ejecutivo

La aplicación no muestra, a simple vista, uso directo de `innerHTML`, `bypassSecurityTrust*` ni `eval`, lo que es positivo. Sin embargo, sí detecté varios riesgos relevantes alrededor de autenticación, autorización y almacenamiento cliente. El punto más importante es que la seguridad de los datos en Supabase depende por completo de RLS/políticas de base de datos; en el código frontend hay varias operaciones que confían en IDs proporcionados por el navegador sin una verificación de propiedad adicional.

## Mitigaciones aplicadas

- `AuthService` ahora persiste la sesión en `sessionStorage` en lugar de `localStorage`.
- Las operaciones sensibles de `DeckService` filtran por `user_id` además de por `id` o `familyId`.
- El builder valida el JSON recibido desde `sessionStorage` antes de usarlo.
- Se añadió una CSP básica en [src/index.html](src/index.html).

## Hallazgos

### 1) Dependencia total de RLS para operaciones sensibles sobre Supabase

**Severidad:** Alta

El frontend consulta, actualiza y elimina registros por `id` o `familyId` sin comprobar explícitamente la pertenencia del recurso al usuario autenticado. Esto es especialmente visible en:
- [src/app/core/services/deck.service.ts](src/app/core/services/deck.service.ts) para `getDeckDetails()`, `updateVersion()`, `deleteVersion()` y `deleteFamily()`
- [src/app/pages/decks-library/components/decks-library/decks-library.component.ts](src/app/pages/decks-library/components/decks-library/decks-library.component.ts) al borrar familias desde `supabaseFamilyId`

Si las políticas RLS de Supabase no están perfectamente configuradas, esto abre la puerta a un escenario de IDOR: un usuario autenticado podría leer, modificar o borrar decks ajenos con IDs conocidos o adivinados.

**Evidencia principal:**
- [src/app/core/services/deck.service.ts#L132-L136](src/app/core/services/deck.service.ts#L132-L136)
- [src/app/core/services/deck.service.ts#L335-L339](src/app/core/services/deck.service.ts#L335-L339)
- [src/app/core/services/deck.service.ts#L428-L429](src/app/core/services/deck.service.ts#L428-L429)
- [src/app/core/services/deck.service.ts#L448-L448](src/app/core/services/deck.service.ts#L448-L448)

**Recomendación:**
- Verificar y endurecer las políticas RLS en Supabase para `deck_families`, `decks` y `profiles`.
- Añadir filtros de propiedad también en las consultas críticas del backend.
- Rechazar operaciones si el recurso no pertenece al usuario autenticado.

### 2) La protección de rutas es solo de interfaz, no de seguridad real

**Severidad:** Media-Alta

El guard de rutas solo comprueba si existe usuario en el estado del cliente. Eso evita navegación accidental, pero no protege datos por sí mismo.

- [src/app/core/guards/auth.guard.ts](src/app/core/guards/auth.guard.ts)
- [src/app/app-routing.module.ts](src/app/app-routing.module.ts)

Si un atacante consigue acceso al cliente, manipula el estado o llama a la API de Supabase directamente, el guard no aporta protección real.

**Recomendación:**
- Considerar el guard como UX, no como control de acceso.
- Depender de RLS y validación server-side para autorización.

### 3) Sesión y datos sensibles almacenados en el navegador

**Severidad:** Media

Supabase Auth, por defecto, persiste la sesión en almacenamiento accesible por JavaScript. Además, la app guarda mazos y estado temporal en `localStorage` y `sessionStorage`.

- [src/app/core/services/auth.service.ts](src/app/core/services/auth.service.ts)
- [src/app/core/services/storage.service.ts](src/app/core/services/storage.service.ts)
- [src/app/pages/deck-builder/components/deck-builder/deck-builder.component.ts](src/app/pages/deck-builder/components/deck-builder/deck-builder.component.ts)

Esto no es un fallo por sí mismo, pero amplifica mucho el impacto de cualquier XSS: un script inyectado podría leer la sesión de Supabase y los datos del usuario.

**Recomendación:**
- Minimizar datos sensibles en `localStorage`/`sessionStorage`.
- Introducir una política CSP estricta.
- Revisar si el flujo de autenticación puede migrar a almacenamiento más resistente a XSS cuando sea viable.

### 4) Ausencia de CSP visible en la aplicación

**Severidad:** Media

No he visto una Content Security Policy definida en [src/index.html](src/index.html). Tampoco he detectado una política equivalente en la configuración del proyecto.

Sin CSP, cualquier XSS futuro tendría un impacto mayor, y además no hay una segunda barrera para limitar cargas remotas, inline scripts o navegación inesperada.

**Recomendación:**
- Definir una CSP restrictiva.
- Restringir `script-src`, `connect-src`, `img-src` y `font-src` a orígenes conocidos.
- Evitar `unsafe-inline` salvo que sea estrictamente necesario.

### 5) Credencial pública de Supabase embebida en el repositorio

**Severidad:** Baja-Media

La URL y la clave anon de Supabase están hardcodeadas en:
- [src/environments/environment.ts](src/environments/environment.ts#L1-L4)
- [src/environments/environment.prod.ts](src/environments/environment.prod.ts#L1-L4)

La anon key de Supabase no es un secreto real, pero su presencia fija en el repositorio facilita la replicación del entorno y complica la rotación o separación por despliegue.

**Recomendación:**
- Mantener la anon key como pública solo si realmente es la clave anon.
- Mover valores por entorno a variables de build o a un sistema de configuración de despliegue.
- Verificar que no exista ninguna service role key ni credencial privilegiada en el frontend.

### 6) Datos importados desde `sessionStorage` sin validación de esquema

**Severidad:** Baja-Media

Los flujos de importación de mazos leen JSON desde `sessionStorage` y lo aplican directamente al editor:
- `import_cloud_deck`
- `open_in_editor`

Se observa en [src/app/pages/deck-builder/components/deck-builder/deck-builder.component.ts](src/app/pages/deck-builder/components/deck-builder/deck-builder.component.ts) y en la pantalla de biblioteca.

Esto no es una vulnerabilidad explotable por sí sola, pero sí un punto débil: si un script malicioso logra escribir en ese almacenamiento, puede inyectar datos arbitrarios en el flujo de edición.

**Recomendación:**
- Validar el JSON con un esquema estricto antes de usarlo.
- Rechazar campos inesperados o tipos inválidos.
- No asumir que el contenido de `sessionStorage` es confiable.

## Observaciones adicionales

- No he encontrado uso directo de `innerHTML`, `bypassSecurityTrustHtml` ni `eval` en el código revisado.
- El uso de URLs externas para imágenes y fuentes parece razonable, pero conviene mantener CSP y revisar CORS/allowlists si el producto crece.

## Prioridad de acción

1. Revisar RLS y políticas de Supabase.
2. Añadir validación server-side/autorización por propietario para operaciones de decks.
3. Definir CSP.
4. Validar datos importados desde almacenamiento local/session.
5. Auditar el manejo de credenciales y la estrategia de despliegue por entorno.
