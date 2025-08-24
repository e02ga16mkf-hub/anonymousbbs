#!/usr/bin/env node

/**
 * Herokuへのデプロイスクリプト
 * 
 * 使用方法:
 * node scripts/deploy-heroku.js [アプリ名]
 * 
 * 例:
 * node scripts/deploy-heroku.js my-anonymous-bbs
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 引数からアプリ名を取得
const appName = process.argv[2];

if (!appName) {
  console.error('エラー: アプリ名を指定してください。');
  console.error('使用方法: node scripts/deploy-heroku.js [アプリ名]');
  process.exit(1);
}

// デプロイ前の準備
console.log('デプロイ前の準備を開始します...');

// package.jsonの確認
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
  
  // 必要な依存関係の確認
  const requiredDeps = ['next', 'react', 'react-dom'];
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length > 0) {
    console.error(`エラー: 以下の依存関係が不足しています: ${missingDeps.join(', ')}`);
    process.exit(1);
  }
  
  // Procfileの確認
  if (!fs.existsSync(path.join(process.cwd(), 'Procfile'))) {
    console.log('Procfileが見つかりません。作成します...');
    fs.writeFileSync(path.join(process.cwd(), 'Procfile'), 'web: npm start\nrelease: node scripts/init-db.js');
  }
  
  console.log('設定ファイルの確認が完了しました');
} catch (err) {
  console.error('設定ファイルの確認に失敗しました:', err);
  process.exit(1);
}

// デプロイ実行
console.log(`Herokuへのデプロイを開始します...`);

try {
  // Heroku CLIがインストールされているか確認
  try {
    execSync('heroku --version', { stdio: 'ignore' });
  } catch (err) {
    console.error('Heroku CLIがインストールされていません。');
    console.error('https://devcenter.heroku.com/articles/heroku-cli からインストールしてください。');
    process.exit(1);
  }
  
  // Herokuアプリの存在確認
  try {
    execSync(`heroku apps:info --app ${appName}`, { stdio: 'ignore' });
    console.log(`既存のHerokuアプリ「${appName}」にデプロイします。`);
  } catch (err) {
    console.log(`Herokuアプリ「${appName}」が見つかりません。新規作成します...`);
    execSync(`heroku apps:create ${appName}`, { stdio: 'inherit' });
  }
  
  // Herokuの環境変数を設定
  console.log('環境変数を設定しています...');
  execSync(`heroku config:set NODE_ENV=production --app ${appName}`, { stdio: 'inherit' });
  
  // SQLite用のビルドパックを追加
  console.log('ビルドパックを設定しています...');
  execSync(`heroku buildpacks:add --index 1 heroku/nodejs --app ${appName}`, { stdio: 'inherit' });
  
  // Gitリポジトリの確認
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
  } catch (err) {
    console.log('Gitリポジトリが初期化されていません。初期化します...');
    execSync('git init', { stdio: 'inherit' });
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Initial commit"', { stdio: 'inherit' });
  }
  
  // Herokuリモートの追加
  try {
    execSync('git remote | grep heroku', { stdio: 'ignore' });
  } catch (err) {
    console.log('Herokuリモートを追加します...');
    execSync(`heroku git:remote --app ${appName}`, { stdio: 'inherit' });
  }
  
  // デプロイ
  console.log('Herokuにデプロイしています...');
  execSync('git push heroku main', { stdio: 'inherit' });
  
  console.log('\nデプロイが完了しました！');
  console.log(`アプリケーションURL: https://${appName}.herokuapp.com/`);
} catch (err) {
  console.error('デプロイ中にエラーが発生しました:', err);
  process.exit(1);
}
