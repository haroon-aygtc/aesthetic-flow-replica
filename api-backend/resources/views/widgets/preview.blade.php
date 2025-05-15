<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Widget Preview</title>
    <style>
        :root {
            --primary-color: {{ $settings['primaryColor'] }};
            --secondary-color: {{ $settings['secondaryColor'] }};
            --border-radius: {{ $settings['borderRadius'] }}px;
            --font-family: {{ $settings['fontFamily'] }}, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: var(--font-family);
            height: 100vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        
        .chat-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            background-color: #fff;
            border-radius: var(--border-radius);
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .chat-header {
            background-color: var(--primary-color);
            color: white;
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .chat-title {
            font-weight: 600;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            overflow: hidden;
        }
        
        .avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .chat-actions {
            display: flex;
            gap: 8px;
        }
        
        .action-button {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.8;
            transition: opacity 0.2s;
        }
        
        .action-button:hover {
            opacity: 1;
        }
        
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        
        .message {
            max-width: 80%;
            padding: 12px 16px;
            border-radius: 16px;
            position: relative;
            line-height: 1.5;
            font-size: 14px;
        }
        
        .message.bot {
            align-self: flex-start;
            background-color: #f0f0f0;
            border-bottom-left-radius: 4px;
        }
        
        .message.user {
            align-self: flex-end;
            background-color: var(--primary-color);
            color: white;
            border-bottom-right-radius: 4px;
        }
        
        .message-time {
            font-size: 10px;
            opacity: 0.7;
            margin-top: 4px;
            text-align: right;
        }
        
        .chat-input {
            padding: 16px;
            border-top: 1px solid #eaeaea;
            display: flex;
            gap: 8px;
        }
        
        .input-field {
            flex: 1;
            border: 1px solid #ddd;
            border-radius: var(--border-radius);
            padding: 12px 16px;
            font-family: var(--font-family);
            font-size: 14px;
            resize: none;
            outline: none;
            transition: border-color 0.2s;
            min-height: 48px;
            max-height: 120px;
        }
        
        .input-field:focus {
            border-color: var(--primary-color);
        }
        
        .send-button {
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: var(--border-radius);
            padding: 0 16px;
            font-family: var(--font-family);
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .send-button:hover {
            background-color: var(--secondary-color);
        }
        
        .preview-badge {
            position: absolute;
            top: 8px;
            right: 8px;
            background-color: #f59e0b;
            color: white;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
            z-index: 10;
        }
        
        /* Typing indicator */
        .typing-indicator {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 8px 12px;
            background-color: #f0f0f0;
            border-radius: 16px;
            width: fit-content;
            margin-top: 8px;
            align-self: flex-start;
        }
        
        .typing-dot {
            width: 8px;
            height: 8px;
            background-color: #888;
            border-radius: 50%;
            animation: typing-animation 1.4s infinite ease-in-out;
        }
        
        .typing-dot:nth-child(1) {
            animation-delay: 0s;
        }
        
        .typing-dot:nth-child(2) {
            animation-delay: 0.2s;
        }
        
        .typing-dot:nth-child(3) {
            animation-delay: 0.4s;
        }
        
        @keyframes typing-animation {
            0%, 60%, 100% {
                transform: translateY(0);
                opacity: 0.6;
            }
            30% {
                transform: translateY(-4px);
                opacity: 1;
            }
        }
    </style>
</head>
<body>
    <div class="preview-badge">PREVIEW</div>
    
    <div class="chat-container">
        <div class="chat-header">
            <div class="chat-title">
                @if($settings['avatar']['enabled'])
                    <div class="avatar">
                        @if(!empty($settings['avatar']['imageUrl']))
                            <img src="{{ $settings['avatar']['imageUrl'] }}" alt="Avatar">
                        @else
                            {{ $settings['avatar']['fallbackInitial'] }}
                        @endif
                    </div>
                @endif
                {{ $settings['headerTitle'] }}
            </div>
            <div class="chat-actions">
                <button class="action-button" title="Minimize">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
            </div>
        </div>
        
        <div class="chat-messages">
            <div class="message bot">
                {{ $settings['initialMessage'] }}
                <div class="message-time">{{ date('h:i A') }}</div>
            </div>
            
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
        
        <div class="chat-input">
            <textarea class="input-field" placeholder="{{ $settings['inputPlaceholder'] }}"></textarea>
            <button class="send-button">{{ $settings['sendButtonText'] }}</button>
        </div>
    </div>
    
    <script>
        // Simple preview interactivity
        document.addEventListener('DOMContentLoaded', function() {
            const inputField = document.querySelector('.input-field');
            const sendButton = document.querySelector('.send-button');
            const messagesContainer = document.querySelector('.chat-messages');
            const typingIndicator = document.querySelector('.typing-indicator');
            
            // Hide typing indicator after 2 seconds
            setTimeout(() => {
                typingIndicator.style.display = 'none';
            }, 2000);
            
            // Handle message sending
            function sendMessage() {
                const message = inputField.value.trim();
                if (!message) return;
                
                // Add user message
                const userMessage = document.createElement('div');
                userMessage.className = 'message user';
                userMessage.innerHTML = `
                    ${message}
                    <div class="message-time">${formatTime()}</div>
                `;
                messagesContainer.appendChild(userMessage);
                
                // Clear input
                inputField.value = '';
                
                // Show typing indicator
                typingIndicator.style.display = 'flex';
                messagesContainer.appendChild(typingIndicator);
                
                // Scroll to bottom
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                
                // Simulate bot response after delay
                setTimeout(() => {
                    // Hide typing indicator
                    typingIndicator.style.display = 'none';
                    
                    // Add bot message
                    const botMessage = document.createElement('div');
                    botMessage.className = 'message bot';
                    botMessage.innerHTML = `
                        This is a preview of the chat widget. In the actual widget, this would be a response from the AI.
                        <div class="message-time">${formatTime()}</div>
                    `;
                    messagesContainer.appendChild(botMessage);
                    
                    // Scroll to bottom
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, 1500);
            }
            
            // Format time as HH:MM AM/PM
            function formatTime() {
                const now = new Date();
                return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            }
            
            // Event listeners
            sendButton.addEventListener('click', sendMessage);
            
            inputField.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
            
            // Auto-resize textarea
            inputField.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });
        });
    </script>
</body>
</html>
