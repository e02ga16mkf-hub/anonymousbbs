# 本番環境用データベース設定ガイド

このドキュメントでは、匿名掲示板アプリケーションの本番環境用データベース設定について説明します。

## 目次

1. [データベースオプション](#データベースオプション)
2. [SQLite（小規模サイト向け）](#sqlite小規模サイト向け)
3. [PostgreSQL（中〜大規模サイト向け）](#postgresql中大規模サイト向け)
4. [MySQL（中〜大規模サイト向け）](#mysql中大規模サイト向け)
5. [MongoDB（ドキュメント指向）](#mongodbドキュメント指向)
6. [バックアップ戦略](#バックアップ戦略)

## データベースオプション

本番環境では、以下のデータベースオプションが利用可能です：

| データベース | 特徴 | 適した用途 |
|------------|------|----------|
| SQLite | ファイルベース、設定不要、軽量 | 小規模サイト、低トラフィック |
| PostgreSQL | 高機能、堅牢、スケーラブル | 中〜大規模サイト、高トラフィック |
| MySQL | 広く使われている、高速、使いやすい | 中〜大規模サイト、高トラフィック |
| MongoDB | ドキュメント指向、柔軟なスキーマ | 頻繁なスキーマ変更、非構造化データ |

## SQLite（小規模サイト向け）

SQLiteは設定が簡単で、小規模なサイトに適しています。

### メリット
- 設定が不要
- ファイルベースで簡単
- トランザクションサポート
- 高速な読み取り操作

### デメリット
- 同時書き込みに弱い
- サーバーレス環境では永続性に課題
- 大規模データに不向き

### 本番環境での設定

1. バックアップ戦略を実装する

```javascript
// scripts/backup-db.js
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || './database.sqlite';
const BACKUP_DIR = path.join(__dirname, '../backups');
const MAX_BACKUPS = 10;

// バックアップディレクトリがなければ作成
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// バックアップファイル名（日時を含む）
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}.sqlite`);

// データベースファイルをコピー
fs.copyFileSync(DB_PATH, backupPath);
console.log(`バックアップを作成しました: ${backupPath}`);

// 古いバックアップを削除
const backups = fs.readdirSync(BACKUP_DIR)
  .filter(file => file.startsWith('backup-'))
  .map(file => path.join(BACKUP_DIR, file))
  .sort((a, b) => fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime());

if (backups.length > MAX_BACKUPS) {
  backups.slice(MAX_BACKUPS).forEach(file => {
    fs.unlinkSync(file);
    console.log(`古いバックアップを削除しました: ${file}`);
  });
}
```

2. 定期的なバックアップをスケジュールする（package.jsonに追加）

```json
{
  "scripts": {
    "backup": "node scripts/backup-db.js"
  }
}
```

3. 外部ストレージへのバックアップを検討する（AWS S3、Google Cloud Storageなど）

## PostgreSQL（中〜大規模サイト向け）

PostgreSQLは堅牢で高機能なデータベースで、中〜大規模サイトに適しています。

### Heroku Postgresの設定

1. Heroku Postgresアドオンを追加する

```bash
heroku addons:create heroku-postgresql:hobby-dev --app your-app-name
```

2. 環境変数を確認する

```bash
heroku config --app your-app-name
# DATABASE_URL が表示されます
```

3. データベース接続設定を更新する（src/lib/db.ts）

```typescript
import { Pool } from 'pg';
import { DB_TYPE, DATABASE_URL } from './env';

let pgPool: Pool | null = null;

export async function getDb() {
  if (DB_TYPE !== 'postgres') {
    throw new Error('PostgreSQLが設定されていません');
  }
  
  if (!pgPool) {
    pgPool = new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });
  }
  
  return pgPool;
}
```

### AWS RDSの設定

1. AWS RDSでPostgreSQLインスタンスを作成する
2. セキュリティグループを適切に設定する
3. 環境変数を設定する

```
DATABASE_URL=postgresql://username:password@hostname:port/database
```

## MySQL（中〜大規模サイト向け）

MySQLも広く使われているデータベースで、中〜大規模サイトに適しています。

### PlanetScaleの設定

[PlanetScale](https://planetscale.com/)はMySQLと互換性のあるサーバーレスデータベースプラットフォームです。

1. PlanetScaleアカウントを作成し、データベースを作成する
2. 接続情報を取得する
3. 環境変数を設定する

```
DATABASE_URL=mysql://username:password@hostname:port/database
```

4. データベース接続設定を更新する（mysql2パッケージが必要）

```typescript
import mysql from 'mysql2/promise';
import { DB_TYPE, DATABASE_URL } from './env';

let mysqlPool: mysql.Pool | null = null;

export async function getDb() {
  if (DB_TYPE !== 'mysql') {
    throw new Error('MySQLが設定されていません');
  }
  
  if (!mysqlPool) {
    mysqlPool = mysql.createPool(DATABASE_URL);
  }
  
  return mysqlPool;
}
```

## MongoDB（ドキュメント指向）

MongoDBはドキュメント指向のデータベースで、柔軟なスキーマが特徴です。

### MongoDB Atlasの設定

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)アカウントを作成し、クラスターを作成する
2. 接続情報を取得する
3. 環境変数を設定する

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

4. データベース接続設定を更新する（mongodbパッケージが必要）

```typescript
import { MongoClient } from 'mongodb';
import { DB_TYPE, MONGODB_URI } from './env';

let mongoClient: MongoClient | null = null;
let mongoDb: any = null;

export async function getDb() {
  if (DB_TYPE !== 'mongodb') {
    throw new Error('MongoDBが設定されていません');
  }
  
  if (!mongoClient) {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    mongoDb = mongoClient.db();
  }
  
  return mongoDb;
}
```

## バックアップ戦略

どのデータベースを選択しても、定期的なバックアップは重要です。

### バックアップの基本原則

1. **定期的なバックアップ**: 日次または時間単位でバックアップを実行する
2. **複数の保存場所**: 少なくとも2箇所以上にバックアップを保存する
3. **自動化**: バックアッププロセスを自動化する
4. **復元テスト**: 定期的にバックアップからの復元をテストする

### クラウドストレージへのバックアップ

AWS S3、Google Cloud Storage、Azure Blobなどのクラウドストレージサービスを利用すると、安全かつ冗長性の高いバックアップが可能です。

```javascript
// scripts/backup-to-s3.js の例（AWS SDKが必要）
const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const DB_PATH = process.env.DB_PATH || './database.sqlite';
const BUCKET_NAME = process.env.BACKUP_BUCKET_NAME;
const REGION = process.env.AWS_REGION || 'us-east-1';

const s3Client = new S3Client({ region: REGION });

async function uploadToS3() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const key = `backups/database-${timestamp}.sqlite`;
  
  const fileContent = fs.readFileSync(DB_PATH);
  
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileContent
  };
  
  try {
    const data = await s3Client.send(new PutObjectCommand(params));
    console.log(`バックアップをS3にアップロードしました: ${key}`);
    return data;
  } catch (err) {
    console.error('S3へのアップロードに失敗しました:', err);
    throw err;
  }
}

uploadToS3().catch(console.error);
```

### マネージドデータベースサービス

Heroku Postgres、AWS RDS、Google Cloud SQLなどのマネージドデータベースサービスは、自動バックアップ機能を提供しています。これらのサービスを利用することで、バックアップ管理の負担を軽減できます。
