@echo off
echo Running REGRESSION tests...

npm run regression
npm run allure:report

pause
