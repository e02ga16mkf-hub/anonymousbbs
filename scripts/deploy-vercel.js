#!/usr/bin/env node

/**
 * Vercelへのデプロイスクリプト
 * 
 * 使用方法:
 * node scripts/deploy-vercel.js [環境]
 * 
 * 環境:
 * - production: 本番環境へデプロイ
 * - preview: プレビュー環境へデプロイ
 * - development: 開発環境へデプロイ
 * 
 * 例:
 * node scripts/deploy-vercel.js production
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 引数から環境を取得
const environment = process.argv[2] || 'preview';
const validEnvironments = ['production', 'preview', 'development'];

if (!validEnvironments.includes(environment)) {
  console.error(`エラー: 無効な環境です。${validEnvironments.join(', ')}のいずれかを指定してください。`);
  process.exit(1);
}

// デプロイ前の準備
console.log('デプロイ前の準備を開始します...');

// package.jsonの確認
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
  
  // 必要な依存関係の確認
  const requiredDeps = ['next', 'react', 'react-dom', 'sqlite3', 'sqlite'];
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length > 0) {
    console.error(`エラー: 以下の依存関係が不足しています: ${missingDeps.join(', ')}`);
    process.exit(1);
  }
  
  console.log('package.jsonの確認が完了しました');
} catch (err) {
  console.error('package.jsonの読み込みに失敗しました:', err);
  process.exit(1);
}

// vercel.jsonの確認
if (!fs.existsSync(path.join(process.cwd(), 'vercel.json'))) {
  console.warn('警告: vercel.jsonが見つかりません。デフォルト設定でデプロイします。');
}

// デプロイ実行
console.log(`Vercelへの${environment}環境デプロイを開始します...`);

try {
  // Vercel CLIがインストールされているか確認
  try {
    execSync('vercel --version', { stdio: 'ignore' });
  } catch (err) {
    console.log('Vercel CLIがインストールされていません。インストールします...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
  }
  
  // 環境に応じたデプロイコマンドを実行
  let deployCommand = 'vercel';
  
  if (environment === 'production') {
    deployCommand += ' --prod';
  }
  
  // 自動承認オプションを追加
  deployCommand += ' --yes';
  
  console.log(`実行コマンド: ${deployCommand}`);
  execSync(deployCommand, { stdio: 'inherit' });
  
  console.log(`\n${environment}環境へのデプロイが完了しました！`);
} catch (err) {
  console.error('デプロイ中にエラーが発生しました:', err);
  process.exit(1);
}
