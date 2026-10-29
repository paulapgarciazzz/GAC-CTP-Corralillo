# GAC-CTP-Corralillo

## Configuración de correo con Resend

El proyecto está preparado para enviar correos mediante Resend. El archivo
`backend/.env.example` mantiene `MAIL_MAILER=log` para desarrollo seguro:
este mailer no envía correos reales, solo registra el contenido en los logs de
Laravel.

### Configuración local

Cada desarrollador debe tener su propio archivo `backend/.env`. Si todavía no
existe, créalo copiando `backend/.env.example`:

```bash
copy backend\.env.example backend\.env
```

Para probar el envío real con Resend, cambia localmente estas variables en
`backend/.env` y reemplaza `SU_CLAVE_LOCAL` por una clave propia:

```dotenv
MAIL_MAILER=resend
RESEND_API_KEY=SU_CLAVE_LOCAL
MAIL_FROM_ADDRESS=sistema@notificaciones.festivaldelatortilla.com
MAIL_FROM_NAME="CTP Corralillo"
```

El subdominio `notificaciones.festivaldelatortilla.com` ya está verificado en
Resend (vía Cloudflare). La API Key debe estar limitada a ese subdominio
("Sending access"), nunca usar una clave con permisos más amplios.

No agregues la clave al repositorio ni la compartas. El archivo `.env` está
ignorado por Git y cada PC (o el servidor institucional) debe tener su propia
clave, generada independientemente desde el panel de Resend.

Desde la carpeta `backend`, ejecuta:

```bash
php artisan key:generate
php artisan optimize:clear
php artisan about
```

`php artisan about` permite revisar el entorno y la configuración general de
Laravel. Ejecuta `optimize:clear` después de modificar el `.env` para que no
quede configuración cacheada.

### Configuración con Docker

Si utilizas Docker Compose, configura las mismas variables en
`backend/.env` y ejecuta los comandos desde la raíz del proyecto:

```bash
docker compose exec app php artisan key:generate
docker compose exec app php artisan optimize:clear
docker compose exec app php artisan about
```

El servicio `app` monta la carpeta `backend`, por lo que Laravel lee el
`backend/.env` local dentro del contenedor.

`MAIL_FROM_ADDRESS` debe ser siempre una dirección bajo un dominio/subdominio
verificado en Resend. Actualmente el subdominio verificado es
`notificaciones.festivaldelatortilla.com`; usar un remitente fuera de ese
subdominio (como el genérico `onboarding@resend.dev` de pruebas) hará que
Resend rechace el envío si la API Key está limitada a ese subdominio.

## Pruebas con MariaDB

PHPUnit usa una base MariaDB separada llamada `proyecto_test`. Nunca debe usar
`proyecto_db`, que corresponde al entorno de desarrollo. El archivo
`backend/phpunit.xml` fuerza esta conexión con `<server>` además de `<env>`:
Docker inyecta `DB_DATABASE=proyecto_db` como variable del sistema (`$_SERVER`),
que Laravel lee antes que `$_ENV`, y `<env force="true">` por sí solo no la
reemplaza. Si la conexión real no es `proyecto_test`, `tests/TestCase.php`
aborta cada prueba antes de tocar la base.

Para un aislamiento total se puede usar un usuario de MariaDB que solo tenga
permisos sobre `proyecto_test` (p. ej. `laravel_test`) y ejecutar PHPUnit con
una copia de `phpunit.xml` que use ese usuario; así, aunque algo fallara,
MariaDB negaría el acceso a `proyecto_db`. La imagen Docker no tiene soporte
JPEG en GD: en las pruebas usa `UploadedFile::fake()->image('x.png')`.

El servicio `db` crea `proyecto_test` automáticamente en una instalación nueva
mediante el script de inicialización montado en
`docker/db/init/01-create-test-database.sql`. Si el volumen `db_data` ya
existía antes de agregar ese script, créala una sola vez con:

