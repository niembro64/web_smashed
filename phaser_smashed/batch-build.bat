@echo off
echo Cleaning previous builds...
rmdir /s /q dist
rmdir /s /q build

echo Building React app...
call npm run build

echo Creating Windows executable...
call npx electron-builder build --win --dir=false

echo Build completed!
pause