<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detalles de la Solicitud</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
        }
        .email-header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            letter-spacing: -0.5px;
        }
        .email-body {
            padding: 30px 20px;
        }
        .email-body h2 {
            color: #667eea;
            font-size: 18px;
            margin-top: 0;
            margin-bottom: 15px;
        }
        .section-title {
            color: #667eea;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 24px 0 10px;
        }
        .info-section {
            background-color: #f9fafb;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 10px 0;
            border-radius: 4px;
        }
        .info-section p {
            margin: 8px 0;
            font-size: 14px;
        }
        .info-label {
            font-weight: 600;
            color: #667eea;
            display: block;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .info-value {
            color: #333;
            font-size: 16px;
        }
        .divider {
            border: 0;
            border-top: 1px solid #e5e7eb;
            margin: 20px 0;
        }
        .email-footer {
            background-color: #f9fafb;
            color: #666;
            text-align: center;
            padding: 20px;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
        }
        .email-footer p {
            margin: 5px 0;
        }
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            .email-header {
                padding: 20px 15px;
            }
            .email-body {
                padding: 20px 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>Detalles de la Solicitud</h1>
        </div>

        <div class="email-body">
            <h2>Estimado {{ $encargado->primer_nombre }},</h2>

            <p>A continuación le compartimos los detalles registrados de su solicitud de agrupación.</p>

            <p class="section-title">Datos del encargado</p>
            <div class="info-section">
                <p>
                    <span class="info-label">
                        @switch($encargado->tipo_identificacion)
                            @case('dimex')
                                DIMEX
                                @break
                            @case('pasaporte')
                                Número de pasaporte
                                @break
                            @default
                                Cédula
                        @endswitch
                    </span>
                    <span class="info-value">{{ $encargado->cedula }}</span>
                </p>
                <p>
                    <span class="info-label">Nombre completo</span>
                    <span class="info-value">{{ $encargado->primer_nombre }} {{ $encargado->apellido }}</span>
                </p>
                <p>
                    <span class="info-label">Correo electrónico</span>
                    <span class="info-value">{{ $encargado->email }}</span>
                </p>
                <p>
                    <span class="info-label">Número de teléfono</span>
                    <span class="info-value">{{ $encargado->numero_tel }}</span>
                </p>
            </div>

            <p class="section-title">Datos de la agrupación</p>
            <div class="info-section">
                <p>
                    <span class="info-label">Nombre de la agrupación</span>
                    <span class="info-value">{{ $agrupacion->nombre }}</span>
                </p>
                <p>
                    <span class="info-label">Lugar de procedencia</span>
                    <span class="info-value">{{ $agrupacion->lugar_procedencia }}</span>
                </p>
                <p>
                    <span class="info-label">Cantidad de integrantes</span>
                    <span class="info-value">{{ $agrupacion->cantidad_integrantes }}</span>
                </p>
                @if($agrupacion->archivo_adjunto)
                <p>
                    <span class="info-label">Archivo adjunto</span>
                    <span class="info-value"><a href="{{ url('/api/agrupaciones/' . $agrupacion->id . '/archivo-adjunto') }}">Ver archivo adjunto</a></span>
                </p>
                @elseif($agrupacion->resena)
                <p>
                    <span class="info-label">Reseña</span>
                    <span class="info-value">{{ $agrupacion->resena }}</span>
                </p>
                @endif
            </div>

            <p class="section-title">Datos de la solicitud</p>
            <div class="info-section">
                <p>
                    <span class="info-label">Estado</span>
                    <span class="info-value">{{ ucfirst($solicitud->estado->nom_estado) }}</span>
                </p>
                @if($solicitud->fecha_solicitud)
                <p>
                    <span class="info-label">Fecha de solicitud</span>
                    <span class="info-value">{{ $solicitud->fecha_solicitud->format('d/m/Y') }}</span>
                </p>
                @endif
                @if($solicitud->fecha_asignada)
                <p>
                    <span class="info-label">Fecha asignada</span>
                    <span class="info-value">{{ $solicitud->fecha_asignada->format('d/m/Y') }}</span>
                </p>
                @endif
                @if($solicitud->hora_asignada)
                <p>
                    <span class="info-label">Hora asignada</span>
                    <span class="info-value">{{ $solicitud->hora_asignada }}</span>
                </p>
                @endif
                @if($solicitud->comentarios)
                <p>
                    <span class="info-label">Comentarios</span>
                    <span class="info-value">{{ $solicitud->comentarios }}</span>
                </p>
                @endif
            </div>

            <hr class="divider">

            <p style="color: #999; font-size: 12px;">Este es un correo automático del Sistema de Gestión de Actividades Complementarias. Por favor, no responda a este correo.</p>
        </div>

        <div class="email-footer">
            <p><strong>Sistema de Gestión de Actividades Complementarias</strong></p>
            <p>CTP Corralillo</p>
        </div>
    </div>
</body>
</html>
