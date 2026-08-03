/** URL / Query workshop — parse, build, encodeURIComponent. */

const SAMPLE =
  "https://user:pass@example.com:8443/docs/api?q=hello%20world&lang=zh-TW&flag#section-2";

const statusEl = document.getElementById("status");
const urlEl = document.getElementById("url");
const protocolEl = document.getElementById("protocol");
const usernameEl = document.getElementById("username");
const passwordEl = document.getElementById("password");
const hostnameEl = document.getElementById("hostname");
const portEl = document.getElementById("port");
const pathnameEl = document.getElementById("pathname");
const hashEl = document.getElementById("hash");
const paramsEl = document.getElementById("params");
const codecIn = document.getElementById("codec-in");
const codecOut = document.getElementById("codec-out");

function setStatus(text, tone = "") {
  statusEl.textContent = text || "";
  statusEl.dataset.tone = tone;
}

function clearParams() {
  paramsEl.innerHTML = "";
}

function addParam(key = "", value = "") {
  const row = document.createElement("div");
  row.className = "param-row";
  const k = document.createElement("input");
  k.type = "text";
  k.placeholder = "key";
  k.spellcheck = false;
  k.value = key;
  const v = document.createElement("input");
  v.type = "text";
  v.placeholder = "value";
  v.spellcheck = false;
  v.value = value;
  const del = document.createElement("button");
  del.type = "button";
  del.className = "ghost";
  del.textContent = "刪";
  del.addEventListener("click", () => {
    row.remove();
  });
  row.append(k, v, del);
  paramsEl.appendChild(row);
}

function readParams() {
  /** @type {{ key: string, value: string }[]} */
  const out = [];
  for (const row of paramsEl.querySelectorAll(".param-row")) {
    const inputs = row.querySelectorAll("input");
    const key = inputs[0]?.value ?? "";
    const value = inputs[1]?.value ?? "";
    if (!key && !value) continue;
    out.push({ key, value });
  }
  return out;
}

function parseUrl() {
  const raw = urlEl.value.trim();
  if (!raw) {
    setStatus("請貼上 URL", "bad");
    return;
  }
  try {
    const u = new URL(raw);
    protocolEl.value = u.protocol;
    usernameEl.value = decodeURIComponent(u.username);
    passwordEl.value = decodeURIComponent(u.password);
    hostnameEl.value = u.hostname;
    portEl.value = u.port;
    pathnameEl.value = u.pathname;
    hashEl.value = u.hash;
    clearParams();
    for (const [key, value] of u.searchParams.entries()) {
      addParam(key, value);
    }
    if (!paramsEl.children.length) addParam();
    setStatus("已解析", "ok");
  } catch (e) {
    setStatus(e instanceof Error ? e.message : String(e), "bad");
  }
}

function buildUrl() {
  try {
    const protocol = (protocolEl.value || "https:").trim();
    const host = hostnameEl.value.trim();
    if (!host) {
      setStatus("需要 hostname", "bad");
      return;
    }
    const u = new URL("https://placeholder.invalid/");
    u.protocol = protocol.endsWith(":") ? protocol : `${protocol}:`;
    u.username = usernameEl.value;
    u.password = passwordEl.value;
    u.hostname = host;
    u.port = portEl.value.trim();
    u.pathname = pathnameEl.value || "/";
    u.hash = hashEl.value || "";
    u.search = "";
    for (const { key, value } of readParams()) {
      if (!key) continue;
      u.searchParams.append(key, value);
    }
    urlEl.value = u.toString();
    setStatus("已組裝", "ok");
  } catch (e) {
    setStatus(e instanceof Error ? e.message : String(e), "bad");
  }
}

document.getElementById("btn-parse").addEventListener("click", parseUrl);
document.getElementById("btn-build").addEventListener("click", buildUrl);
document.getElementById("btn-add").addEventListener("click", () => addParam());
document.getElementById("btn-sample").addEventListener("click", () => {
  urlEl.value = SAMPLE;
  parseUrl();
});
document.getElementById("btn-clear").addEventListener("click", () => {
  urlEl.value = "";
  protocolEl.value = "";
  usernameEl.value = "";
  passwordEl.value = "";
  hostnameEl.value = "";
  portEl.value = "";
  pathnameEl.value = "";
  hashEl.value = "";
  clearParams();
  addParam();
  codecIn.value = "";
  codecOut.value = "";
  setStatus("待命");
});

document.getElementById("btn-enc").addEventListener("click", () => {
  codecOut.value = encodeURIComponent(codecIn.value);
  setStatus("已 encodeURIComponent", "ok");
});

document.getElementById("btn-dec").addEventListener("click", () => {
  try {
    codecOut.value = decodeURIComponent(codecIn.value);
    setStatus("已 decodeURIComponent", "ok");
  } catch (e) {
    setStatus(e instanceof Error ? e.message : String(e), "bad");
  }
});

document.getElementById("btn-copy-codec").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(codecOut.value);
    setStatus("已複製結果", "ok");
  } catch {
    setStatus("無法寫入剪貼簿", "bad");
  }
});

urlEl.value = SAMPLE;
addParam();
parseUrl();
