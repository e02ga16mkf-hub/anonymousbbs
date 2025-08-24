@echo off
echo ===== 匿名掲示板セットアップ =====
echo.

echo Node.jsのバージョンを確認しています...
node --version
if %errorlevel% neq 0 (
  echo Node.jsがインストールされていません。
  echo https://nodejs.org/ja/ からNode.jsをインストールしてください。
  pause
  exit /b 1
)

echo.
echo 依存関係をインストールしています...
call npm install
if %errorlevel% neq 0 (
  echo 依存関係のインストールに失敗しました。
  pause
  exit /b 1
)

echo.
echo データベースを初期化しています...
call node scripts/init-db.js
if %errorlevel% neq 0 (
  echo データベースの初期化に失敗しました。
  pause
  exit /b 1
)

echo.
echo 開発サーバーを起動しています...
echo ブラウザで http://localhost:3000 にアクセスしてください。
echo 終了するには Ctrl+C を押してください。
echo.
call npm run dev

pause