<#
.SYNOPSIS
  Inicia el puente USB -> API de conteo (CTP Corralillo) contra Render.

.DESCRIPTION
  - Crea el entorno Python (.venv) e instala dependencias si faltan.
  - Pide el token del sensor sin mostrarlo. Opcionalmente lo guarda FUERA del
    repositorio y de OneDrive (en %USERPROFILE%\.gac-conteo), solo legible por
    tu usuario.
  - Pasa el token al puente solo como variable de entorno del proceso y la
    borra al terminar. Nunca lo escribe en pantalla ni en logs.

.EXAMPLE
  .\iniciar_puente.ps1                  # envio real a Render
  .\iniciar_puente.ps1 -ProbarConexion  # solo API + certificado, sin token
  .\iniciar_puente.ps1 -SoloLatido      # comprueba el token sin registrar nada
  .\iniciar_puente.ps1 -Simulacion      # lee el Arduino sin enviar nada
  .\iniciar_puente.ps1 -OlvidarToken    # borra el token guardado
#>
[CmdletBinding()]
param(
    [string]$Codigo = "ENTRADA-01",
    [string]$Url = "https://gac-ctp-corralillo.onrender.com/api",
    [string]$Puerto = "auto",
    [switch]$Simulacion,
    [switch]$SoloLatido,
    [switch]$ProbarConexion,
    [switch]$OlvidarToken,
    [switch]$Eco
)

$ErrorActionPreference = "Stop"
$VariableToken = "CONTEO_SENSOR_TOKEN"
$Carpeta = $PSScriptRoot
$Python = Join-Path $Carpeta ".venv\Scripts\python.exe"
$Script = Join-Path $Carpeta "puente_conteo.py"
$CarpetaToken = Join-Path $env:USERPROFILE ".gac-conteo"
$ArchivoToken = Join-Path $CarpetaToken "$Codigo.token"

function Escribir([string]$texto, [string]$color = "Gray") { Write-Host $texto -ForegroundColor $color }

# --- Token guardado: borrar -------------------------------------------------
if ($OlvidarToken) {
    if (Test-Path $ArchivoToken) { Remove-Item $ArchivoToken -Force; Escribir "Token de $Codigo borrado de $ArchivoToken" "Green" }
    else { Escribir "No habia token guardado para $Codigo." }
    exit 0
}

# --- Entorno Python ---------------------------------------------------------
if (-not (Test-Path $Python)) {
    Escribir "Creando entorno Python en .venv (solo la primera vez)..." "Cyan"
    $base = $null
    if (Get-Command py -ErrorAction SilentlyContinue) { $base = @("py", "-3") }
    elseif (Get-Command python -ErrorAction SilentlyContinue) { $base = @("python") }
    if (-not $base) { Escribir "No se encontro Python. Instala Python 3.10+ desde python.org (marca 'Add python.exe to PATH')." "Red"; exit 1 }
    $exe = $base[0]; $resto = @(); if ($base.Count -gt 1) { $resto = $base[1..($base.Count - 1)] }
    & $exe @resto -m venv (Join-Path $Carpeta ".venv")
    if ($LASTEXITCODE -ne 0) { Escribir "No se pudo crear el entorno Python." "Red"; exit 1 }
}

$dependenciasOk = $true
try {
    & $Python -I -c "import serial, requests, certifi" 2>$null
    if ($LASTEXITCODE -ne 0) { $dependenciasOk = $false }
} catch { $dependenciasOk = $false }
if (-not $dependenciasOk) {
    Escribir "Instalando dependencias (pyserial, requests)..." "Cyan"
    & $Python -m pip install --disable-pip-version-check -q -r (Join-Path $Carpeta "requirements.txt")
    if ($LASTEXITCODE -ne 0) { Escribir "No se pudieron instalar las dependencias (revisa la conexion a internet)." "Red"; exit 1 }
}

$argumentos = @($Script, "--url", $Url, "--codigo", $Codigo, "--puerto", $Puerto)
if ($Eco) { $argumentos += "--eco" }

# --- Prueba sin token ---------------------------------------------------------
if ($ProbarConexion) {
    & $Python -I @($Script, "--url", $Url, "--probar-conexion")
    exit $LASTEXITCODE
}

# --- Simulacion: no necesita token -------------------------------------------
if ($Simulacion) {
    & $Python -I @argumentos
    exit $LASTEXITCODE
}

# --- Token --------------------------------------------------------------------
$token = $null
$definidoAntes = [bool](Get-Item "Env:$VariableToken" -ErrorAction SilentlyContinue)

if ($definidoAntes) {
    Escribir "Usando el token de la variable de entorno $VariableToken."
} elseif (Test-Path $ArchivoToken) {
    $token = (Get-Content -Raw $ArchivoToken).Trim()
    Escribir "Usando el token guardado de $Codigo ($ArchivoToken)."
} else {
    $seguro = Read-Host "Pega el token de $Codigo (no se mostrara)" -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($seguro)
    try { $token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr).Trim() }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }

    if (-not $token) { Escribir "No se ingreso ningun token." "Red"; exit 1 }

    $respuesta = Read-Host "Guardar el token en $ArchivoToken para no pedirlo de nuevo? (s/N)"
    if ($respuesta -match '^(s|si)$') {
        if ($CarpetaToken -match 'OneDrive') { Escribir "La carpeta de usuario esta dentro de OneDrive: no se guarda el token." "Yellow" }
        else {
            New-Item -ItemType Directory -Force $CarpetaToken | Out-Null
            Set-Content -Path $ArchivoToken -Value $token -NoNewline -Encoding ASCII
            # Solo tu usuario puede leerlo.
            icacls $ArchivoToken /inheritance:r /grant:r "$($env:USERNAME):(R,W)" | Out-Null
            Escribir "Token guardado fuera del repositorio (solo tu usuario puede leerlo)." "Green"
        }
    }
}

if ($SoloLatido) { $argumentos = @($Script, "--url", $Url, "--codigo", $Codigo, "--solo-latido") }
else { $argumentos += "--enviar" }

try {
    if (-not $definidoAntes) { Set-Item "Env:$VariableToken" $token }
    & $Python -I @argumentos
    $codigoSalida = $LASTEXITCODE
} finally {
    # El token no queda en la sesion de PowerShell al terminar.
    if (-not $definidoAntes) { Remove-Item "Env:$VariableToken" -ErrorAction SilentlyContinue }
    $token = $null
}
exit $codigoSalida
