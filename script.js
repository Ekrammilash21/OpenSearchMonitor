// Your Lex bot configuration
const BOT_CONFIG = {
    botId: 'RNTBV3K18U', // Your bot ID
    botAliasId: 'TSTALIASID', // Your bot alias ID
    localeId: 'en_US'
};

// AWS Configuration
AWS.config.region = 'us-west-2'; // Your region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'YOUR_IDENTITY_POOL_ID'
});

const lexRuntime = new AWS.LexRuntimeV2();
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
        const response = await lexRuntime.recognizeText({
            botId: BOT_CONFIG.botId,
            botAliasId: BOT_CONFIG.botAliasId,
            localeId: BOT_CONFIG.localeId,
            sessionId: `session-${Date.now()}`,
            text: message
        }).promise();
        
        hideTypingIndicator();
        
        if (response.messages && response.messages.length > 0) {
            response.messages.forEach(msg => {
                addMessage(msg.content);
            });
        }
    } catch (error) {
        console.error('Error:', error);
        hideTypingIndicator();
        addMessage('Sorry, I encountered an error. Please try again.');
    }
}

// Event Listeners
document.getElementById('send-button').onclick = sendMessage;
document.getElementById('user-input').onkeypress = function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
};
