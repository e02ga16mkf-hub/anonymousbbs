const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

const db = new sqlite3.Database('./database.sqlite');

// パスワードハッシュ化関数
function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ':' + derivedKey.toString('hex'));
    });
  });
}

async function initializeDb() {
  return new Promise(async (resolve, reject) => {
    try {
      // テーブル作成
      db.serialize(() => {
        // 板テーブル
        db.run(`
          CREATE TABLE IF NOT EXISTS boards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            category TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // スレッドテーブル
        db.run(`
          CREATE TABLE IF NOT EXISTS threads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            board_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            post_count INTEGER DEFAULT 1,
            is_deleted INTEGER DEFAULT 0,
            FOREIGN KEY (board_id) REFERENCES boards (id)
          )
        `);

        // 投稿テーブル
        db.run(`
          CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            thread_id INTEGER NOT NULL,
            post_number INTEGER NOT NULL,
            name TEXT DEFAULT '名無しさん',
            email TEXT,
            content TEXT NOT NULL,
            ip_hash TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_deleted INTEGER DEFAULT 0,
            deleted_reason TEXT,
            FOREIGN KEY (thread_id) REFERENCES threads (id)
          )
        `);

        // 管理者テーブル
        db.run(`
          CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // 規制IPテーブル
        db.run(`
          CREATE TABLE IF NOT EXISTS banned_ips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip_hash TEXT NOT NULL,
            reason TEXT,
            expires_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // アクセスログテーブル
        db.run(`
          CREATE TABLE IF NOT EXISTS access_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip_hash TEXT NOT NULL,
            path TEXT NOT NULL,
            method TEXT NOT NULL,
            status_code INTEGER,
            user_agent TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // エラーログテーブル
        db.run(`
          CREATE TABLE IF NOT EXISTS error_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            error_message TEXT NOT NULL,
            stack_trace TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // 初期データ挿入
        db.get('SELECT COUNT(*) as count FROM boards', async (err, result) => {
          if (err) {
            console.error('Error checking boards:', err);
            return;
          }

          if (result.count === 0) {
            // 板の初期データ
            db.run(`
              INSERT INTO boards (name, description, category) VALUES
              ('雑談', '雑談・チャット', '生活'),
              ('ニュース', 'ニュース全般', '社会'),
              ('技術', 'プログラミング・IT', '学問'),
              ('趣味', '趣味・娯楽', '趣味')
            `);
          }
        });

        // 管理者アカウント作成
        db.get('SELECT COUNT(*) as count FROM admins', async (err, result) => {
          if (err) {
            console.error('Error checking admins:', err);
            return;
          }

          if (result.count === 0) {
            try {
              const defaultPassword = 'admin123'; // 本番環境では強力なパスワードを設定
              const passwordHash = await hashPassword(defaultPassword);
              
              db.run(`
                INSERT INTO admins (username, password_hash) VALUES (?, ?)
              `, ['admin', passwordHash], (err) => {
                if (err) {
                  console.error('Error creating admin account:', err);
                } else {
                  console.log('Default admin account created. Username: admin, Password: admin123');
                }
              });
            } catch (error) {
              console.error('Error hashing password:', error);
            }
          }
        });

        console.log('Database initialized successfully!');
        resolve();
      });
    } catch (error) {
      console.error('Database initialization error:', error);
      reject(error);
    }
  });
}

initializeDb()
  .then(() => {
    setTimeout(() => {
      db.close();
    }, 1000); // 非同期処理が完了するのを待つため少し遅延
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    db.close();
  });
