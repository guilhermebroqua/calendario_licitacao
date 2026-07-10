
$ErrorActionPreference = "Stop"

$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    Write-Host "Carregando variaveis de ambiente de: $envFile" -ForegroundColor Cyan
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $key, $value = $line -split '=', 2
            $key = $key.Trim()
            $value = $value.Trim().Trim('"').Trim("'")
            [System.Environment]::SetEnvironmentVariable($key, $value, [System.EnvironmentVariableTarget]::Process)
        }
    }
}

$javaHome = $env:JAVA_HOME
if (-not $javaHome -or -not (Test-Path "$javaHome\bin\java.exe")) {
    $candidates = Get-ChildItem "C:\Program Files\Java" -Directory -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -match "jdk-(1[7-9]|[2-9][0-9])" } |
        Sort-Object Name -Descending
    if ($candidates) {
        $javaHome = $candidates[0].FullName
    } else {
        Write-Error "Nenhum JDK 17+ encontrado em C:\Program Files\Java. Instale um JDK 17+ ou defina `$env:JAVA_HOME manualmente."
        exit 1
    }
}

$env:JAVA_HOME = $javaHome
$env:PATH = "$javaHome\bin;$env:PATH"

if (-not (Get-Command "mvn" -ErrorAction SilentlyContinue)) {
    $nbMaven = "C:\Program Files\Apache NetBeans\java\maven\bin"
    if (Test-Path $nbMaven) {
        $env:PATH = "$nbMaven;$env:PATH"
    }
}

Write-Host "Usando JAVA_HOME = $javaHome" -ForegroundColor Cyan

$existing = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Porta 8080 ja em uso (PID $($existing.OwningProcess -join ', ')). Encerrando processo(s)..." -ForegroundColor Yellow
    $existing.OwningProcess | Sort-Object -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 1
}

Set-Location "$PSScriptRoot\backend"

$profile = "dev"
if ($env:SPRING_PROFILES_ACTIVE) {
    $profile = $env:SPRING_PROFILES_ACTIVE
}

if ($profile -eq "supabase") {
    Write-Host "Subindo backend em http://localhost:8080 (perfil supabase, banco PostgreSQL do Supabase)..." -ForegroundColor Green
} else {
    Write-Host "Subindo backend em http://localhost:8080 (perfil $profile, banco H2 em memoria)..." -ForegroundColor Green
}

mvn spring-boot:run "-Dspring-boot.run.profiles=$profile"
