const API_URL = "https://ccs-notes-system.onrender.com";

async function register() {
  const username = user.value;
  const password = pass.value;

  const res = await fetch(`${API_URL}/api/register`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ username, password })
  });

  alert(res.ok ? "Registered!" : "User exists");
  if (res.ok) location.href = "login.html";
}

async function login() {
  const res = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ username: user.value, password: pass.value })
  });

  const data = await res.json();
  if (res.ok) {
    localStorage.setItem("userId", data.userId);
    location.href = "dashboard.html";
  } else alert("Invalid login");
}
