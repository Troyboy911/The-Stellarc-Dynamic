(() => {
  const chat = document.getElementById('chat');
  const input = document.getElementById('input');
  const sendBtn = document.getElementById('send');

  function addMsg(role, html) {
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = html;
    div.appendChild(bubble);
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  async function send() {
    const text = (input.value || '').trim();
    if (!text) return;
    addMsg('you', text.replace(/</g,'&lt;'));
    input.value = '';
    try {
      const res = await fetch('/api/directive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data && data.message || res.statusText);
      addMsg('bot', `<pre>${JSON.stringify(data, null, 2)}</pre>`);
    } catch (e) {
      addMsg('bot', `<pre>ERROR: ${String(e && e.message || e)}</pre>`);
    }
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) send();
  });
})();
