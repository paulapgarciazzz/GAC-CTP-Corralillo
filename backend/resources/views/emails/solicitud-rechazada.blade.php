<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solicitud Rechazada</title>
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
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
            color: #ef4444;
            font-size: 18px;
            margin-top: 0;
            margin-bottom: 15px;
        }
        .status-badge {
            display: inline-block;
            background-color: #ef4444;
            color: #fff;
            padding: 8px 16px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 14px;
            margin: 15px 0;
        }
        .info-section {
            background-color: #f9fafb;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-section p {
            margin: 8px 0;
            font-size: 14px;
        }
        .info-label {
            font-weight: 600;
            color: #ef4444;
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
            <h1>✗ Solicitud Rechazada</h1>
        </div>
        
        <div class="email-body">
            <h2>Estimado {{ $encargado->primer_nombre }},</h2>
            
            <p>Le informamos que su solicitud de agrupación ha sido <strong>rechazada</strong>.</p>
            
            <div class="status-badge">RECHAZADA</div>
            
            <div class="info-section">
                <p>
                    <span class="info-label">Agrupación</span>
                    <span class="info-value">{{ $agrupacion->nombre }}</span>
                </p>
            </div>
            
            <div class="info-section">
                <p>
                    <span class="info-label">Estado de la Solicitud</span>
                    <span class="info-value">{{ ucfirst($solicitud->estado->nom_estado) }}</span>
                </p>
            </div>
            
            <p>Si tiene preguntas sobre esta decisión, le recomendamos ponerse en contacto con la administración.</p>
            
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
