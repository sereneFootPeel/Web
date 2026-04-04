param(
    [int]$Port = 8081
)

$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendRoot = Split-Path -Parent $scriptRoot

Push-Location $backendRoot
try {
    $runtimeArgs = "--server.port=$Port --app.flyway.repair-before-migrate=true"

    Write-Host 'Running backend with one-time Flyway repair enabled...'
    Write-Host "Backend directory: $backendRoot"
    Write-Host "Temporary server port: $Port"
    Write-Host ''
    Write-Host 'Watch for Flyway logs such as:'
    Write-Host '  Successfully repaired schema history table ...'
    Write-Host '  Successfully validated ... migrations'
    Write-Host ''
    Write-Host 'After the backend finishes starting, press Ctrl+C to stop it.'
    Write-Host 'The repair flag is only passed to this one startup command.'
    Write-Host ''

    & ".\mvnw.cmd" spring-boot:run "-Dspring-boot.run.arguments=$runtimeArgs"
}
finally {

    Pop-Location
}

