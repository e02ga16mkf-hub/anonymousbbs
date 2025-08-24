#!/usr/bin/env node

/**
 * Netlifyへのデプロイスクリプト
 * 
 * 使用方法:
 * node scripts/deploy-netlify.js [環境]
 * 
 * 環境:
 * - production: 本番環境へデプロイ
 * - draft: ドラフト環境へデプロイ
 * 
 * 例:
 * node scripts/deploy-netlify.js production
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 引数から環境を取得
const environment = process.argv[2] || 'draft';
const validEnvironments = ['production', 'draft'];

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
  const requiredDeps = ['next', 'react', 'react-dom'];
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

// netlify.tomlの確認
if (!fs.existsSync(path.join(process.cwd(), 'netlify.toml'))) {
  console.warn('警告: netlify.tomlが見つかりません。デフォルト設定でデプロイします。');
}

// Netlify用プラグインの確認
try {
  const devDeps = packageJson.devDependencies || {};
  if (!devDeps['@netlify/plugin-nextjs']) {
    console.log('@netlify/plugin-nextjsがインストールされていません。インストールします...');
    execSync('npm install -D @netlify/plugin-nextjs', { stdio: 'inherit' });
  }
} catch (err) {
  console.error('Netlifyプラグインのインストールに失敗しました:', err);
}

// デプロイ実行
console.log(`Netlifyへの${environment}環境デプロイを開始します...`);

try {
  // Netlify CLIがインストールされているか確認
  try {
    execSync('netlify --version', { stdio: 'ignore' });
  } catch (err) {
    console.log('Netlify CLIがインストールされていません。インストールします...');
    execSync('npm install -g netlify-cli', { stdio: 'inherit' });
  }
  
  // ビルド
  console.log('プロジェクトをビルドしています...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // 環境に応じたデプロイコマンドを実行
  let deployCommand = 'netlify deploy';
  
  if (environment === 'production') {
    deployCommand += ' --prod';
  }
  
  // 出力ディレクトリを指定
  deployCommand += ' --dir=.next';
  
  console.log(`実行コマンド: ${deployCommand}`);
  execSync(deployCommand, { stdio: 'inherit' });
  
  console.log(`\n${environment}環境へのデプロイが完了しました！`);
} catch (err) {
  console.error('デプロイ中にエラーが発生しました:', err);
  process.exit(1);
}
