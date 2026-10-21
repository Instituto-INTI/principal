@echo off
cd /d "%~dp0"
echo INTI Quiz Studio
if "%QUIZ_ADMIN_PASSWORD%"=="" set /p QUIZ_ADMIN_PASSWORD=Crie sua senha administrativa (minimo 8 caracteres): 
echo.
python app.py
pause