```bash
docker compose exec db mariadb -uroot -proot_password -e "CREATE DATABASE IF NOT EXISTS proyecto_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; GRANT ALL PRIVILEGES ON proyecto_test.* TO 'laravel_user'@'%'; FLUSH PRIVILEGES;"
```

Las migraciones de pruebas se ejecutan automáticamente sobre esa base mediante
`RefreshDatabase` al correr PHPUnit. Para preparar manualmente la base sin
riesgo, limpia primero la configuración en caché (si existe, Laravel ignora las
variables de entorno) y usa variables explícitas de testing:

```bash
docker compose exec app php artisan config:clear
docker compose exec app sh -c "DB_CONNECTION=mysql DB_HOST=db DB_PORT=3306 DB_DATABASE=proyecto_test DB_USERNAME=laravel_user DB_PASSWORD=laravel_password php artisan migrate --force"
docker compose exec app composer test
```

`composer test` ejecuta `config:clear` antes de `php artisan test`.

### Protecciones de `proyecto_db`

Tras el incidente del 2026-10-11/12 (un `php artisan test` vació `proyecto_db`
con `migrate:fresh`), hay dos protecciones que no dependen de `phpunit.xml` ni
de los `.env*`, sino de la base de datos ya resuelta en tiempo de ejecución, por
lo que también funcionan con la configuración en caché:

1. `AppServiceProvider` llama a `DB::prohibitDestructiveCommands()` cuando
   **cualquier** conexión configurada apunta a `proyecto_db`, no solo la
   predeterminada, porque `--database=` puede elegir otra. La base de cada
   conexión se calcula aplicando `DB_URL` igual que Laravel al conectarse (la
   URL tiene prioridad sobre `DB_DATABASE`). Si la configuración no se puede
   interpretar, también se bloquea. Así quedan bloqueados `migrate:fresh`,
   `migrate:refresh`, `migrate:reset`, `migrate:rollback` y `db:wipe`, incluso
   con `--force`. `migrate` y `db:seed` siguen permitidos.
2. `tests/TestCase.php` aborta cada prueba al crear la aplicación, antes de
   `RefreshDatabase` o de cualquier otra operación de base de datos, si la
   conexión no apunta a `proyecto_test`.

No uses `migrate:fresh` con el entorno normal ni intentes saltarte estas
protecciones.

### Arranque del contenedor `app` (migraciones y seeders bajo autorización)

`docker/php/entrypoint.sh` **no** ejecuta migraciones ni seeders por su cuenta:
en cada arranque solo informa qué migraciones están pendientes
(`migrate:status --pending`) y arranca `php-fpm`. El script se monta desde el
repositorio (`./docker/php/entrypoint.sh`), así que sus cambios aplican sin
reconstruir la imagen.

**Procedimiento recomendado** para aplicar migraciones o seeders: contenedores
temporales que se ejecutan una sola vez, sin el entrypoint.

```bash
# 1. Respaldo verificable (fuera del repositorio: contiene datos personales y hashes de contraseñas)
docker exec laravel_mariadb mariadb-dump -ularavel_user -p --single-transaction --routines --triggers proyecto_db > respaldo.sql

# 2. Revisar qué se ejecutaría (no modifica nada)
docker compose run --rm --no-deps --entrypoint "" app php artisan migrate:status
docker compose run --rm --no-deps --entrypoint "" app php artisan migrate --pretend

# 3. Aplicar una sola vez
docker compose run --rm --no-deps --entrypoint "" app php artisan migrate --force
docker compose run --rm --no-deps --entrypoint "" app php artisan db:seed --class=PermisosSeeder --force

# 4. Arranque normal
docker compose up -d
```

Los comandos destructivos (`migrate:fresh`, `refresh`, `reset`, `rollback`,
`db:wipe`) están bloqueados sobre `proyecto_db`.

Notas:

