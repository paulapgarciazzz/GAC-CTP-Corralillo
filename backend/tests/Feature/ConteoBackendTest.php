<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modules\Conteo\Models\SensorConteo;
use Carbon\Carbon;
use Database\Seeders\SensorConteoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class ConteoBackendTest extends TestCase
{
    use RefreshDatabase;

    private const URL_MOVIMIENTOS = '/api/conteo/dispositivo/movimientos';

    private SensorConteo $sensorEntrada;

    private SensorConteo $sensorSalida;

    private string $tokenEntrada;

    private string $tokenSalida;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->sensorEntrada = SensorConteo::create([
            'nombre' => 'Entrada principal',
            'tipo' => 'entrada',
            'codigo' => 'ENTRADA-01',
            'activo' => true,
        ]);

        $this->sensorSalida = SensorConteo::create([
            'nombre' => 'Salida principal',
            'tipo' => 'salida',
            'codigo' => 'SALIDA-01',
            'activo' => true,
        ]);

        $this->tokenEntrada = $this->sensorEntrada->generarToken();
        $this->tokenSalida = $this->sensorSalida->generarToken();
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    private function comoSensor(string $codigo, ?string $token): static
    {
        // withHeaders acumula entre peticiones: se limpian para que cada
        // envío lleve solo las credenciales indicadas.
        return $this->flushHeaders()->withHeaders(array_filter([
            'X-Sensor-Codigo' => $codigo,
            'Authorization' => $token ? "Bearer {$token}" : null,
        ]));
    }

    private function enviarEntrada(string $evento)
    {
        return $this->comoSensor('ENTRADA-01', $this->tokenEntrada)
            ->postJson(self::URL_MOVIMIENTOS, ['identificador_evento' => $evento]);
    }

    private function enviarSalida(string $evento)
    {
        return $this->comoSensor('SALIDA-01', $this->tokenSalida)
            ->postJson(self::URL_MOVIMIENTOS, ['identificador_evento' => $evento]);
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

    /*
    | Dispositivos
    */

    public function test_registra_movimiento_de_entrada_correctamente(): void
    {
        $this->enviarEntrada('ENTRADA-01-1-1')
            ->assertCreated()
            ->assertJsonPath('data.id_sensor', $this->sensorEntrada->id_sensor)
            ->assertJsonPath('data.tipo', 'entrada')
            ->assertJsonPath('duplicado', false);

        $this->assertDatabaseHas('movimiento_conteo', [
            'id_sensor' => $this->sensorEntrada->id_sensor,
            'tipo' => 'entrada',
            'identificador_evento' => 'ENTRADA-01-1-1',
        ]);
    }

    public function test_dos_sensores_independientes_registran_su_propio_tipo(): void
    {
        $this->enviarEntrada('ENTRADA-01-1-1')->assertCreated()->assertJsonPath('data.tipo', 'entrada');
        $this->enviarSalida('SALIDA-01-1-1')->assertCreated()->assertJsonPath('data.tipo', 'salida');

        $this->assertDatabaseHas('movimiento_conteo', ['identificador_evento' => 'SALIDA-01-1-1', 'tipo' => 'salida']);
    }

    public function test_el_tipo_y_el_sensor_salen_de_las_credenciales_y_no_del_cuerpo(): void
    {
        $this->comoSensor('ENTRADA-01', $this->tokenEntrada)
            ->postJson(self::URL_MOVIMIENTOS, [
                'identificador_evento' => 'evt-1',
                'tipo' => 'salida',
                'id_sensor' => $this->sensorSalida->id_sensor,
            ])
            ->assertCreated()
            ->assertJsonPath('data.tipo', 'entrada')
            ->assertJsonPath('data.id_sensor', $this->sensorEntrada->id_sensor);
    }

    public function test_la_fecha_y_hora_las_genera_el_servidor_y_no_el_cliente(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-22 09:15:30', 'America/Costa_Rica'));

        $this->comoSensor('ENTRADA-01', $this->tokenEntrada)
            ->postJson(self::URL_MOVIMIENTOS, [
                'identificador_evento' => 'evt-1',
                'ocurrido_en' => '2020-01-01 00:00:00',
            ])
            ->assertCreated()
            ->assertJsonPath('data.ocurrido_en', '2026-10-22 09:15:30');
    }

    public function test_un_reintento_con_el_mismo_evento_no_cuenta_dos_veces(): void
    {
        $this->enviarEntrada('ENTRADA-01-1-7')->assertCreated();

        $this->enviarEntrada('ENTRADA-01-1-7')
            ->assertOk()
            ->assertJsonPath('duplicado', true)
            ->assertJsonPath('data.identificador_evento', 'ENTRADA-01-1-7');

        $this->assertDatabaseCount('movimiento_conteo', 1);
    }

    public function test_un_evento_de_otro_sensor_no_se_reutiliza(): void
    {
        $this->enviarEntrada('evt-compartido')->assertCreated();

        $this->enviarSalida('evt-compartido')->assertStatus(409);

        $this->assertDatabaseCount('movimiento_conteo', 1);
    }

    public function test_sin_credenciales_no_se_registran_movimientos(): void
    {
        $this->postJson(self::URL_MOVIMIENTOS, ['identificador_evento' => 'evt-1'])->assertUnauthorized();

        $this->comoSensor('ENTRADA-01', null)
            ->postJson(self::URL_MOVIMIENTOS, ['identificador_evento' => 'evt-2'])
            ->assertUnauthorized();

        $this->assertDatabaseCount('movimiento_conteo', 0);
    }

    public function test_un_token_incorrecto_o_de_otro_sensor_es_rechazado(): void
    {
        $this->comoSensor('ENTRADA-01', 'token-inventado')
            ->postJson(self::URL_MOVIMIENTOS, ['identificador_evento' => 'evt-1'])
            ->assertUnauthorized();

        $this->comoSensor('ENTRADA-01', $this->tokenSalida)
            ->postJson(self::URL_MOVIMIENTOS, ['identificador_evento' => 'evt-2'])
            ->assertUnauthorized();

        $this->comoSensor('NO-EXISTE', $this->tokenEntrada)
            ->postJson(self::URL_MOVIMIENTOS, ['identificador_evento' => 'evt-3'])
            ->assertUnauthorized();

        $this->assertDatabaseCount('movimiento_conteo', 0);
    }

    public function test_un_sensor_sin_token_generado_no_puede_autenticarse(): void
    {
        SensorConteo::create(['nombre' => 'Nuevo', 'tipo' => 'entrada', 'codigo' => 'ENTRADA-02', 'activo' => true]);

        $this->comoSensor('ENTRADA-02', 'cualquier-cosa')
            ->postJson(self::URL_MOVIMIENTOS, ['identificador_evento' => 'evt-1'])
            ->assertUnauthorized();
    }

    public function test_rechaza_sensor_inactivo(): void
    {
        $this->sensorEntrada->update(['activo' => false]);

        $this->enviarEntrada('evt-1')->assertForbidden();

        $this->assertDatabaseCount('movimiento_conteo', 0);
    }

    public function test_requiere_identificador_evento_valido(): void
    {
        $this->comoSensor('ENTRADA-01', $this->tokenEntrada)
            ->postJson(self::URL_MOVIMIENTOS, [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['identificador_evento']);

        $this->enviarEntrada("evt con espacios'")
            ->assertStatus(422)
            ->assertJsonValidationErrors(['identificador_evento']);
    }

    public function test_el_latido_registra_la_ultima_senal_sin_crear_movimientos(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-22 10:00:00', 'America/Costa_Rica'));

        $this->comoSensor('SALIDA-01', $this->tokenSalida)
            ->postJson('/api/conteo/dispositivo/latido')
            ->assertOk()
            ->assertJsonPath('data.codigo', 'SALIDA-01')
            ->assertJsonPath('data.tipo', 'salida');

        $this->assertSame('2026-10-22 10:00:00', $this->sensorSalida->fresh()->ultima_senal_en->toDateTimeString());
        $this->assertDatabaseCount('movimiento_conteo', 0);
    }

    public function test_el_token_no_se_guarda_en_claro(): void
    {
        $sensor = $this->sensorEntrada->fresh();

        $this->assertNotSame($this->tokenEntrada, $sensor->token_hash);
        $this->assertSame(hash('sha256', $this->tokenEntrada), $sensor->token_hash);
        $this->assertArrayNotHasKey('token_hash', $sensor->toArray());
    }

    /*
    | Panel
    */

    public function test_los_endpoints_del_panel_exigen_sesion(): void
    {
        $this->getJson('/api/conteo/movimientos')->assertUnauthorized();
        $this->getJson('/api/conteo/ocupacion-actual')->assertUnauthorized();
        $this->getJson('/api/conteo/sensores')->assertUnauthorized();
        $this->getJson('/api/conteo/reporte?fecha=2026-10-22')->assertUnauthorized();
    }

    public function test_los_endpoints_del_panel_exigen_el_permiso_conteo_ver(): void
    {
        $this->usuarioCon(['calendario.ver']);

        $this->getJson('/api/conteo/ocupacion-actual')->assertForbidden();
        $this->getJson('/api/conteo/reporte?fecha=2026-10-22')->assertForbidden();

        $this->usuarioCon(['conteo.ver']);

        $this->getJson('/api/conteo/ocupacion-actual')->assertOk();
        $this->getJson('/api/conteo/movimientos')->assertOk();
        $this->getJson('/api/conteo/reporte?fecha=2026-10-22')->assertOk();
    }

    public function test_la_sesion_del_panel_no_sirve_para_registrar_movimientos(): void
    {
        $this->usuarioCon(['conteo.ver', 'conteo.crear']);

        $this->postJson(self::URL_MOVIMIENTOS, ['identificador_evento' => 'evt-1'])->assertUnauthorized();
    }

    public function test_los_sensores_muestran_su_estado_sin_exponer_el_token(): void
    {
        $this->comoSensor('ENTRADA-01', $this->tokenEntrada)->postJson('/api/conteo/dispositivo/latido')->assertOk();

        $this->usuarioCon(['conteo.ver']);

        $respuesta = $this->getJson('/api/conteo/sensores')->assertOk();

        $entrada = collect($respuesta->json('data'))->firstWhere('codigo', 'ENTRADA-01');
        $salida = collect($respuesta->json('data'))->firstWhere('codigo', 'SALIDA-01');

        $this->assertTrue($entrada['en_linea']);
        $this->assertTrue($entrada['tiene_credenciales']);
        $this->assertFalse($salida['en_linea']);
        $this->assertStringNotContainsString($this->tokenEntrada, $respuesta->getContent());
        $this->assertStringNotContainsString('token_hash', $respuesta->getContent());
    }

    public function test_la_ocupacion_actual_refleja_entradas_y_salidas_del_dia(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-22 08:00:00', 'America/Costa_Rica'));

        $this->enviarEntrada('e1');
        $this->enviarEntrada('e2');
        $this->enviarEntrada('e3');
        $this->enviarSalida('s1');

        $this->usuarioCon(['conteo.ver']);

        $this->getJson('/api/conteo/ocupacion-actual')
            ->assertOk()
            ->assertJsonPath('data.entradas_hoy', 3)
            ->assertJsonPath('data.salidas_hoy', 1)
            ->assertJsonPath('data.ocupacion_estimada', 2)
            ->assertJsonPath('data.ultimo_movimiento_en', '2026-10-22 08:00:00');
    }

    public function test_una_salida_sin_entrada_previa_no_anula_entradas_posteriores(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-22 07:00:00', 'America/Costa_Rica'));
        $this->enviarSalida('s1');
        $this->enviarSalida('s2');

        Carbon::setTestNow(Carbon::parse('2026-10-22 07:30:00', 'America/Costa_Rica'));
        $this->enviarEntrada('e1');
        $this->enviarEntrada('e2');

        $this->usuarioCon(['conteo.ver']);

        $this->getJson('/api/conteo/ocupacion-actual')
            ->assertJsonPath('data.salidas_hoy', 2)
            ->assertJsonPath('data.entradas_hoy', 2)
            ->assertJsonPath('data.ocupacion_estimada', 2);
    }

    public function test_los_movimientos_de_otro_dia_no_cuentan_hoy(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-21 23:59:00', 'America/Costa_Rica'));
        $this->enviarEntrada('ayer');

        Carbon::setTestNow(Carbon::parse('2026-10-22 00:01:00', 'America/Costa_Rica'));

        $this->usuarioCon(['conteo.ver']);

        $this->getJson('/api/conteo/ocupacion-actual')
            ->assertJsonPath('data.entradas_hoy', 0)
            ->assertJsonPath('data.ocupacion_estimada', 0);
    }

    public function test_el_reporte_agrupa_por_hora_y_calcula_picos(): void
    {
        foreach (['08:05', '08:10', '08:20', '09:00'] as $i => $hora) {
            Carbon::setTestNow(Carbon::parse("2026-10-22 {$hora}:00", 'America/Costa_Rica'));
            $this->enviarEntrada("e{$i}");
        }

        Carbon::setTestNow(Carbon::parse('2026-10-22 12:30:00', 'America/Costa_Rica'));
        $this->enviarSalida('s1');

        $this->usuarioCon(['conteo.ver']);

        $respuesta = $this->getJson('/api/conteo/reporte?fecha=2026-10-22')
            ->assertOk()
            ->assertJsonPath('data.entradas', 4)
            ->assertJsonPath('data.salidas', 1)
            ->assertJsonPath('data.ocupacion_estimada_fin_dia', 3)
            ->assertJsonPath('data.ocupacion_maxima', 4)
            ->assertJsonPath('data.hora_ocupacion_maxima', '09:00')
            ->assertJsonPath('data.hora_pico_entradas', 8)
            ->assertJsonPath('data.hora_pico_salidas', 12);

        $porHora = collect($respuesta->json('data.distribucion_por_hora'))->keyBy('hora');

        $this->assertCount(24, $porHora);
        $this->assertSame(3, $porHora[8]['entradas']);
        $this->assertSame(3, $porHora[8]['ocupacion']);
        $this->assertSame(4, $porHora[10]['ocupacion']);
        $this->assertSame(1, $porHora[12]['salidas']);
        $this->assertSame(0, $porHora[7]['ocupacion']);
    }

    /*
    | Público
    */

    public function test_la_ocupacion_publica_no_requiere_sesion_y_solo_expone_la_ocupacion(): void
    {
        $this->enviarEntrada('e1');
        $this->enviarEntrada('e2');
        $this->enviarSalida('s1');

        $respuesta = $this->getJson('/api/public/conteo/ocupacion')
            ->assertOk()
            ->assertJsonPath('data.ocupacion_estimada', 1);

        $this->assertSame(['ocupacion_estimada', 'actualizado_en'], array_keys($respuesta->json('data')));
    }

    /*
    | Seeder
    */

    public function test_el_seeder_registra_entrada_y_salida_sin_duplicar_ni_borrar_tokens(): void
    {
        $hashAntes = $this->sensorEntrada->fresh()->token_hash;

        $this->seed(SensorConteoSeeder::class);
        $this->seed(SensorConteoSeeder::class);

        $this->assertDatabaseHas('sensor_conteo', ['codigo' => 'ENTRADA-01', 'tipo' => 'entrada']);
        $this->assertDatabaseHas('sensor_conteo', ['codigo' => 'SALIDA-01', 'tipo' => 'salida']);
        $this->assertDatabaseCount('sensor_conteo', 2);
        $this->assertSame($hashAntes, $this->sensorEntrada->fresh()->token_hash);
    }
}
