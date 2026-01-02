const API_URL = "https://ccs-notes-system.onrender.com";
const userId = localStorage.getItem("userId");
if (!userId) location.href = "login.html";

let activeFolder = null;
let notesCache = [];

async function loadProfile() {
  const r = await fetch(`${API_URL}/api/user/${userId}`);
  const u = await r.json();
  welcome.innerText = `Welcome, ${u.username}`;
}

async function loadFolders() {
  const r = await fetch(`${API_URL}/api/folders/${userId}`);
  const f = await r.json();
  folders.innerHTML = "";
  f.forEach(x => {
    const li = document.createElement("li");
    li.style.background = x.color;
    li.innerText = x.name;
    li.onclick = () => { activeFolder = x.id; loadNotes(); };
    folders.appendChild(li);
  });
}

async function addFolder() {
  const name = prompt("Folder name");
  const color = prompt("Color hex (#4b6cb7)");
  await fetch(`${API_URL}/api/folders`, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({userId,name,color})
  });
  loadFolders();
}

async function loadNotes() {
  const r = await fetch(`${API_URL}/api/notes/${userId}`);
  notesCache = await r.json();
  renderNotes();
}

function renderNotes(filter="") {
  notes.innerHTML="";
  notesCache
    .filter(n => (!activeFolder || n.folder_id===activeFolder))
    .filter(n => n.content.includes(filter))
    .forEach(n => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${n.content}
        <small>${new Date(n.created_at).toLocaleString()}</small>
        <button onclick="edit(${n.id},'${n.content}')">✏️</button>`;
      notes.appendChild(li);
    });
}

async function addNote() {
  await fetch(`${API_URL}/api/notes`, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      userId,
      folderId: activeFolder,
      content: noteInput.value
    })
  });
  noteInput.value="";
  loadNotes();
}

function edit(id, oldText) {
  const n = prompt("Edit note", oldText);
  fetch(`${API_URL}/api/notes/${id}`,{
    method:"PUT",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({content:n})
  }).then(loadNotes);
}

function logout() {
  localStorage.clear();
  location.href="login.html";
}

loadProfile();
loadFolders();
loadNotes();
