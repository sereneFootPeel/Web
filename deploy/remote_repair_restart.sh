set -e

echo "[1] inspect flyway history"
mysql -uroot -p'Mmoonj10y?' -D philosophy_db -e "SELECT installed_rank, version, description, success FROM flyway_schema_history ORDER BY installed_rank;"

echo "[2] repair failed flyway rows"
mysql -uroot -p'Mmoonj10y?' -D philosophy_db -e "DELETE FROM flyway_schema_history WHERE success = 0;"

echo "[3] restart backend"
cd /home/linuxuser/Web/backend
chmod +x ./mvnw
if command -v fuser >/dev/null 2>&1; then
  fuser -k 8080/tcp >/dev/null 2>&1 || true
fi
nohup ./mvnw -q spring-boot:run > spring-boot.run.log 2>&1 &

echo "[4] wait for migrate/start"
sleep 70

echo "[5] verify"
ss -ltnp | grep ':8080' || true
mysql -uroot -p'Mmoonj10y?' -D philosophy_db -e "SHOW TABLES LIKE 'history_%';"
curl -s -o /dev/null -w "api_status=%{http_code}\n" http://127.0.0.1/api/history/countries || true
curl -s -o /dev/null -w "site_status=%{http_code}\n" http://127.0.0.1/ || true
