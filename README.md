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
`backend/phpunit.xml` fuerza esta conexión, incluso cuando Docker inyecta las
variables de desarrollo en el contenedor `app`.

El servicio `db` crea `proyecto_test` automáticamente en una instalación nueva
mediante el script de inicialización montado en
`docker/db/init/01-create-test-database.sql`. Si el volumen `db_data` ya
existía antes de agregar ese script, créala una sola vez con:

```bash
docker compose exec db mariadb -uroot -proot_password -e "CREATE DATABASE IF NOT EXISTS proyecto_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; GRANT ALL PRIVILEGES ON proyecto_test.* TO 'laravel_user'@'%'; FLUSH PRIVILEGES;"
```

Las migraciones de pruebas se ejecutan automáticamente sobre esa base mediante
`RefreshDatabase` al correr PHPUnit. Para preparar manualmente la base sin
riesgo, usa variables explícitas de testing:

```bash
docker compose exec app sh -c "DB_CONNECTION=mysql DB_HOST=db DB_PORT=3306 DB_DATABASE=proyecto_test DB_USERNAME=laravel_user DB_PASSWORD=laravel_password php artisan migrate --force"
docker compose exec app php artisan test
```

`RefreshDatabase` y cualquier `migrate:fresh` ejecutado por PHPUnit quedan
limitados a `proyecto_test`. No uses `migrate:fresh` con el entorno normal,
porque podría borrar los datos de `proyecto_db`.