@echo off
echo Deploying to GitHub...
git add .
set /p commit_msg="Enter commit message (default: Update website): "
if "%commit_msg%"=="" set commit_msg=Update website
git commit -m "%commit_msg%"
git push origin main
echo.
echo Deployment complete!
pause
