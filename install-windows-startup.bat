@echo off
echo ========================================================
echo  Ai Revolution Bot - Windows Auto-Start Installer
echo ========================================================
echo.
set SCRIPT_DIR=%~dp0
set TARGET_VBS=%SCRIPT_DIR%start-bot-silent.vbs
set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set SHORTCUT_VBS=%TEMP%\CreateShortcut.vbs

echo Creating startup shortcut in: %STARTUP_FOLDER%
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%SHORTCUT_VBS%"
echo sLinkFile = "%STARTUP_FOLDER%\AiRevolutionBot.lnk" >> "%SHORTCUT_VBS%"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%SHORTCUT_VBS%"
echo oLink.TargetPath = "%TARGET_VBS%" >> "%SHORTCUT_VBS%"
echo oLink.WorkingDirectory = "%SCRIPT_DIR%" >> "%SHORTCUT_VBS%"
echo oLink.Description = "Ai Revolution Facebook Automation Bot" >> "%SHORTCUT_VBS%"
echo oLink.Save >> "%SHORTCUT_VBS%"

cscript /nologo "%SHORTCUT_VBS%"
del "%SHORTCUT_VBS%"

echo.
echo [SUCCESS] Bot successfully installed to Windows Startup!
echo Whenever your PC boots, the bot will run automatically in background!
echo ========================================================
pause
