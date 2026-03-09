(function() {
  'use strict';

  const SCRIPT = document.currentScript;
  const API_URL = SCRIPT?.getAttribute('data-server') || '';
  const BOT_ID = SCRIPT?.getAttribute('data-bot') || '';

  let config = null;
  let isOpen = false;
  let history = [];
  let unreadCount = 0;

  async function loadConfig() {
    try {
      const botParam = BOT_ID ? '?bot=' + BOT_ID : '';
      const res = await fetch(API_URL + '/api/config' + botParam);
      config = await res.json();
    } catch {
      config = {
        name: 'Assistent',
        welcome: 'Hoi! Hoe kan ik je helpen?',
        primary_color: '#1a1a2e',
        accent_color: '#e94560',
        avatar_letter: 'A',
        subtitle: 'Online',
        powered_by: 'Powered by AI',
      };
    }
    injectWidget();
  }

  function injectWidget() {
    const style = document.createElement('style');
    style.textContent = `
      #daia-toggle {
        position: fixed; bottom: 24px; right: 24px; z-index: 99999;
        width: 60px; height: 60px; border-radius: 50%; border: none;
        background: ${config.primary_color}; color: #fff; cursor: pointer;
        box-shadow: 0 4px 20px rgba(0,0,0,0.25); font-size: 24px;
        display: flex; align-items: center; justify-content: center;
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s;
      }
      #daia-toggle:hover { transform: scale(1.1); background: ${config.accent_color}; }
      #daia-toggle.daia-active { transform: rotate(90deg); }
      #daia-toggle.daia-active:hover { transform: rotate(90deg) scale(1.1); }

      #daia-badge {
        position: absolute; top: -4px; right: -4px;
        background: ${config.accent_color}; color: #fff;
        width: 22px; height: 22px; border-radius: 50%;
        font-size: 11px; font-weight: 700; display: none;
        align-items: center; justify-content: center;
        border: 2px solid #fff; animation: daia-pop 0.3s ease;
      }
      #daia-badge.daia-show { display: flex; }

      @keyframes daia-pop {
        0% { transform: scale(0); }
        70% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }

      #daia-widget {
        position: fixed; bottom: 96px; right: 24px; z-index: 99999;
        width: 380px; max-height: 540px; border-radius: 16px; overflow: hidden;
        box-shadow: 0 12px 40px rgba(0,0,0,0.18); display: flex;
        flex-direction: column; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #fff;
        opacity: 0; visibility: hidden;
        transform: translateY(16px) scale(0.96);
        transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), visibility 0.25s;
      }
      #daia-widget.daia-open {
        opacity: 1; visibility: visible;
        transform: translateY(0) scale(1);
      }

      .daia-header {
        background: ${config.primary_color}; color: #fff;
        padding: 16px 18px; display: flex; align-items: center; gap: 12px;
        flex-shrink: 0;
      }
      .daia-avatar {
        width: 38px; height: 38px; background: ${config.accent_color};
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        font-weight: bold; font-size: 16px; flex-shrink: 0;
      }
      .daia-header-info h4 { margin: 0; font-size: 15px; font-weight: 600; }
      .daia-header-info span { font-size: 11px; opacity: 0.7; }
      .daia-status-dot {
        display: inline-block; width: 6px; height: 6px; background: #4ade80;
        border-radius: 50%; margin-right: 4px; vertical-align: middle;
      }
      .daia-close {
        margin-left: auto; background: none; border: none; color: #fff;
        font-size: 22px; cursor: pointer; opacity: 0.6; padding: 0 4px;
        transition: opacity 0.2s;
      }
      .daia-close:hover { opacity: 1; }

      .daia-messages {
        flex: 1; overflow-y: auto; padding: 16px; display: flex;
        flex-direction: column; gap: 10px; background: #fafafa;
        min-height: 300px; max-height: 360px;
        scroll-behavior: smooth;
      }
      .daia-messages::-webkit-scrollbar { width: 4px; }
      .daia-messages::-webkit-scrollbar-track { background: transparent; }
      .daia-messages::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }

      .daia-msg {
        max-width: 82%; padding: 10px 14px; border-radius: 16px;
        font-size: 13.5px; line-height: 1.55; word-wrap: break-word;
        animation: daia-fade 0.25s ease;
      }
      @keyframes daia-fade {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .daia-msg.bot {
        background: #fff; color: #1a1a2e !important; align-self: flex-start;
        border-bottom-left-radius: 4px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        -webkit-text-fill-color: #1a1a2e;
      }
      .daia-msg.bot * { color: #1a1a2e !important; -webkit-text-fill-color: #1a1a2e; }
      .daia-msg.user {
        background: ${config.primary_color}; color: #fff;
        align-self: flex-end; border-bottom-right-radius: 4px;
      }

      .daia-typing span {
        display: inline-block; width: 6px; height: 6px; background: #bbb;
        border-radius: 50%; margin: 0 2px; animation: daia-bounce 1.2s infinite;
      }
      .daia-typing span:nth-child(2) { animation-delay: 0.2s; }
      .daia-typing span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes daia-bounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-6px); }
      }

      .daia-input-area {
        padding: 12px 14px; border-top: 1px solid #eee;
        display: flex; gap: 8px; background: #fff; flex-shrink: 0;
      }
      .daia-input-area input {
        flex: 1; padding: 10px 14px; border: 1px solid #e0e0e0;
        border-radius: 24px; font-size: 13.5px; outline: none;
        transition: border-color 0.2s; color: #1a1a2e; background: #fff;
      }
      .daia-input-area input:focus { border-color: ${config.primary_color}; }
      .daia-input-area input::placeholder { color: #bbb; }
      .daia-input-area button {
        width: 38px; height: 38px; background: ${config.primary_color};
        color: #fff; border: none; border-radius: 50%; cursor: pointer;
        font-size: 14px; transition: background 0.2s, transform 0.15s;
        flex-shrink: 0;
      }
      .daia-input-area button:hover { background: ${config.accent_color}; transform: scale(1.05); }
      .daia-input-area button:disabled { background: #ddd; cursor: not-allowed; transform: none; }

      .daia-footer {
        text-align: center; padding: 6px; font-size: 10px;
        color: #bbb; background: #fff; flex-shrink: 0;
      }
      .daia-footer a {
        color: #bbb; text-decoration: none;
        transition: color 0.2s;
      }
      .daia-footer a:hover { color: ${config.accent_color}; }

      @media (max-width: 480px) {
        #daia-widget {
          width: calc(100vw - 16px); right: 8px; bottom: 88px;
          max-height: 75vh;
        }
        #daia-toggle { bottom: 16px; right: 16px; width: 56px; height: 56px; }
      }
    `;
    document.head.appendChild(style);

    // Toggle button
    const toggle = document.createElement('button');
    toggle.id = 'daia-toggle';
    toggle.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    toggle.title = 'Chat openen';

    const badge = document.createElement('span');
    badge.id = 'daia-badge';
    badge.textContent = '1';
    toggle.appendChild(badge);

    document.body.appendChild(toggle);

    // Widget
    const widget = document.createElement('div');
    widget.id = 'daia-widget';
    widget.innerHTML = `
      <div class="daia-header">
        <div class="daia-avatar">${config.avatar_letter}</div>
        <div class="daia-header-info">
          <h4>${config.name}</h4>
          <span><span class="daia-status-dot"></span>${config.subtitle}</span>
        </div>
        <button class="daia-close" title="Sluiten">&times;</button>
      </div>
      <div class="daia-messages" id="daia-msgs">
        <div class="daia-msg bot" style="color:#1a1a2e">${config.welcome}</div>
      </div>
      <div class="daia-input-area">
        <input type="text" id="daia-input" placeholder="Typ een bericht..." autocomplete="off">
        <button id="daia-send">&#9654;</button>
      </div>
      <div class="daia-footer"><a href="https://dutchaiagency.com" target="_blank">${config.powered_by}</a></div>
    `;
    document.body.appendChild(widget);

    // Show welcome badge after 3s
    setTimeout(() => {
      if (!isOpen) {
        badge.classList.add('daia-show');
        unreadCount = 1;
      }
    }, 3000);

    // Events
    toggle.addEventListener('click', () => {
      isOpen = !isOpen;
      widget.classList.toggle('daia-open', isOpen);
      toggle.classList.toggle('daia-active', isOpen);
      toggle.innerHTML = isOpen
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
        : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';

      if (isOpen) {
        unreadCount = 0;
        badge.classList.remove('daia-show');
        document.getElementById('daia-input')?.focus();
      } else {
        // Re-add badge element (gets removed by innerHTML swap)
        if (!toggle.querySelector('#daia-badge')) {
          const newBadge = document.createElement('span');
          newBadge.id = 'daia-badge';
          newBadge.textContent = '0';
          toggle.appendChild(newBadge);
        }
      }
    });

    widget.querySelector('.daia-close').addEventListener('click', () => {
      isOpen = false;
      widget.classList.remove('daia-open');
      toggle.classList.remove('daia-active');
      toggle.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
      if (!toggle.querySelector('#daia-badge')) {
        const newBadge = document.createElement('span');
        newBadge.id = 'daia-badge';
        newBadge.textContent = '0';
        toggle.appendChild(newBadge);
      }
    });

    const inputEl = document.getElementById('daia-input');
    const sendBtn = document.getElementById('daia-send');
    const msgsEl = document.getElementById('daia-msgs');

    function addMsg(text, role) {
      const div = document.createElement('div');
      div.className = 'daia-msg ' + role;
      if (role === 'bot') {
        div.innerHTML = text.replace(/\n/g, '<br>');
        div.style.color = '#1a1a2e';
      } else {
        div.textContent = text;
      }
      msgsEl.appendChild(div);
      msgsEl.scrollTop = msgsEl.scrollHeight;
    }

    function showTyping() {
      const div = document.createElement('div');
      div.className = 'daia-msg bot daia-typing';
      div.id = 'daia-typing';
      div.innerHTML = '<span></span><span></span><span></span>';
      msgsEl.appendChild(div);
      msgsEl.scrollTop = msgsEl.scrollHeight;
    }

    function hideTyping() {
      const el = document.getElementById('daia-typing');
      if (el) el.remove();
    }

    async function send() {
      const text = inputEl.value.trim();
      if (!text) return;

      inputEl.value = '';
      addMsg(text, 'user');
      history.push({ role: 'user', content: text });

      sendBtn.disabled = true;
      showTyping();

      try {
        const chatParam = BOT_ID ? '?bot=' + BOT_ID : '';
        const res = await fetch(API_URL + '/api/chat' + chatParam, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history }),
        });
        const data = await res.json();

        hideTyping();
        if (data.reply) {
          history.push({ role: 'assistant', content: data.reply });
          addMsg(data.reply, 'bot');
        } else {
          addMsg('Er ging iets mis. Probeer het opnieuw.', 'bot');
        }
      } catch {
        hideTyping();
        addMsg('Kan geen verbinding maken.', 'bot');
      }

      sendBtn.disabled = false;
      inputEl.focus();
    }

    sendBtn.addEventListener('click', send);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') send();
    });
  }

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadConfig);
  } else {
    loadConfig();
  }
})();
