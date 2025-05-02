
/**
 * AI Chat Widget Web Component
 * A web component version of the chat widget that can be used with custom elements
 */

class AIChatWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Widget state
    this.state = {
      isOpen: false,
      sessionId: null,
      messages: [],
      isTyping: false,
      unreadMessages: 0,
    };
    
    // Configuration from attributes
    this.config = {
      widgetId: '',
      primaryColor: '#4f46e5',
      borderRadius: 8,
      position: 'bottom-right',
      headerTitle: 'AI Chat Assistant',
      initialMessage: 'Hello! How can I help you today?',
      inputPlaceholder: 'Type your message...',
      sendButtonText: 'Send',
      chatIconSize: 50,
      mobileBehavior: 'responsive',
      visitorId: this.generateVisitorId(),
    };
  }
  
  connectedCallback() {
    // Get attributes
    this.config.widgetId = this.getAttribute('widget-id') || this.config.widgetId;
    this.config.primaryColor = this.getAttribute('primary-color') || this.config.primaryColor;
    this.config.borderRadius = parseInt(this.getAttribute('border-radius') || this.config.borderRadius);
    this.config.position = this.getAttribute('position') || this.config.position;
    this.config.headerTitle = this.getAttribute('header-title') || this.config.headerTitle;
    this.config.initialMessage = this.getAttribute('initial-message') || this.config.initialMessage;
    this.config.inputPlaceholder = this.getAttribute('input-placeholder') || this.config.inputPlaceholder;
    this.config.sendButtonText = this.getAttribute('send-button-text') || this.config.sendButtonText;
    this.config.chatIconSize = parseInt(this.getAttribute('chat-icon-size') || this.config.chatIconSize);
    
    // Validate required attributes
    if (!this.config.widgetId) {
      console.error('AI Chat Widget: Missing required widget-id attribute');
      return;
    }
    
    // Initialize widget
    this.initWidget();
    
    // Track widget view for analytics
    this.trackWidgetView();
  }
  
  generateVisitorId() {
    return 'visitor_' + Math.random().toString(36).substring(2, 15);
  }
  
  initWidget() {
    // Create styles
    const styles = document.createElement('style');
    styles.textContent = this.getStyles();
    this.shadowRoot.appendChild(styles);
    
    // Create widget container
    const container = document.createElement('div');
    container.className = 'ai-chat-widget-container';
    
    // Set position based on config
    const positionStyle = this.positionWidget(this.config.position);
    Object.keys(positionStyle).forEach(key => {
      container.style[key] = positionStyle[key];
    });
    
    // Create widget button
    const button = this.createWidgetButton();
    container.appendChild(button);
    
    // Create chat window
    this.chatContainer = this.createChatWindow();
    container.appendChild(this.chatContainer);
    
    // Add to shadow DOM
    this.shadowRoot.appendChild(container);
    this.widgetContainer = container;
  }
  
  getStyles() {
    return `
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
    `;
  }
  
  positionWidget(position) {
    const positions = {
      'bottom-right': { bottom: '20px', right: '20px' },
      'bottom-left': { bottom: '20px', left: '20px' },
      'top-right': { top: '20px', right: '20px' },
      'top-left': { top: '20px', left: '20px' }
    };
    
    return positions[position] || positions['bottom-right'];
  }
  
  createWidgetButton() {
    const button = document.createElement('div');
    button.className = 'ai-chat-widget-button';
    button.style.width = `${this.config.chatIconSize}px`;
    button.style.height = `${this.config.chatIconSize}px`;
    button.style.backgroundColor = this.config.primaryColor;
    
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    `;
    
    button.addEventListener('click', () => this.toggleChat());
    return button;
  }
  
  createChatWindow() {
    const chat = document.createElement('div');
    chat.className = 'ai-chat-widget-chat';
    chat.style.borderRadius = `${this.config.borderRadius}px`;
    chat.style.display = 'none';
    
    // Header
    const header = document.createElement('div');
    header.className = 'ai-chat-header';
    header.style.backgroundColor = this.config.primaryColor;
    header.innerHTML = `
      <h3>${this.config.headerTitle}</h3>
      <button class="ai-chat-header-button">
        <svg width="20" height="20" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    header.querySelector('button').addEventListener('click', () => this.toggleChat());
    
    // Messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'ai-chat-messages';
    this.messagesList = messagesContainer;
    
    // Input area
    const inputContainer = document.createElement('div');
    inputContainer.className = 'ai-chat-input-container';
    
    const inputForm = document.createElement('form');
    inputForm.className = 'ai-chat-input-form';
    
    this.inputField = document.createElement('input');
    this.inputField.type = 'text';
    this.inputField.className = 'ai-chat-input';
    this.inputField.placeholder = this.config.inputPlaceholder;
    
    const sendButton = document.createElement('button');
    sendButton.type = 'submit';
    sendButton.className = 'ai-chat-send-button';
    sendButton.textContent = this.config.sendButtonText;
    sendButton.style.backgroundColor = this.config.primaryColor;
    
    inputForm.appendChild(this.inputField);
    inputForm.appendChild(sendButton);
    inputContainer.appendChild(inputForm);
    
    inputForm.addEventListener('submit', (e) => this.handleSubmitMessage(e));
    
    // Combine all elements
    chat.appendChild(header);
    chat.appendChild(messagesContainer);
    chat.appendChild(inputContainer);
    
    return chat;
  }
  
  toggleChat() {
    if (!this.widgetContainer) return;
    
    if (this.state.isOpen) {
      // Close chat
      this.chatContainer.style.display = 'none';
      this.widgetContainer.querySelector('.ai-chat-widget-button').style.display = 'flex';
      this.state.isOpen = false;
    } else {
      // Open chat
      this.chatContainer.style.display = 'flex';
      this.widgetContainer.querySelector('.ai-chat-widget-button').style.display = 'none';
      this.state.isOpen = true;
      
      // Reset unread counter
      this.state.unreadMessages = 0;
      const unreadBadge = this.widgetContainer.querySelector('.ai-chat-unread');
      if (unreadBadge) unreadBadge.remove();
      
      // Focus input field
      setTimeout(() => {
        this.inputField.focus();
      }, 100);
      
      // Initialize session if not already done
      if (!this.state.sessionId) {
        this.initChatSession();
      }
    }
  }
  
  displayMessage(message, role) {
    const messageElement = document.createElement('div');
    messageElement.className = `ai-chat-message ${role}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'ai-chat-message-content';
    
    if (role === 'assistant') {
      messageContent.style.backgroundColor = `${this.config.primaryColor}20`;
    }
    
    messageContent.textContent = message;
    messageElement.appendChild(messageContent);
    this.messagesList.appendChild(messageElement);
    
    // Scroll to bottom
    this.messagesList.scrollTop = this.messagesList.scrollHeight;
    
    // If chat is closed, increment unread counter
    if (!this.state.isOpen && role === 'assistant') {
      this.state.unreadMessages++;
      this.updateUnreadCounter();
    }
  }
  
  updateUnreadCounter() {
    // Remove existing badge if any
    const existingBadge = this.widgetContainer.querySelector('.ai-chat-unread');
    if (existingBadge) existingBadge.remove();
    
    // Add new badge if needed
    if (this.state.unreadMessages > 0) {
      const badge = document.createElement('div');
      badge.className = 'ai-chat-unread';
      badge.textContent = this.state.unreadMessages > 9 ? '9+' : this.state.unreadMessages;
      
      const button = this.widgetContainer.querySelector('.ai-chat-widget-button');
      button.style.position = 'relative';
      button.appendChild(badge);
    }
  }
  
  showTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.className = 'ai-chat-message assistant ai-chat-typing';
    typingElement.innerHTML = `
      <div class="ai-chat-message-content">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    this.messagesList.appendChild(typingElement);
    this.messagesList.scrollTop = this.messagesList.scrollHeight;
    return typingElement;
  }
  
  removeTypingIndicator(element) {
    if (element && element.parentNode === this.messagesList) {
      this.messagesList.removeChild(element);
    }
  }
  
  async handleSubmitMessage(e) {
    e.preventDefault();
    
    const message = this.inputField.value.trim();
    if (!message) return;
    
    // Clear input
    this.inputField.value = '';
    
    // Display user message
    this.displayMessage(message, 'user');
    
    // Add to state
    this.state.messages.push({
      role: 'user',
      content: message
    });
    
    // Show typing indicator
    this.state.isTyping = true;
    const typingIndicator = this.showTypingIndicator();
    
    // Send to backend
    try {
      const response = await this.sendMessage(message);
      
      // Remove typing indicator
      this.state.isTyping = false;
      this.removeTypingIndicator(typingIndicator);
      
      // Display response
      this.displayMessage(response.message, 'assistant');
      
      // Add to state
      this.state.messages.push({
        role: 'assistant',
        content: response.message
      });
    } catch (error) {
      // Remove typing indicator
      this.state.isTyping = false;
      this.removeTypingIndicator(typingIndicator);
      
      // Display error message
      this.displayMessage('Sorry, there was a problem processing your request. Please try again.', 'assistant');
      console.error('Chat widget error:', error);
    }
  }
  
  async initChatSession() {
    try {
      const baseUrl = new URL(document.currentScript.src).origin;
      const response = await fetch(`${baseUrl}/api/chat/session/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          widget_id: this.config.widgetId,
          visitor_id: this.config.visitorId,
          metadata: {
            url: window.location.href,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            language: navigator.language,
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to initialize chat session: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.state.sessionId = data.session_id;
      
      // Add initial message
      if (this.config.initialMessage) {
        this.displayMessage(this.config.initialMessage, 'assistant');
        this.state.messages.push({
          role: 'assistant',
          content: this.config.initialMessage
        });
      }
      
      // Get chat history
      await this.loadChatHistory();
      
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      this.displayMessage('Failed to initialize chat. Please try again later.', 'assistant');
    }
  }
  
  async loadChatHistory() {
    if (!this.state.sessionId) return;
    
    try {
      const baseUrl = new URL(document.currentScript.src).origin;
      const response = await fetch(`${baseUrl}/api/chat/history?session_id=${this.state.sessionId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chat history: ${response.statusText}`);
      }
      
      const messages = await response.json();
      
      // Clear current messages
      this.messagesList.innerHTML = '';
      this.state.messages = [];
      
      // Display messages
      messages.forEach(msg => {
        this.displayMessage(msg.content, msg.role);
        this.state.messages.push({
          role: msg.role,
          content: msg.content
        });
      });
      
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }
  
  async sendMessage(message) {
    if (!this.state.sessionId) {
      throw new Error('Chat session not initialized');
    }
    
    const baseUrl = new URL(document.currentScript.src).origin;
    const response = await fetch(`${baseUrl}/api/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session_id: this.state.sessionId,
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
  
  trackWidgetView() {
    const baseUrl = new URL(document.currentScript.src).origin;
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${baseUrl}/api/widget/analytics/view`, JSON.stringify({
        widget_id: this.config.widgetId,
        visitor_id: this.config.visitorId,
        url: window.location.href
      }));
    }
  }
}

// Register the custom element
customElements.define('ai-chat-widget', AIChatWidget);
