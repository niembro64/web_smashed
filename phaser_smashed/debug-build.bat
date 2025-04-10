@echo off
echo Setting debug environment variables...
set DEBUG_PROD=true

echo Cleaning previous builds...
rmdir /s /q dist
rmdir /s /q build

echo Building React app...
call npm run build

echo Creating debug Windows executable...
call npx electron-builder build --win --dir=true --publish=never

echo Build completed - check the console for errors!
echo The app will open with DevTools enabled
cd dist\win-unpacked
start Phaser\ Smashed.exe
pause