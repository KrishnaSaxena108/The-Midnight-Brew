document.addEventListener("DOMContentLoaded", () => {
    // Inject Chatbot HTML
    // Uses Bootstrap 5 classes (card, shadow-lg, position-fixed, bg-dark, etc.)
    const chatbotHTML = `
        <div id="chatbot" class="card shadow-lg border-0 position-fixed" 
             style="width: 22rem; bottom: 6rem; right: 1.5rem; display: none; z-index:1050;">
            <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                <span class="fw-bold">☕ Midnight Brew Bot</span>
                <button id="chat-close" class="btn btn-sm btn-light p-0 px-2" aria-label="Close Chat">&times;</button>
            </div>
            <div id="chat-body" class="card-body overflow-auto p-3" style="max-height: 300px; background:#f8f9fa;">
                </div>
            <div class="card-footer p-2 d-flex">
                <input id="chat-input" type="text" class="form-control me-2" placeholder="Ask me something...">
                <button id="chat-send" class="btn btn-primary">➤</button>
            </div>
        </div>

        <button id="chat-toggle" class="btn btn-lg btn-dark rounded-circle shadow position-fixed" 
                    style="bottom: 1.5rem; right: 1.5rem; z-index:1050;">
            💬
        </button>
    `;
    document.body.insertAdjacentHTML("beforeend", chatbotHTML);

    // DOM Elements
    const chatToggle = document.getElementById("chat-toggle");
    const chatbot = document.getElementById("chatbot");
    const chatClose = document.getElementById("chat-close");
    const chatBody = document.getElementById("chat-body");
    const chatInput = document.getElementById("chat-input");
    const chatSend = document.getElementById("chat-send");

    let chatbotData = {};
    let isFirstOpen = true; // Flag to show welcome message only once

    // Load JSON knowledge base
    fetch("/chatbot-data.json")
        .then(res => {
            if (!res.ok) {
                console.warn("Could not load /chatbot-data.json. Using empty data.");
                return {};
            }
            return res.json();
        })
        .then(data => chatbotData = data)
        .catch(err => console.error("Chatbot data load error:", err));

    // Add message utility function
    function addMessage(text, sender) {
        const msg = document.createElement("div");
        msg.classList.add("p-2", "rounded", "mb-2");
        msg.style.maxWidth = "85%";

        if (sender === "user") {
            // User: Gray bubble, aligned right
            msg.classList.add("bg-secondary", "text-white", "ms-auto");
        } else {
            // Bot: Primary color bubble (Bootstrap Blue), aligned left
            msg.classList.add("bg-primary", "text-white");
        }

        msg.innerText = text;
        chatBody.appendChild(msg);
        chatBody.scrollTop = chatBody.scrollHeight; // Scroll to bottom
    }

    // Toggle open/close logic
    chatToggle.addEventListener("click", () => {
        const isHidden = chatbot.style.display === "none" || chatbot.style.display === "";
        chatbot.style.display = isHidden ? "block" : "none";

        if (isHidden) {
            // Show welcome message on first open
            if (isFirstOpen) {
                addMessage("Hello! I'm the Midnight Brew Bot. Ask me about our menu, hours, or location!", "bot");
                isFirstOpen = false;
            }
            chatInput.focus();
        }
    });

    // Close
    chatClose.addEventListener("click", () => {
        chatbot.style.display = "none";
    });

    // Send message logic
    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        addMessage(text, "user");
        chatInput.value = "";

        // Bot "thinking" time
        setTimeout(() => {
            let reply = chatbotData["default"] || "Sorry, I don't understand that yet. Can you try rephrasing?";
            
            const lowerText = text.toLowerCase();
            for (let key in chatbotData) {
                // Simple keyword matching: checks if user input includes the JSON key
                if (lowerText.includes(key.toLowerCase())) {
                    reply = chatbotData[key];
                    break;
                }
            }
            addMessage(reply, "bot");
        }, 500);
    }

    chatSend.addEventListener("click", sendMessage);
    
    // Allow 'Enter' key to send message
    chatInput.addEventListener("keypress", e => {
        if (e.key === "Enter") {
            e.preventDefault(); 
            sendMessage();
        }
    });
});