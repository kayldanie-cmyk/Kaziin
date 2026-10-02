$git = "C:\Program Files\Git\bin\git.exe"
Set-Location "c:\Users\alexf\OneDrive\Desktop\Kaziin"

Write-Host "Setting up remote..." -ForegroundColor Cyan
& $git remote remove origin 2>$null
& $git remote add origin https://github.com/kayldanie-cmyk/Kaziin.git

Write-Host "Staging all files..." -ForegroundColor Cyan
& $git add .

Write-Host "Committing..." -ForegroundColor Cyan
& $git commit -m "feat: full Kaziin platform with Daraja M-Pesa integration"

Write-Host "Pushing to GitHub on branch main..." -ForegroundColor Cyan
& $git branch -M main
& $git push -u origin main

Write-Host ""
Write-Host "Done! Check https://github.com/kayldanie-cmyk/Kaziin" -ForegroundColor Green
Write-Host "Press any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
