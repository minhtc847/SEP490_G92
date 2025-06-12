@echo off
SET ROLLBACK_FILE_NAME=%1
SET OUTPUT_DIR=DB/Migrations
IF "%ROLLBACK_FILE_NAME%"=="" (
    echo ❌ Please provide rollback file name. Ex: ./Scipts/rollback.bat AddUserTable
    exit /b 1
)

dotnet ef database update %ROLLBACK_FILE_NAME%


dotnet ef migrations remove
