/**
 * AI Chat Widget Main Script
 * This script handles the actual widget functionality after being loaded by the loader script
 */

(function() {
  // Get configuration from data attributes in the script tag
  const scripts = document.querySelectorAll('script[data-widget-id]');
  const script = scripts[scripts.length - 1]; // Get the last script with widget-id (in case multiple are present)
  
  // Extract configuration
  const config = {
    widgetId: script.getAttribute('data-widget-id'),
    primaryColor: script.getAttribute('data-primary-color') || '#4f46e5',
    borderRadius: parseInt(script.getAttribute('data-border-radius') || '8'),
    position: script.getAttribute('data-position') || 'bottom-right',
    headerTitle: script.getAttribute('data-header-title') || 'AI Chat Assistant',
    initialMessage: script.getAttribute('data-initial-message') || 'Hello! How can I help you today?',
    inputPlaceholder: script.getAttribute('data-input-placeholder') || 'Type your message...',
    sendButtonText: script.getAttribute('data-send-button-text') || 'Send',
    chatIconSize: parseInt(script.getAttribute('data-chat-icon-size') || '50'),
    mobileBehavior: script.getAttribute('data-mobile-behavior') || 'responsive',
    visitorId: script.getAttribute('data-visitor-id') || generateVisitorId(),
    requireGuestInfo: script.getAttribute('data-require-guest-info') === 'true',
  };

  // Widget state
  let state = {
    isOpen: false,
    sessionId: null,
    messages: [],
    isTyping: false,
    unreadMessages: 0,
    isGuestRegistered: false,
    guestSessionId: null,
    showGuestForm: false,
  };

  // DOM elements
  let widgetContainer;
  let chatContainer;
  let messagesList;
  let inputField;
  let guestForm;
  
  // Base URL for loading resources
  const baseUrl = (function() {
    const scriptSrc = script.src;
    return scriptSrc.substring(0, scriptSrc.indexOf('/widget/v1/'));
  })();

  // Helper functions
  function generateVisitorId() {
    return 'visitor_' + Math.random().toString(36).substring(2, 15);
  }

  function createWidgetStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .ai-chat-widget-container * {
        box-sizing: border-box;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      }
      
      .ai-chat-widget-container {
        position: fixed;
        z-index: 9999;
        margin: 0;
        padding: 0;
      }
      
      .ai-chat-widget-button {
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: transform 0.2s ease;
      }
      
      .ai-chat-widget-button:hover {
        transform: scale(1.05);
      }
      
      .ai-chat-widget-button svg {
        fill: none;
        stroke: white;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      
      .ai-chat-widget-chat {
        display: flex;
        flex-direction: column;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        background-color: white;
        max-height: 500px;
        width: 350px;
        height: 100%;
        transition: opacity 0.3s ease, transform 0.3s ease;
        overflow: hidden;
      }
      
      @media (max-width: 480px) {
        .ai-chat-widget-chat {
          width: calc(100vw - 20px);
          max-height: calc(100vh - 80px);
        }
      }
      
      .ai-chat-header {
        padding: 12px 16px;
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .ai-chat-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }
      
      .ai-chat-header-button {
        background: none;
        border: none;
        cursor: pointer;
        color: white;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s ease;
      }
      
      .ai-chat-header-button:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
      
      .ai-chat-messages {
        flex-grow: 1;
        overflow-y: auto;
        padding: 16px;
        background-color: #f9fafb;
        display: flex;
        flex-direction: column;
      }
      
      .ai-chat-message {
        margin-bottom: 12px;
        max-width: 80%;
        word-wrap: break-word;
      }
      
      .ai-chat-message-content {
        padding: 10px 12px;
        border-radius: 8px;
      }
      
      .ai-chat-message.user {
        align-self: flex-end;
      }
      
      .ai-chat-message.user .ai-chat-message-content {
        background-color: #e2e8f0;
        border-bottom-right-radius: 0;
      }
      
      .ai-chat-message.assistant .ai-chat-message-content {
        border-bottom-left-radius: 0;
      }
      
      .ai-chat-typing {
        display: flex;
        padding: 8px;
      }
      
      .ai-chat-typing span {
        width: 8px;
        height: 8px;
        margin: 0 2px;
        background-color: #a0aec0;
        border-radius: 50%;
        animation: typingAnimation 1s infinite ease-in-out;
      }
      
      .ai-chat-typing span:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      .ai-chat-typing span:nth-child(3) {
        animation-delay: 0.4s;
      }
      
      @keyframes typingAnimation {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-4px);
        }
      }
      
      .ai-chat-input-container {
        padding: 12px;
        border-top: 1px solid #e2e8f0;
        background-color: white;
      }
      
      .ai-chat-input-form {
        display: flex;
      }
      
      .ai-chat-input {
        flex-grow: 1;
        padding: 8px 12px;
        border: 1px solid #e2e8f0;
        border-right: none;
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
        outline: none;
      }
      
      .ai-chat-input:focus {
        border-color: #a0aec0;
      }
      
      .ai-chat-send-button {
        padding: 8px 16px;
        border: none;
        color: white;
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
        cursor: pointer;
      }

      .ai-chat-unread {
        position: absolute;
        top: 0;
        right: 0;
        background-color: #ef4444;
        color: white;
        font-size: 12px;
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }
      
      .ai-chat-guest-form {
        padding: 16px;
        background-color: white;
        border-radius: 8px;
        margin-bottom: 16px;
      }
      
      .ai-chat-guest-form h3 {
        margin-top: 0;
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: 500;
      }
      
      .ai-chat-guest-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        margin-bottom: 12px;
      }
      
      .ai-chat-guest-input:focus {
        border-color: #a0aec0;
        outline: none;
      }
      
      .ai-chat-guest-submit {
        width: 100%;
        padding: 8px 16px;
        border: none;
        color: white;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 8px;
      }
      
      .ai-chat-guest-error {
        color: #e53e3e;
        font-size: 12px;
        margin-top: -8px;
        margin-bottom: 12px;
      }
    `;
    document.head.appendChild(style);
  }

  function positionWidget(position) {
    const positions = {
      'bottom-right': { bottom: '20px', right: '20px' },
      'bottom-left': { bottom: '20px', left: '20px' },
      'top-right': { top: '20px', right: '20px' },
      'top-left': { top: '20px', left: '20px' }
    };
    
    return positions[position] || positions['bottom-right'];
  }

  function createWidgetButton() {
    const button = document.createElement('div');
    button.className = 'ai-chat-widget-button';
    button.style.width = `${config.chatIconSize}px`;
    button.style.height = `${config.chatIconSize}px`;
    button.style.backgroundColor = config.primaryColor;
    
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    `;
    
    button.addEventListener('click', toggleChat);
    return button;
  }

  function createGuestForm() {
    const form = document.createElement('div');
    form.className = 'ai-chat-guest-form';
    form.style.display = 'none'; // Hidden by default
    
    form.innerHTML = `
      <h3>Please provide your information to start chatting</h3>
      <input type="text" class="ai-chat-guest-input" id="ai-chat-guest-name" placeholder="Full Name *" required>
      <div class="ai-chat-guest-error" id="ai-chat-guest-name-error"></div>
      
      <input type="email" class="ai-chat-guest-input" id="ai-chat-guest-email" placeholder="Email">
      <div class="ai-chat-guest-error" id="ai-chat-guest-email-error"></div>
      
      <input type="tel" class="ai-chat-guest-input" id="ai-chat-guest-phone" placeholder="Phone Number *" required>
      <div class="ai-chat-guest-error" id="ai-chat-guest-phone-error"></div>
      
      <button type="button" class="ai-chat-guest-submit" id="ai-chat-guest-submit">Start Chatting</button>
    `;
    
    return form;
  }

  function createChatWindow() {
    const chat = document.createElement('div');
    chat.className = 'ai-chat-widget-chat';
    chat.style.borderRadius = `${config.borderRadius}px`;
    chat.style.display = 'none';
    
    // Header
    const header = document.createElement('div');
    header.className = 'ai-chat-header';
    header.style.backgroundColor = config.primaryColor;
    header.innerHTML = `
      <h3>${config.headerTitle}</h3>
      <button class="ai-chat-header-button">
        <svg width="20" height="20" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    header.querySelector('button').addEventListener('click', toggleChat);
    
    // Messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'ai-chat-messages';
    messagesList = messagesContainer;
    
    // Guest form (conditionally added)
    if (config.requireGuestInfo) {
      guestForm = createGuestForm();
      messagesContainer.appendChild(guestForm);
    }
    
    // Input area
    const inputContainer = document.createElement('div');
    inputContainer.className = 'ai-chat-input-container';
    
    const inputForm = document.createElement('form');
    inputForm.className = 'ai-chat-input-form';
    
    inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.className = 'ai-chat-input';
    inputField.placeholder = config.inputPlaceholder;
    inputField.disabled = config.requireGuestInfo; // Disabled until guest registers if required
    
    const sendButton = document.createElement('button');
    sendButton.type = 'submit';
    sendButton.className = 'ai-chat-send-button';
    sendButton.textContent = config.sendButtonText;
    sendButton.style.backgroundColor = config.primaryColor;
    
    inputForm.appendChild(inputField);
    inputForm.appendChild(sendButton);
    inputContainer.appendChild(inputForm);
    
    inputForm.addEventListener('submit', handleSubmitMessage);
    
    // Combine all elements
    chat.appendChild(header);
    chat.appendChild(messagesContainer);
    chat.appendChild(inputContainer);
    
    return chat;
  }

  function toggleChat() {
    if (!widgetContainer) return;
    
    if (state.isOpen) {
      // Close chat
      chatContainer.style.display = 'none';
      widgetContainer.querySelector('.ai-chat-widget-button').style.display = 'flex';
      state.isOpen = false;
    } else {
      // Open chat
      chatContainer.style.display = 'flex';
      widgetContainer.querySelector('.ai-chat-widget-button').style.display = 'none';
      state.isOpen = true;
      
      // Reset unread counter
      state.unreadMessages = 0;
      const unreadBadge = widgetContainer.querySelector('.ai-chat-unread');
      if (unreadBadge) unreadBadge.remove();
      
      // Show guest form if required and not registered
      if (config.requireGuestInfo && !state.isGuestRegistered) {
        guestForm.style.display = 'block';
      } else {
        // Focus input field
        setTimeout(() => {
          inputField.focus();
        }, 100);
        
        // Initialize session if not already done and guest info not required
        if (!state.sessionId && (!config.requireGuestInfo || state.isGuestRegistered)) {
          initChatSession();
        }
      }
    }
  }

  function displayMessage(message, role) {
    const messageElement = document.createElement('div');
    messageElement.className = `ai-chat-message ${role}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'ai-chat-message-content';
    
    if (role === 'assistant') {
      messageContent.style.backgroundColor = `${config.primaryColor}20`;
    }
    
    messageContent.textContent = message;
    messageElement.appendChild(messageContent);
    messagesList.appendChild(messageElement);
    
    // Scroll to bottom
    messagesList.scrollTop = messagesList.scrollHeight;
    
    // If chat is closed, increment unread counter
    if (!state.isOpen && role === 'assistant') {
      state.unreadMessages++;
      updateUnreadCounter();
    }
  }

  function updateUnreadCounter() {
    // Remove existing badge if any
    const existingBadge = widgetContainer.querySelector('.ai-chat-unread');
    if (existingBadge) existingBadge.remove();
    
    // Add new badge if needed
    if (state.unreadMessages > 0) {
      const badge = document.createElement('div');
      badge.className = 'ai-chat-unread';
      badge.textContent = state.unreadMessages > 9 ? '9+' : state.unreadMessages;
      
      const button = widgetContainer.querySelector('.ai-chat-widget-button');
      button.style.position = 'relative';
      button.appendChild(badge);
    }
  }

  function showTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.className = 'ai-chat-message assistant ai-chat-typing';
    typingElement.innerHTML = `
      <div class="ai-chat-message-content">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    messagesList.appendChild(typingElement);
    messagesList.scrollTop = messagesList.scrollHeight;
    return typingElement;
  }

  function removeTypingIndicator(element) {
    if (element && element.parentNode === messagesList) {
      messagesList.removeChild(element);
    }
  }

  async function handleSubmitMessage(e) {
    e.preventDefault();
    
    const message = inputField.value.trim();
    if (!message) return;
    
    // Clear input
    inputField.value = '';
    
    // Display user message
    displayMessage(message, 'user');
    
    // Add to state
    state.messages.push({
      role: 'user',
      content: message
    });
    
    // Show typing indicator
    state.isTyping = true;
    const typingIndicator = showTypingIndicator();
    
    // Send to backend
    try {
      const response = await sendMessage(message);
      
      // Remove typing indicator
      state.isTyping = false;
      removeTypingIndicator(typingIndicator);
      
      // Display response
      displayMessage(response.message, 'assistant');
      
      // Add to state
      state.messages.push({
        role: 'assistant',
        content: response.message
      });
    } catch (error) {
      // Remove typing indicator
      state.isTyping = false;
      removeTypingIndicator(typingIndicator);
      
      // Display error message
      displayMessage('Sorry, there was a problem processing your request. Please try again.', 'assistant');
      console.error('Chat widget error:', error);
    }
  }

  async function initChatSession(isGuest = false) {
    try {
      const payload = {
        widget_id: config.widgetId,
        visitor_id: config.visitorId,
        metadata: {
          url: window.location.href,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          language: navigator.language,
        }
      };
      
      // Add guest session ID if available
      if (isGuest && state.guestSessionId) {
        payload.guest_session_id = state.guestSessionId;
      }
      
      const response = await fetch(`${baseUrl}/api/chat/session/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to initialize chat session: ${response.statusText}`);
      }
      
      const data = await response.json();
      state.sessionId = data.session_id;
      
      // Add initial message if not a guest (guests get a personalized welcome)
      if (!isGuest && config.initialMessage) {
        displayMessage(config.initialMessage, 'assistant');
        state.messages.push({
          role: 'assistant',
          content: config.initialMessage
        });
      }
      
      // Get chat history
      await loadChatHistory();
      
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      displayMessage('Failed to initialize chat. Please try again later.', 'assistant');
    }
  }

  async function loadChatHistory() {
    if (!state.sessionId) return;
    
    try {
      const response = await fetch(`${baseUrl}/api/chat/history?session_id=${state.sessionId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chat history: ${response.statusText}`);
      }
      
      const messages = await response.json();
      
      // Clear current messages
      messagesList.innerHTML = '';
      state.messages = [];
      
      // Display messages
      messages.forEach(msg => {
        displayMessage(msg.content, msg.role);
        state.messages.push({
          role: msg.role,
          content: msg.content
        });
      });
      
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }

  async function sendMessage(message) {
    if (!state.sessionId) {
      throw new Error('Chat session not initialized');
    }
    
    const response = await fetch(`${baseUrl}/api/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session_id: state.sessionId,
        message: message,
        metadata: {
          url: window.location.href,
          timestamp: new Date().toISOString()
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }
    
    return response.json();
  }

  function registerGuestUser() {
    const nameInput = document.getElementById('ai-chat-guest-name');
    const emailInput = document.getElementById('ai-chat-guest-email');
    const phoneInput = document.getElementById('ai-chat-guest-phone');
    
    const nameError = document.getElementById('ai-chat-guest-name-error');
    const emailError = document.getElementById('ai-chat-guest-email-error');
    const phoneError = document.getElementById('ai-chat-guest-phone-error');
    
    // Reset errors
    nameError.textContent = '';
    emailError.textContent = '';
    phoneError.textContent = '';
    
    // Validate inputs
    let isValid = true;
    
    if (!nameInput.value.trim()) {
      nameError.textContent = 'Full name is required';
      isValid = false;
    }
    
    if (emailInput.value.trim() && !isValidEmail(emailInput.value)) {
      emailError.textContent = 'Please enter a valid email address';
      isValid = false;
    }
    
    if (!phoneInput.value.trim()) {
      phoneError.textContent = 'Phone number is required';
      isValid = false;
    }
    
    if (!isValid) return;
    
    // Submit form to API
    fetch(`${baseUrl}/api/guest/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullname: nameInput.value.trim(),
        email: emailInput.value.trim() || null,
        phone: phoneInput.value.trim(),
        widget_id: config.widgetId,
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Hide form and enable chat
        guestForm.style.display = 'none';
        inputField.disabled = false;
        inputField.focus();
        
        // Update state
        state.isGuestRegistered = true;
        state.guestSessionId = data.session_id;
        
        // Initialize chat session with guest info
        initChatSession(true);
        
        // Show welcome message
        displayMessage(`Welcome, ${nameInput.value.trim()}! How can I help you today?`, 'assistant');
      } else {
        console.error('Failed to register guest user:', data);
        // Show generic error
        const genericError = document.createElement('div');
        genericError.className = 'ai-chat-guest-error';
        genericError.textContent = 'Failed to register. Please try again.';
        guestForm.appendChild(genericError);
      }
    })
    .catch(error => {
      console.error('Error registering guest:', error);
      // Show generic error
      const genericError = document.createElement('div');
      genericError.className = 'ai-chat-guest-error';
      genericError.textContent = 'An unexpected error occurred. Please try again.';
      guestForm.appendChild(genericError);
    });
  }

  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Initialize widget
  function initWidget() {
    // Create widget container
    widgetContainer = document.createElement('div');
    widgetContainer.className = 'ai-chat-widget-container';
    
    // Set position based on config
    const positionStyle = positionWidget(config.position);
    Object.assign(widgetContainer.style, positionStyle);
    
    // Create widget button
    const button = createWidgetButton();
    widgetContainer.appendChild(button);
    
    // Create chat window
    chatContainer = createChatWindow();
    widgetContainer.appendChild(chatContainer);
    
    // Add to page
    document.body.appendChild(widgetContainer);
    
    // Track widget view for analytics (implement on backend)
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${baseUrl}/api/widget/analytics/view`, JSON.stringify({
        widget_id: config.widgetId,
        visitor_id: config.visitorId,
        url: window.location.href
      }));
    }

    // Auto-open after delay if configured
    const autoOpenDelay = parseInt(script.getAttribute('data-auto-open-delay') || '0');
    if (autoOpenDelay > 0) {
      setTimeout(() => {
        if (!state.isOpen) toggleChat();
      }, autoOpenDelay * 1000);
    }
    
    // Set up guest form submit handler
    if (config.requireGuestInfo) {
      const submitButton = document.getElementById('ai-chat-guest-submit');
      if (submitButton) {
        submitButton.addEventListener('click', registerGuestUser);
        submitButton.style.backgroundColor = config.primaryColor;
      }
    }
    
    // Check for existing guest session
    const storedGuestSession = localStorage.getItem(`ai-chat-guest-${config.widgetId}`);
    if (storedGuestSession && config.requireGuestInfo) {
      validateExistingGuestSession(storedGuestSession);
    }
  }
  
  function validateExistingGuestSession(sessionId) {
    fetch(`${baseUrl}/api/guest/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId })
    })
    .then(response => response.json())
    .then(data => {
      if (data.valid) {
        // Auto-restore guest session
        state.isGuestRegistered = true;
        state.guestSessionId = sessionId;
        
        // Hide form and enable chat
        if (guestForm) {
          guestForm.style.display = 'none';
        }
        
        if (inputField) {
          inputField.disabled = false;
        }
      } else {
        // Clear invalid session
        localStorage.removeItem(`ai-chat-guest-${config.widgetId}`);
      }
    })
    .catch(error => {
      console.error('Error validating guest session:', error);
    });
  }

  // Check if already initialized
  if (window.AIChatWidget && window.AIChatWidget.initialized) {
    console.warn('AI Chat Widget already initialized');
    return;
  }
  
  // Set widget as initialized
  window.AIChatWidget = window.AIChatWidget || {};
  window.AIChatWidget.initialized = true;
  window.AIChatWidget.toggle = toggleChat;
  
  // Create styles
  createWidgetStyles();
  
  // Initialize the widget
  initWidget();
})();

</edits_to_apply>
