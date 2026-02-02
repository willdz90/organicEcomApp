# Maven Installation Script
# This script downloads Apache Maven and configures environment variables.

$MainUrl = "https://dlcdn.apache.org/maven/maven-3/3.9.12/binaries/apache-maven-3.9.12-bin.zip"
$InstallDir = "$env:USERPROFILE\apache-maven"
$JavaHomePath = "C:\Program Files\Java\jdk-21.0.10"

Write-Host "Starting Maven Installation..." -ForegroundColor Green

# 1. Set JAVA_HOME
Write-Host "Setting JAVA_HOME to $JavaHomePath..."
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", $JavaHomePath, [System.EnvironmentVariableTarget]::User)
$env:JAVA_HOME = $JavaHomePath

# 2. Download Maven
if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
}

$ZipPath = "$InstallDir\maven.zip"
Write-Host "Downloading Maven from $MainUrl..."
Invoke-WebRequest -Uri $MainUrl -OutFile $ZipPath

# 3. Extract
Write-Host "Extracting Maven..."
Expand-Archive -Path $ZipPath -DestinationPath $InstallDir -Force

# Find extracted folder name
$ExtractedFolder = Get-ChildItem -Path $InstallDir | Where-Object { $_.PSIsContainer -and $_.Name -like "apache-maven*" } | Select-Object -First 1
$MavenBin = "$($ExtractedFolder.FullName)\bin"

# 4. Add to PATH
Write-Host "Adding $MavenBin to PATH..."
$CurrentPath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::User)
if ($CurrentPath -notlike "*$MavenBin*") {
    $NewPath = "$CurrentPath;$MavenBin"
    [System.Environment]::SetEnvironmentVariable("Path", $NewPath, [System.EnvironmentVariableTarget]::User)
    $env:Path = "$env:Path;$MavenBin"
    Write-Host "PATH updated successfully." -ForegroundColor Green
} else {
    Write-Host "Maven is already in PATH." -ForegroundColor Yellow
}

# Cleanup
Remove-Item $ZipPath -Force

Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "Please restart your terminal (VS Code) to apply changes." -ForegroundColor Cyan
Write-Host "Verify with: mvn -version"
