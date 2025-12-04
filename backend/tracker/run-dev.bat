@echo off
echo ====================================
echo Finance Tracker - Loading Environment
echo ====================================

REM Database Configuration
set "DB_URL=jdbc:postgresql://aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?user=postgres.gxmxpglyhzaxfmnxajey&password=BszW0Kzk2gFOo412"
set "DB_USERNAME=postgres.gxmxpglyhzaxfmnxajey"
set "DB_PASSWORD=BszW0Kzk2gFOo412"
set "DB_POOL_SIZE=10"

REM Hibernate Configuration
set "DDL_AUTO=update"
set "SHOW_SQL=true"

REM Server Configuration
set "SERVER_PORT=8080"

REM JWT Configuration (CHANGE THIS!)
set "JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
set "JWT_EXPIRATION=86400000"

REM Logging Configuration
set "LOG_LEVEL=INFO"
set "APP_LOG_LEVEL=DEBUG"
set "SECURITY_LOG_LEVEL=INFO"
set "SQL_LOG_LEVEL=INFO"
set "SQL_PARAMS_LOG_LEVEL=INFO"
set "LOG_FILE=logs/finance-tracker.log"

REM JWT Configuration
set "JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"

echo Environment variables loaded!
echo Starting Spring Boot application...
echo ====================================

mvnw.cmd spring-boot:run