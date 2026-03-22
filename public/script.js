const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const sendBtn = document.getElementById('send-btn');

// ── Cookie Consent ────────────────────────────────────────────
(function () {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  if (!localStorage.getItem('cookie_consent')) {
    banner.classList.add('visible');
  }

  document.getElementById('cookie-accept').addEventListener('click', function () {
    localStorage.setItem('cookie_consent', 'accepted');
    banner.classList.remove('visible');
  });

  document.getElementById('cookie-decline').addEventListener('click', function () {
    localStorage.setItem('cookie_consent', 'declined');
    banner.classList.remove('visible');
  });
}());

// ── Chat ──────────────────────────────────────────────────────
function appendMessage(role, text) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('message', role === 'user' ? 'user-message' : 'assistant-message');

  const bubble = document.createElement('div');
  bubble.classList.add('message-bubble');
  bubble.textContent = text;

  wrapper.appendChild(bubble);
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return wrapper;
}

function showTypingIndicator() {
  const wrapper = document.createElement('div');
  wrapper.classList.add('message', 'assistant-message');
  wrapper.id = 'typing-indicator';

  const bubble = document.createElement('div');
  bubble.classList.add('message-bubble', 'typing-dots');
  bubble.innerHTML = '<span></span><span></span><span></span>';

  wrapper.appendChild(bubble);
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) indicator.remove();
}

if (chatForm) {
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const message = userInput.value.trim();
    if (!message) return;

    appendMessage('user', message);
    userInput.value = '';
    sendBtn.disabled = true;
    showTypingIndicator();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      removeTypingIndicator();

      if (response.ok) {
        appendMessage('assistant', data.reply);
      } else {
        appendMessage('assistant', `⚠️ Error: ${data.error || 'Something went wrong.'}`);
      }
    } catch (err) {
      removeTypingIndicator();
      appendMessage('assistant', '⚠️ Network error — please check your connection and try again.');
    } finally {
      sendBtn.disabled = false;
      userInput.focus();
    }
  });
}
