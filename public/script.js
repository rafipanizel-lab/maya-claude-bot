let sessionId = null;

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    addMessage(message, 'user');
    input.value = '';
    input.style.height = 'auto';
    
    showTyping();
    document.getElementById('sendButton').disabled = true;
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                sessionId: sessionId
            })
        });
        
        const data = await response.json();
        
        if (data.sessionId) {
            sessionId = data.sessionId;
        }
        
        hideTyping();
        
        if (data.reply) {
            addMessage(data.reply, 'bot');
        } else if (data.error) {
            addMessage(data.error, 'bot');
        }
        
    } catch (error) {
        hideTyping();
        addMessage('❌ שגיאת חיבור. בדוק את החיבור לאינטרנט ונסה שוב.', 'bot');
        console.error('Error:', error);
    }
    
    document.getElementById('sendButton').disabled = false;
    input.focus();
}

function addMessage(text, sender) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    if (sender === 'bot') {
        messageDiv.innerHTML = `
            <div class="message-avatar">M</div>
            <div class="message-content">
                <p>${text}</p>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${text}</p>
            </div>
        `;
    }
    
    messagesDiv.appendChild(messageDiv);
    scrollToBottom();
}

function showTyping() {
    document.getElementById('typingIndicator').style.display = 'block';
    scrollToBottom();
}

function hideTyping() {
    document.getElementById('typingIndicator').style.display = 'none';
}

function scrollToBottom() {
    const messagesDiv = document.getElementById('chatMessages');
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

const textarea = document.getElementById('messageInput');
textarea.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

window.addEventListener('load', () => {
    document.getElementById('messageInput').focus();
});

console.log('✅ Maya Chatbot loaded successfully!');
