// API endpoint
const API_ENDPOINT = 'https://h86p4meli0.execute-api.us-east-1.amazonaws.com/4aay7cr';

// Add a message to the chatbox
function addMessage(text, isUser) {
    const chatbox = document.getElementById('chatbox');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.textContent = text;
    chatbox.appendChild(messageDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}

// Send message to the bot
async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();

    if (!message) return;

    // Add user message to chat
    addMessage(message, true);
    input.value = '';

    try {
        // Send message to API
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();
        
        // Add bot response to chat
        if (data.message) {
            addMessage(data.message, false);
        } else {
            addMessage('No response from bot.', false);
        }

    } catch (error) {
        console.error('Error:', error);
        addMessage('Error connecting to the bot.', false);
    }
}

// Handle Enter key
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
