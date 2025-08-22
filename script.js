// Chat configuration
const API_ENDPOINT = 'https://h86p4meli0.execute-api.us-east-1.amazonaws.com/4aay7cr';

let isTyping = false;

function showTypingIndicator() {
    if (!isTyping) {
        isTyping = true;
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = 'typing-indicator';
        indicator.textContent = 'Assistant is typing...';
        document.getElementById('chatbox').appendChild(indicator);
        scrollToBottom();
    }
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
    isTyping = false;
}

function scrollToBottom() {
    const chatbox = document.getElementById('chatbox');
    chatbox.scrollTop = chatbox.scrollHeight;
}

function formatTimestamp() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function addMessage(content, isUser = false) {
    const chatbox = document.getElementById('chatbox');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const messageContent = document.createElement('div');
    messageContent.textContent = content;
    
    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    timestamp.textContent = formatTimestamp();
    
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(timestamp);
    chatbox.appendChild(messageDiv);
    scrollToBottom();
}

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (!message) return;
    
    userInput.value = '';
    addMessage(message, true);
    
    showTypingIndicator();
    
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        hideTypingIndicator();
        
        if (data.messages && data.messages.length > 0) {
            data.messages.forEach(msg => {
                addMessage(msg.content || msg);
            });
        } else if (data.message) {
            addMessage(data.message);
        } else {
            addMessage('No response received from the bot.');
        }
        
        updateConnectionStatus(true);
    } catch (error) {
        console.error('Error:', error);
        hideTypingIndicator();
        addMessage(`Error: Unable to connect to the chatbot`);
        updateConnectionStatus(false, 'Connection Error');
    }
}

function updateConnectionStatus(isConnected, message = '') {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.connection-status span');
    
    statusDot.style.background = isConnected ? '#4CAF50' : '#dc3545';
    statusText.textContent = message || (isConnected ? 'Connected' : 'Disconnected');
}

async function testConnection() {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: 'test' })
        });
        
        if (response.ok) {
            updateConnectionStatus(true, 'Connected');
            console.log('Connection test successful');
            return true;
        } else {
            throw new Error('Connection test failed');
        }
    } catch (error) {
        console.error('Connection test failed:', error);
        updateConnectionStatus(false, 'Connection Failed');
        return false;
    }
}

// Event Listeners
document.getElementById('send-button').onclick = sendMessage;
document.getElementById('user-input').onkeypress = function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
};

// Initialize on page load
window.onload = async function() {
    try {
        updateConnectionStatus(false, 'Initializing...');
        await testConnection();
        document.getElementById('user-input').focus();
    } catch (error) {
        console.error('Initialization failed:', error);
        updateConnectionStatus(false, 'Connection Failed');
        addMessage('Failed to connect to the bot. Please try refreshing the page.');
    }
};
