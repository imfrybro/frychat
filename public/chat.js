// public/chat.js
const socket = io();

const loginOverlay = document.getElementById('loginOverlay');
const nameInput = document.getElementById('nameInput');
const joinBtn = document.getElementById('joinBtn');
const app = document.getElementById('app');
const meDiv = document.getElementById('me');
const messagesEl = document.getElementById('messages');
const msgForm = document.getElementById('msgForm');
const msgInput = document.getElementById('msgInput');

function addMessage(item, opts = {}) {
  const el = document.createElement('div');
  el.className = 'message';
  if (opts.system) el.classList.add('system');
  el.innerHTML = opts.system
    ? `<em>${item}</em>`
    : `<strong>${escapeHtml(item.user)}:</strong> <span>${escapeHtml(item.text)}</span>
       <div class="time">${new Date(item.time).toLocaleTimeString()}</div>`;
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

joinBtn.onclick = () => {
  const name = nameInput.value.trim() || 'Shady nigga';
  loginOverlay.style.display = 'none';
  app.classList.remove('hidden');
  meDiv.textContent = `You: ${name}, you fucker.`;
  socket.emit('join', name);
};

socket.on('history', (arr) => {
  arr.forEach(m => addMessage(m));
});

socket.on('message', (m) => addMessage(m));

socket.on('user-joined', (u) => addMessage(`${u.username} joined`, { system: true }));
socket.on('user-left', (u) => addMessage(`${u.username || 'Someone'} left`, { system: true }));

msgForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = msgInput.value;
  if (!text.trim()) return;
  socket.emit('message', text);
  msgInput.value = '';
});
