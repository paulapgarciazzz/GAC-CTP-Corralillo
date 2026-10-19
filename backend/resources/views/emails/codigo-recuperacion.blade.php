<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Código para restablecer tu contraseña</title>
</head>
<body>
    <h1>Restablecer contraseña</h1>

    <p>Usa este código para restablecer tu contraseña:</p>

    <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px;">{{ $codigo }}</p>

    <p>El código vence en {{ $minutosVigencia }} minutos. Si no solicitaste este cambio, ignora este correo.</p>

    <hr>

    <p>
        Sistema de Gestión de Actividades Complementarias<br>
        CTP Corralillo
    </p>
</body>
</html>
