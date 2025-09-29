: "${BACKEND_URL:=http://backend:8080/api/books}"
: "${WAIT_TIMEOUT:=40}"
: "${START_COMMAND:=npm start}"

echo "[wait] Checking backend: $BACKEND_URL (timeout ${WAIT_TIMEOUT}s)"
end=$(( $(date +%s) + WAIT_TIMEOUT ))

while true; do
  if wget -q --spider "$BACKEND_URL" 2>/dev/null; then
    echo "[wait] Backend is up! Starting frontend..."
    exec sh -c "$START_COMMAND"
  fi
  now=$(date +%s)
  if [ $now -ge $end ]; then
    echo "[wait] Timeout reached (${WAIT_TIMEOUT}s). Starting frontend anyway."
    exec sh -c "$START_COMMAND"
  fi
  echo "[wait] Backend not ready yet... retrying in 2s"
  sleep 2
done
