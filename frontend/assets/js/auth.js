
const API_URL = "https://ccs-notes-system.onrender.com";

async function login(){
  const r = await fetch(API+'/login',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({username:user.value,password:pass.value})
  });
  const d = await r.json();
  if(d.userId){ localStorage.setItem('uid',d.userId); location='dashboard.html'; }
}

async function register(){
  await fetch(API+'/register',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({username:user.value,password:pass.value})
  });
  alert('Registered!');
  location='login.html';
}
