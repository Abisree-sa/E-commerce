@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM ----------------------------------------------------------------------------
@echo off
set ERROR_CODE=0
set MAVEN_PROJECTBASEDIR=%~dp0
if "%MAVEN_PROJECTBASEDIR%"=="" set MAVEN_PROJECTBASEDIR=%CD%

@REM Find java.exe
if not "%JAVA_HOME%"=="" goto setJavaHome
set JAVA_EXE=java.exe
goto checkJava

:setJavaHome
set JAVA_EXE="%JAVA_HOME%\bin\java.exe"

:checkJava
%JAVA_EXE% -version >nul 2>&1
if %ERRORLEVEL%==0 goto runMaven
echo Error: JAVA_HOME is not set or java is not in PATH.
goto error

:runMaven
set MAVEN_JAVA_EXE=%JAVA_EXE%
echo [INFO] Running SALESTORM build via Java 21...
mvn %*
if %ERRORLEVEL% neq 0 goto error
goto end

:error
set ERROR_CODE=1

:end
exit /B %ERROR_CODE%
