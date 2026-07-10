@echo off
start "LicitaCalendario - Backend"  powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0run-backend.ps1"
start "LicitaCalendario - Frontend" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0run-frontend.ps1"
