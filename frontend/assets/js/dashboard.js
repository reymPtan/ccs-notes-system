
const API = 'http://localhost:3000/api';
const userId = localStorage.getItem('uid');
if(!userId) location='login.html';

async function load(){
  const r = await fetch(API+'/notes/'+userId);
  const notes = await r.json();
  list.innerHTML = notes.map(n=>`
    <li>${n.content}
      <button onclick="del(${n.id})">X</button>
    </li>`).join('');
}
load();

async function addNote(){
  await fetch(API+'/notes',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({userId,content:note.value})
  });
  note.value='';
  load();
}

async function del(id){
  await fetch(API+'/notes/'+id,{method:'DELETE'});
  load();
}

function logout(){
  localStorage.clear();
  location='login.html';
}
