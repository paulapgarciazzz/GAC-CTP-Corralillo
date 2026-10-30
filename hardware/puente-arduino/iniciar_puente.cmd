@echo off
rem Doble clic para iniciar el puente de conteo contra Render.
rem Pasa los parametros a iniciar_puente.ps1 (p. ej. -ProbarConexion, -SoloLatido).
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0iniciar_puente.ps1" %*
echo.
pause
