set -e

echo "[1] pull latest"
cd /home/linuxuser/Web
git pull --ff-only origin main

echo "[2] build frontend"
cd /home/linuxuser/Web/frontend
npm install
npm run build
sudo rm -rf /var/www/philosophy/*
sudo cp -r dist/* /var/www/philosophy/

echo "[3] update database user"
mysql -uroot -p'Mmoonj10y?' <<'SQL'
CREATE USER IF NOT EXISTS 'philosophy_user'@'localhost' IDENTIFIED BY 'Mmoonj10y?';
ALTER USER 'philosophy_user'@'localhost' IDENTIFIED BY 'Mmoonj10y?';
CREATE USER IF NOT EXISTS 'philosophy_user'@'%' IDENTIFIED BY 'Mmoonj10y?';
ALTER USER 'philosophy_user'@'%' IDENTIFIED BY 'Mmoonj10y?';
GRANT ALL PRIVILEGES ON philosophy_db.* TO 'philosophy_user'@'localhost';
GRANT ALL PRIVILEGES ON philosophy_db.* TO 'philosophy_user'@'%';
FLUSH PRIVILEGES;
SQL

echo "[4] restart backend"
cd /home/linuxuser/Web/backend
chmod +x ./mvnw
if command -v fuser >/dev/null 2>&1; then
  fuser -k 8080/tcp >/dev/null 2>&1 || true
fi
nohup ./mvnw -q spring-boot:run > spring-boot.run.log 2>&1 &

echo "[5] wait and verify"
sleep 55
ss -ltnp | grep ':8080' || true
mysql -uroot -p'Mmoonj10y?' -D philosophy_db -e "SHOW TABLES LIKE 'history_%';"
curl -s -o /dev/null -w "api_status=%{http_code}\n" "http://127.0.0.1/api/history/snapshot?year=1900" || true
curl -s -o /dev/null -w "site_status=%{http_code}\n" http://127.0.0.1/ || true
