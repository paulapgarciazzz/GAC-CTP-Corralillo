<?php

namespace Tests\Feature;

use App\Mail\SolicitudAprobadaNotification;
use App\Models\User;
use App\Modules\Personalizacion\Configuracion\Models\FotoPersonalizacion;
use App\Modules\Personalizacion\Configuracion\Support\Predeterminados;
use App\Modules\SolicitudesAgrupaciones\Models\Agrupacion;
use App\Modules\SolicitudesAgrupaciones\Models\Encargado;
use App\Modules\SolicitudesAgrupaciones\Models\Estado;
use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

// Las imágenes falsas son PNG: el GD de la imagen Docker no tiene soporte JPEG.
class PersonalizacionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    private function usuarioCon(array $permisos): User
    {
        $usuario = User::create([
            'name' => 'Usuario de prueba',
            'email' => uniqid('usuario', true) . '@ejemplo.com',
            'password' => 'secreto123',
            'activo' => true,
        ]);

        foreach ($permisos as $permiso) {
            Permission::findOrCreate($permiso, 'web');
        }
        $usuario->givePermissionTo($permisos);

        Sanctum::actingAs($usuario);

        return $usuario;
    }

    private function textosLanding(array $cambios = []): array
    {
        return [...Predeterminados::de('landing'), ...$cambios];
    }

    public function test_los_endpoints_del_panel_exigen_sesion(): void
    {
        $this->getJson('/api/personalizacion/landing')->assertUnauthorized();
        $this->putJson('/api/personalizacion/landing', $this->textosLanding())->assertUnauthorized();
        $this->postJson('/api/personalizacion/fotos')->assertUnauthorized();
    }

    public function test_cada_accion_exige_su_permiso(): void
    {
        $this->usuarioCon(['personalizacion.ver']);

        $this->getJson('/api/personalizacion/landing')->assertOk();
        $this->putJson('/api/personalizacion/landing', $this->textosLanding())->assertForbidden();
        $this->postJson('/api/personalizacion/fotos', [
            'destino' => 'hero',
            'archivo' => UploadedFile::fake()->image('foto.png'),
        ])->assertForbidden();
        $this->postJson('/api/personalizacion/apariencia/imagenes/escudo', [
            'imagen' => UploadedFile::fake()->image('escudo.png'),
        ])->assertForbidden();
    }

    public function test_sin_personalizar_se_devuelven_los_valores_originales(): void
    {
        $this->getJson('/api/public/personalizacion')
            ->assertOk()
            ->assertJsonPath('data.landing.hero_titulo', 'CTP de Corralillo')
            ->assertJsonPath('data.contacto.correo', 'ctp.decorralillo@mep.go.cr')
            ->assertJsonPath('data.apariencia.color_primario', '#0369a1')
            ->assertJsonPath('data.apariencia.escudo_url', null)
            ->assertJsonMissingPath('data.correos');
    }

    public function test_editar_textos_de_la_landing(): void
    {
        $this->usuarioCon(['personalizacion.ver', 'personalizacion.editar']);

        $this->putJson('/api/personalizacion/landing', $this->textosLanding(['vision' => 'Nueva visión.']))
            ->assertOk()
            ->assertJsonPath('data.valores.vision', 'Nueva visión.')
            ->assertJsonPath('data.predeterminados.vision', Predeterminados::de('landing')['vision']);

        $this->getJson('/api/public/personalizacion')->assertJsonPath('data.landing.vision', 'Nueva visión.');
    }

    public function test_valida_colores_y_redes_sociales(): void
    {
        $this->usuarioCon(['personalizacion.editar']);

        $this->putJson('/api/personalizacion/apariencia', [
            ...collect(Predeterminados::de('apariencia'))->except(['escudo', 'logo'])->all(),
            'color_primario' => 'red',
        ])->assertUnprocessable()->assertJsonValidationErrors('color_primario');

        $this->putJson('/api/personalizacion/contacto', [
            ...Predeterminados::de('contacto'),
            'facebook' => 'javascript:alert(1)',
        ])->assertUnprocessable()->assertJsonValidationErrors('facebook');
    }

    public function test_subir_y_restaurar_el_escudo_de_los_correos(): void
    {
        $this->usuarioCon(['personalizacion.ver', 'personalizacion.editar']);

        $this->getJson('/api/personalizacion/correos')
            ->assertJsonPath('data.escudo_efectivo.origen', 'predeterminado');

        $respuesta = $this->postJson('/api/personalizacion/apariencia/imagenes/escudo', [
            'imagen' => UploadedFile::fake()->image('escudo.png', 300, 300),
        ])->assertOk();
        Storage::disk('public')->assertExists('personalizacion/' . basename($respuesta->json('data.imagenes.escudo.url')));

        $this->getJson('/api/personalizacion/correos')
            ->assertJsonPath('data.escudo_efectivo.origen', 'apariencia');

        $this->postJson('/api/personalizacion/correos/imagenes/escudo', [
            'imagen' => UploadedFile::fake()->image('escudo-correo.png', 300, 300),
        ])->assertOk()->assertJsonPath('data.escudo_efectivo.origen', 'correos');

        $this->deleteJson('/api/personalizacion/correos/imagenes/escudo')
            ->assertOk()
            ->assertJsonPath('data.escudo_efectivo.origen', 'apariencia');

        $this->postJson('/api/personalizacion/correos/imagenes/logo', [
            'imagen' => UploadedFile::fake()->image('logo.png'),
        ])->assertNotFound();
    }

    public function test_la_vista_previa_no_envia_ni_guarda_nada(): void
    {
        Mail::fake();
        $this->usuarioCon(['personalizacion.ver']);

        $html = $this->postJson('/api/personalizacion/correos/vista-previa', [
            'tipo' => 'aprobada',
            'textos' => [...Predeterminados::de('correos')['aprobada'], 'asunto' => 'Hola {encargado}'],
        ])
            ->assertOk()
            ->assertJsonPath('data.asunto', 'Hola María')
            ->json('data.html');

        $this->assertStringContainsString('escudo-ctp.png', $html);
        $this->assertStringContainsString('Grupo de Baile Folclórico Nicoyano', $html);
        Mail::assertNothingSent();
        $this->assertDatabaseCount('personalizacion', 0);
        $this->assertDatabaseCount('solicitud_agrupacion', 0);
    }

    public function test_los_correos_reales_usan_los_textos_guardados_y_conservan_los_datos(): void
    {
        $this->usuarioCon(['personalizacion.editar']);
        $correos = collect(Predeterminados::de('correos'))->except('escudo')->all();
        $correos['aprobada']['asunto'] = 'Aprobada: {agrupacion}';
        $correos['aprobada']['despedida'] = 'Saludos cordiales.';
        $this->putJson('/api/personalizacion/correos', $correos)->assertOk();

        // Los estados base los crea la migración ensure_base_estados_exist.
        $estado = Estado::where('nom_estado', 'aprobada')->firstOrFail();
        $encargado = Encargado::create([
            'cedula' => '504440555',
            'primer_nombre' => 'Ana',
            'apellido' => 'Mora',
            'email' => 'ana@ejemplo.com',
            'numero_tel' => '88888888',
        ]);
        $agrupacion = Agrupacion::create([
            'nombre' => 'Banda Municipal',
            'ced_encargado' => $encargado->cedula,
            'lugar_procedencia' => 'Nicoya',
            'cantidad_integrantes' => 10,
        ]);
        $solicitud = SolicitudAgrupacion::create([
            'id_agrupacion' => $agrupacion->id,
            'fecha_solicitud' => now(),
            'id_estado' => $estado->id,
        ])->load('agrupacion.encargado', 'estado');

        $correo = new SolicitudAprobadaNotification($solicitud);
        $html = $correo->render();

        $this->assertSame('Aprobada: Banda Municipal', $correo->envelope()->subject);
        $this->assertStringContainsString('Saludos cordiales.', $html);
        $this->assertStringContainsString('Estimado Ana,', $html);
        $this->assertStringContainsString('Banda Municipal', $html);
        $this->assertStringContainsString('escudo-ctp.png', $html);
    }

    public function test_gestion_de_fotos_respeta_permisos_y_solo_publica_las_activas(): void
    {
        $this->usuarioCon(['personalizacion.ver', 'personalizacion.crear', 'personalizacion.editar', 'personalizacion.eliminar']);

        $foto = $this->postJson('/api/personalizacion/fotos', [
            'destino' => 'galeria',
            'archivo' => UploadedFile::fake()->image('foto.png', 800, 600),
            'titulo' => 'Desfile',
        ])->assertCreated()->json('data');

        // Galería desactivada por defecto: no se publica.
        $this->getJson('/api/public/personalizacion')->assertJsonCount(0, 'data.galeria');

        $this->putJson('/api/personalizacion/apariencia', [
            ...collect(Predeterminados::de('apariencia'))->except(['escudo', 'logo'])->all(),
            'mostrar_galeria' => true,
        ])->assertOk();
        $this->getJson('/api/public/personalizacion')->assertJsonCount(1, 'data.galeria');

        $this->putJson("/api/personalizacion/fotos/{$foto['id_foto']}", ['activo' => false])->assertOk();
        $this->getJson('/api/public/personalizacion')->assertJsonCount(0, 'data.galeria');

        $archivo = FotoPersonalizacion::findOrFail($foto['id_foto'])->archivo;
        $this->deleteJson("/api/personalizacion/fotos/{$foto['id_foto']}")->assertOk();
        Storage::disk('public')->assertMissing($archivo);
    }

    public function test_crear_y_eliminar_fotos_exigen_sus_propios_permisos(): void
    {
        $foto = FotoPersonalizacion::create(['destino' => 'hero', 'archivo' => 'personalizacion/fotos/x.jpg']);
        $this->usuarioCon(['personalizacion.ver', 'personalizacion.editar']);

        $this->postJson('/api/personalizacion/fotos', [
            'destino' => 'hero',
            'archivo' => UploadedFile::fake()->image('foto.png'),
        ])->assertForbidden();
        $this->deleteJson("/api/personalizacion/fotos/{$foto->id_foto}")->assertForbidden();
        $this->putJson("/api/personalizacion/fotos/{$foto->id_foto}", ['titulo' => 'Nuevo'])->assertOk();
        $this->assertDatabaseHas('foto_personalizacion', ['id_foto' => $foto->id_foto]);
    }

    public function test_el_rol_admin_pasa_todos_los_permisos(): void
    {
        $admin = $this->usuarioCon([]);
        $admin->assignRole(\Spatie\Permission\Models\Role::findOrCreate('admin', 'web'));

        $this->putJson('/api/personalizacion/landing', $this->textosLanding(['hero_titulo' => 'Título admin']))->assertOk();
        $this->getJson('/api/public/personalizacion')->assertJsonPath('data.landing.hero_titulo', 'Título admin');
    }

    public function test_secciones_e_imagenes_inexistentes_responden_404(): void
    {
        $this->usuarioCon(['personalizacion.ver', 'personalizacion.editar']);

        $this->getJson('/api/personalizacion/usuarios')->assertNotFound();
        $this->postJson('/api/personalizacion/landing/imagenes/escudo', [
            'imagen' => UploadedFile::fake()->image('escudo.png'),
        ])->assertNotFound();
    }

    public function test_reordenar_fotos_y_reemplazar_su_archivo(): void
    {
        $this->usuarioCon(['personalizacion.ver', 'personalizacion.crear', 'personalizacion.editar']);

        $primera = $this->postJson('/api/personalizacion/fotos', [
            'destino' => 'hero',
            'archivo' => UploadedFile::fake()->image('a.png'),
            'titulo' => 'A',
        ])->assertCreated()->json('data');
        $segunda = $this->postJson('/api/personalizacion/fotos', [
            'destino' => 'hero',
            'archivo' => UploadedFile::fake()->image('b.png'),
            'titulo' => 'B',
        ])->assertCreated()->json('data');

        $this->getJson('/api/public/personalizacion')->assertJsonPath('data.fotos_hero.0.titulo', 'A');

        $this->patchJson('/api/personalizacion/fotos/reordenar', ['fotos' => [
            ['id_foto' => $primera['id_foto'], 'orden' => 1],
            ['id_foto' => $segunda['id_foto'], 'orden' => 0],
        ]])->assertOk();
        $this->getJson('/api/public/personalizacion')
            ->assertJsonPath('data.fotos_hero.0.titulo', 'B')
            ->assertJsonPath('data.fotos_hero.1.titulo', 'A');

        $anterior = FotoPersonalizacion::findOrFail($primera['id_foto'])->archivo;
        $this->post("/api/personalizacion/fotos/{$primera['id_foto']}", [
            '_method' => 'PUT',
            'archivo' => UploadedFile::fake()->image('c.png'),
        ], ['Accept' => 'application/json'])->assertOk();

        $nuevo = FotoPersonalizacion::findOrFail($primera['id_foto'])->archivo;
        $this->assertNotSame($anterior, $nuevo);
        Storage::disk('public')->assertMissing($anterior);
        Storage::disk('public')->assertExists($nuevo);
    }

    public function test_restaurar_los_textos_predeterminados(): void
    {
        $this->usuarioCon(['personalizacion.ver', 'personalizacion.editar']);

        $this->putJson('/api/personalizacion/contacto', [
            ...Predeterminados::de('contacto'),
            'telefono' => '+506 2222 2222',
            'instagram' => null,
        ])->assertOk();
        $this->getJson('/api/public/personalizacion')
            ->assertJsonPath('data.contacto.telefono', '+506 2222 2222')
            ->assertJsonPath('data.contacto.instagram', null);

        // El botón "Restaurar" del panel envía los predeterminados que devuelve el GET.
        $predeterminados = $this->getJson('/api/personalizacion/contacto')->json('data.predeterminados');
        $this->putJson('/api/personalizacion/contacto', $predeterminados)->assertOk();

        $this->getJson('/api/public/personalizacion')
            ->assertJsonPath('data.contacto.telefono', '+506 4500 1829')
            ->assertJsonPath('data.contacto.instagram', 'https://www.instagram.com/ctpdecorralillo/');
    }

    public function test_guardar_textos_no_borra_imagenes_y_restaurar_logo_elimina_el_archivo(): void
    {
        $this->usuarioCon(['personalizacion.ver', 'personalizacion.editar']);

        $this->postJson('/api/personalizacion/apariencia/imagenes/logo', [
            'imagen' => UploadedFile::fake()->image('logo.png'),
        ])->assertOk()->assertJsonPath('data.imagenes.logo.personalizada', true);

        $this->putJson('/api/personalizacion/apariencia', [
            ...collect(Predeterminados::de('apariencia'))->except(['escudo', 'logo'])->all(),
            'color_primario' => '#123456',
        ])->assertOk()->assertJsonPath('data.imagenes.logo.personalizada', true);

        $publico = $this->getJson('/api/public/personalizacion')
            ->assertJsonPath('data.apariencia.color_primario', '#123456')
            ->json('data.apariencia.logo_url');
        $this->assertNotNull($publico);
        $ruta = 'personalizacion/' . basename($publico);
        Storage::disk('public')->assertExists($ruta);

        $this->deleteJson('/api/personalizacion/apariencia/imagenes/logo')
            ->assertOk()
            ->assertJsonPath('data.imagenes.logo.personalizada', false);
        Storage::disk('public')->assertMissing($ruta);
        $this->getJson('/api/public/personalizacion')->assertJsonPath('data.apariencia.logo_url', null);
    }

    public function test_vista_previa_de_los_tres_correos_y_escape_de_html(): void
    {
        Mail::fake();
        $this->usuarioCon(['personalizacion.ver']);
        $predeterminados = Predeterminados::de('correos');

        $esperado = [
            'aprobada' => 'Solicitud de Agrupación Aprobada',
            'rechazada' => 'Solicitud de Agrupación Rechazada',
            'detalle' => 'Detalles de su Solicitud de Agrupación',
        ];
        foreach ($esperado as $tipo => $asunto) {
            $html = $this->postJson('/api/personalizacion/correos/vista-previa', [
                'tipo' => $tipo,
                'textos' => $predeterminados[$tipo],
            ])->assertOk()->assertJsonPath('data.asunto', $asunto)->json('data.html');

            $this->assertStringContainsString('Grupo de Baile Folclórico Nicoyano', $html, $tipo);
            $this->assertStringContainsString('max-width:28%;height:auto', $html, $tipo);
        }

        $html = $this->postJson('/api/personalizacion/correos/vista-previa', [
            'tipo' => 'detalle',
            'textos' => [...$predeterminados['detalle'], 'firma' => '<script>alert(1)</script> **{agrupacion}**'],
        ])->assertOk()->json('data.html');
        $this->assertStringContainsString('&lt;script&gt;', $html);
        $this->assertStringNotContainsString('<script>', $html);
        $this->assertStringContainsString('<strong>Grupo de Baile Folclórico Nicoyano</strong>', $html);

        $this->postJson('/api/personalizacion/correos/vista-previa', [
            'tipo' => 'inexistente',
            'textos' => $predeterminados['aprobada'],
        ])->assertUnprocessable();

        Mail::assertNothingSent();
    }
}
