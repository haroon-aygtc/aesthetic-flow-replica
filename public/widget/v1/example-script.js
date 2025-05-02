
/**
 * AI Chat Widget Script Example
 * This is an example of what the embeddable widget script would look like
 * Note: This script is not functional, just an illustration
 */

(function() {
  // Configuration from data attributes
  const script = document.currentScript;
  const widgetId = script.getAttribute('data-widget-id') || 'default';
  const primaryColor = script.getAttribute('data-primary-color') || '#4f46e5';
  const borderRadius = script.getAttribute('data-border-radius') || '8';
  
  // Only initialize once
  if (window.AIChatWidget) {
    return;
  }
  
  // Create widget container
  const createWidget = () => {
    const container = document.createElement('div');
    container.id = 'ai-chat-widget';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
  };
  
  // Create chat button
  const createChatButton = (container) => {
    const button = document.createElement('button');
    button.id = 'ai-chat-widget-button';
    button.innerHTML = '💬';
    button.style.width = '50px';
    button.style.height = '50px';
    button.style.borderRadius = `${borderRadius}px`;
    button.style.backgroundColor = primaryColor;
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.fontSize = '24px';
    container.appendChild(button);
    
    // Toggle chat window
    button.addEventListener('click', () => {
      const chatWindow = document.getElementById('ai-chat-widget-window');
      if (chatWindow) {
        const isVisible = chatWindow.style.display !== 'none';
        chatWindow.style.display = isVisible ? 'none' : 'block';
      } else {
        createChatWindow(container);
      }
    });
    
    return button;
  };
  
  // Create chat window
  const createChatWindow = (container) => {
    const chatWindow = document.createElement('div');
    chatWindow.id = 'ai-chat-widget-window';
    chatWindow.style.width = '350px';
    chatWindow.style.height = '500px';
    chatWindow.style.backgroundColor = '#fff';
    chatWindow.style.border = '1px solid #e2e8f0';
    chatWindow.style.borderRadius = `${borderRadius}px`;
    chatWindow.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    chatWindow.style.marginBottom = '10px';
    chatWindow.style.overflow = 'hidden';
    chatWindow.style.display = 'block';
    chatWindow.style.flexDirection = 'column';
    
    // Header
    const header = document.createElement('div');
    header.style.backgroundColor = primaryColor;
    header.style.color = '#fff';
    header.style.padding = '12px 16px';
    header.style.fontFamily = 'sans-serif';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    
    const title = document.createElement('div');
    title.textContent = 'Chat Assistant';
    title.style.fontWeight = 'bold';
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = '#fff';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '16px';
    
    closeButton.addEventListener('click', () => {
      chatWindow.style.display = 'none';
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    chatWindow.appendChild(header);
    
    // Chat messages
    const messagesContainer = document.createElement('div');
    messagesContainer.style.height = '380px';
    messagesContainer.style.padding = '16px';
    messagesContainer.style.overflowY = 'auto';
    
    // Welcome message
    const welcomeMessage = document.createElement('div');
    welcomeMessage.style.backgroundColor = '#f3f4f6';
    welcomeMessage.style.padding = '12px';
    welcomeMessage.style.borderRadius = '12px';
    welcomeMessage.style.marginBottom = '12px';
    welcomeMessage.style.maxWidth = '80%';
    welcomeMessage.textContent = 'Hello! How can I help you today?';
    messagesContainer.appendChild(welcomeMessage);
    
    chatWindow.appendChild(messagesContainer);
    
    // Input area
    const inputArea = document.createElement('div');
    inputArea.style.display = 'flex';
    inputArea.style.padding = '16px';
    inputArea.style.borderTop = '1px solid #e2e8f0';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type your message...';
    input.style.flex = '1';
    input.style.padding = '8px 12px';
    input.style.border = '1px solid #e2e8f0';
    input.style.borderRadius = '20px';
    input.style.marginRight = '8px';
    
    const sendButton = document.createElement('button');
    sendButton.textContent = 'Send';
    sendButton.style.backgroundColor = primaryColor;
    sendButton.style.color = '#fff';
    sendButton.style.border = 'none';
    sendButton.style.padding = '8px 16px';
    sendButton.style.borderRadius = '20px';
    sendButton.style.cursor = 'pointer';
    
    inputArea.appendChild(input);
    inputArea.appendChild(sendButton);
    chatWindow.appendChild(inputArea);
    
    // Insert the chat window before the button
    container.insertBefore(chatWindow, container.firstChild);
    
    return chatWindow;
  };
  
  // Initialize the widget
  const init = () => {
    const container = createWidget();
    const button = createChatButton(container);
    
    // Load widget data from server
    fetch(`https://api.chatsystem.ai/widgets/${widgetId}`)
      .then(response => response.json())
      .catch(error => console.error('Widget loading error:', error));
    
    // Expose the API
    window.AIChatWidget = {
      open: () => {
        const chatWindow = document.getElementById('ai-chat-widget-window') || createChatWindow(container);
        chatWindow.style.display = 'block';
      },
      close: () => {
        const chatWindow = document.getElementById('ai-chat-widget-window');
        if (chatWindow) {
          chatWindow.style.display = 'none';
        }
      },
      toggle: () => {
        const chatWindow = document.getElementById('ai-chat-widget-window');
        if (chatWindow) {
          chatWindow.style.display = chatWindow.style.display === 'none' ? 'block' : 'none';
        } else {
          createChatWindow(container);
        }
      }
    };
  };
  
  // Initialize on page load
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }
})();
