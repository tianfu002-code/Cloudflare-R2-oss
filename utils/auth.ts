export function get_auth_status(context) {
  var dopath = context.request.url.split("/api/write/items/")[1];

  if (context.env["GUEST"]) {
    if (dopath.startsWith("_$flaredrive$/thumbnails/")) return true;
    const allow_guest = context.env["GUEST"].split(",");
    for (var aa of allow_guest) {
      if (aa == "*") { return true; }
      else if (dopath.startsWith(aa)) { return true; }
    }
  }

  var headers = new Headers(context.request.headers);
  if (!headers.get('Authorization')) return false;
  const Authorization = headers.get('Authorization').split("Basic ")[1];
  const account = atob(Authorization);
  if (!account) return false;

  // 从合法变量名的 ADMIN_USERS 里查账号，格式 "admin:223311=*,user1:123456=user1/,userPublic/"
  var allow_str = context.env[account] || null;
  if (!allow_str && context.env["ADMIN_USERS"]) {
    const users = context.env["ADMIN_USERS"].split(";");
    for (var u of users) {
      u = u.trim();
      if (!u) continue;
      const idx = u.indexOf("=");
      if (idx < 0) continue;
      if (u.slice(0, idx).trim() === account) {
        allow_str = u.slice(idx + 1).trim();
        break;
      }
    }
  }
  if (!allow_str) return false;

  if (dopath.startsWith("_$flaredrive$/thumbnails/")) return true;
  const allow = allow_str.split(",");
  for (var a of allow) {
    if (a == "*") { return true; }
    else if (dopath.startsWith(a)) { return true; }
  }
  return false;
}
