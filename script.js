// Your Lex bot configuration
const BOT_CONFIG = {
    botId: 'RNTBV3K18U',
    botAliasId: 'TSTALIASID',
    localeId: 'en_US'
};

// AWS Configuration for Isengard
AWS.config.region = 'us-west-2';

// Initialize Lex client with role assumption
async function initializeLexClient() {
    try {
        // Assume the Isengard role
        const sts = new AWS.STS();
        const roleToAssume = {
            RoleArn: `arn:aws:iam::564175165855:role/Admin/ekrammil-Isengard`,
            RoleSessionName: 'ChatbotSession'
        };

        const assumedRole = await sts.assumeRole(roleToAssume).promise();
        
        // Create Lex client with assumed role credentials
        return new AWS.LexRuntimeV2({
            region: 'us-west-2',
            credentials: new AWS.Credentials(
                assumedRole.Credentials.AccessKeyId,
                assumedRole.Credentials.SecretAccessKey,
                assumedRole.Credentials.SessionToken
            )
        });
    } catch (error) {
        console.error('Failed to initialize Lex client:', error);
        throw error;
    }
}

let lexRuntime;
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
    
    if (!message || !lexRuntime) return;
    
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
        } else {
            addMessage('No response received from the bot.');
        }
    } catch (error) {
        console.error('Error:', error);
        hideTypingIndicator();
        addMessage(`Error: ${error.message || 'An unknown error occurred'}`);
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
    if (!lexRuntime) {
        updateConnectionStatus(false, 'Not Connected');
        return false;
    }

    try {
        const response = await lexRuntime.recognizeText({
            botId: BOT_CONFIG.botId,
            botAliasId: BOT_CONFIG.botAliasId,
            localeId: BOT_CONFIG.localeId,
            sessionId: `test-${Date.now()}`,
            text: 'test'
        }).promise();
        
        updateConnectionStatus(true, 'Connected');
        console.log('Connection test successful');
        return true;
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
        lexRuntime = await initializeLexClient();
        await testConnection();
        document.getElementById('user-input').focus();
    } catch (error) {
        console.error('Initialization failed:', error);
        updateConnectionStatus(false, 'Authentication Failed');
        addMessage('Failed to connect to the bot. Please try refreshing the page.');
    }
};

