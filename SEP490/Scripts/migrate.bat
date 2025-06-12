@echo off
SET MIGRATION_NAME=%1
SET OUTPUT_DIR=DB/Migrations
IF "%MIGRATION_NAME%"=="" (
    echo ❌ Please provide migration name. Ex: migrate.bat AddUserTable
    exit /b 1
)

dotnet ef migrations add %MIGRATION_NAME% --output-dir %OUTPUT_DIR%


dotnet ef database update
