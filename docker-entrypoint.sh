#!/bin/sh
set -e

cat > /usr/share/nginx/html/config.js << EOF
window.__API_ROOT__ = "${API_URL_EXTERNAL:-http://localhost:5172}";
window.__IMGPROXY_URL__ = "${IMGPROXY_URL:-/images}";
EOF

exec nginx -g "daemon off;"
