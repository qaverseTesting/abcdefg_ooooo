@echo off
echo Running SMOKE tests...

npm run smoke
npm run allure:report

pause