- Antes de migrar, revisa qué migraciones llegaron con el último `git pull`:
  `git diff --stat HEAD@{1} -- backend/database`.
- `PermisosSeeder` necesita `ADMIN_NAME`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` en
  `backend/.env`. Es idempotente: crea los permisos y el rol que falten, y el
  usuario administrador solo si no existe (nunca cambia su contraseña).
- Existen las variables `RUN_MIGRATIONS` y `RUN_SEEDERS` (por defecto `false`)
  para que el entrypoint migre o siembre al arrancar, pero **no se recomiendan**:
  `RUN_MIGRATIONS=true docker compose up -d` deja la variable guardada en el
  contenedor, y cada reinicio posterior volvería a ejecutar migraciones y
  seeders sin pedir autorización. Si alguna vez se usan, recrea después el
  contenedor sin ellas (`docker compose up -d --force-recreate app`).

### Tokens de sensores de conteo en servidores sin Shell (Render)

En cada arranque el entrypoint ejecuta `php artisan conteo:sincronizar-tokens`,
que lee `CONTEO_TOKEN_ENTRADA_01` y `CONTEO_TOKEN_SALIDA_01` (mínimo 32
caracteres) y guarda **solo su hash** en `sensor_conteo.token_hash`. No crea
sensores, no toca usuarios ni movimientos y no muestra el token. Sin esas
variables no hace nada.

1. Generar un token aleatorio de 48 caracteres (letras y números).
2. En Render → *Environment*, agregar `CONTEO_TOKEN_ENTRADA_01` con ese valor
   (las variables de entorno de Render son privadas) y desplegar.
3. En los logs del despliegue debe aparecer
   `[conteo] ENTRADA-01: token registrado (solo su hash).` y, en los
   siguientes, `el token ya está registrado.`
4. Configurar el mismo token en el dispositivo (`config.h`).

Si el sensor ya tiene **otro** token, se conserva y el log lo advierte. Para
rotarlo: cambiar la variable y definir `CONTEO_REEMPLAZAR_TOKENS=true` durante
un despliegue; después quitarla o dejarla en `false`.

## Módulo de Personalización

Desde *Ajustes › Personalización del sistema* (permisos `personalizacion.ver`,
`crear`, `editar` y `eliminar`) se administran:

| Pestaña | Contenido |
|---|---|
| Landing page | Textos de la portada, «Conócenos», visión, misión y pie; fotos del carrusel del Hero |
| Patrocinadores | Patrocinadores y textos de su sección |
| Correos electrónicos | Asunto, encabezado, saludo, introducción, mensaje, despedida, firma, aviso y pie de los correos de solicitud aprobada, rechazada y detalle; escudo de los correos; vista previa sin envío |
| Apariencia y galería | Escudo, logotipo del panel, colores institucionales y galería opcional de la landing |
| Información de contacto | Correo, teléfono, dirección, ubicación del mapa y redes sociales |

Los valores originales del sitio viven en el código
(`backend/app/Modules/Personalizacion/Configuracion/Support/Predeterminados.php`
y `frontend/GAC-Frontend/src/modulos/Personalizacion/publico/predeterminados.js`):
la tabla `personalizacion` solo guarda lo que se cambia, por lo que no necesita
seeders. Cada formulario tiene un botón para volver a los valores originales y
cada imagen, uno para restaurar la predeterminada.

### Escudo de los correos

Se usa, en orden: el escudo propio de *Correos*, el de *Apariencia* o el
original del colegio (`backend/public/img/escudo-ctp.png`, 240×240 px). Los
correos lo enlazan con una URL absoluta, que los destinatarios solo pueden ver
si es pública y HTTPS. Defínela en `backend/.env` del servidor:

```bash
PERSONALIZACION_URL_PUBLICA=https://dominio-del-backend
```

Si no se define se usa `APP_URL`. Las imágenes subidas se sirven desde
`/storage`, así que el servidor necesita el enlace `php artisan storage:link`.
