@echo off
echo ===================================
echo CLASSIFICADOR DE FRUTAS V2.0 SETUP
echo ===================================
echo.

REM Check if renderer folder exists
if not exist "renderer" (
    echo Creating renderer folder...
    mkdir renderer
) else (
    echo Renderer folder already exists.
)

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this script in the project root folder.
    pause
    exit /b 1
)

echo.
echo Checking file structure...
echo.

REM List what we have
echo Files in root:
dir /b *.js *.json 2>nul
echo.
echo Files in renderer:
dir /b renderer\*.html renderer\*.css renderer\*.js 2>nul
echo.

echo ===================================
echo FOLDER STRUCTURE CHECK
echo ===================================
echo.
echo You should have:
echo.
echo Root folder:
echo   - main.js
echo   - preload.js
echo   - package.json
echo   - package-lock.json (created by npm install)
echo.
echo renderer folder:
echo   - home.html
echo   - home.css
echo   - home.js
echo   - index.html
echo   - styles.css
echo   - script.js
echo.

REM Check for required files
set MISSING=0

if not exist "main.js" (
    echo [MISSING] main.js
    set MISSING=1
)
if not exist "preload.js" (
    echo [MISSING] preload.js
    set MISSING=1
)
if not exist "package.json" (
    echo [MISSING] package.json
    set MISSING=1
)
if not exist "renderer\home.html" (
    echo [MISSING] renderer\home.html
    set MISSING=1
)
if not exist "renderer\home.css" (
    echo [MISSING] renderer\home.css
    set MISSING=1
)
if not exist "renderer\home.js" (
    echo [MISSING] renderer\home.js
    set MISSING=1
)
if not exist "renderer\index.html" (
    echo [MISSING] renderer\index.html
    set MISSING=1
)
if not exist "renderer\styles.css" (
    echo [MISSING] renderer\styles.css
    set MISSING=1
)
if not exist "renderer\script.js" (
    echo [MISSING] renderer\script.js
    set MISSING=1
)

if %MISSING%==1 (
    echo.
    echo [ERROR] Some files are missing!
    echo Please make sure all files are in the correct locations.
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] All required files found!
echo.
echo ===================================
echo NEXT STEPS
echo ===================================
echo.
echo 1. Install dependencies:
echo    npm install
echo.
echo 2. Run the application:
echo    npm start
echo.
pause
