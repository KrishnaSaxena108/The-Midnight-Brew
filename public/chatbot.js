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
            <div id="chat-body" class="card-body overflow-auto p-3" style="max-height: 300px; background:#f8f9fa;"></div>
            <div class="card-footer p-2 d-flex align-items-center">
                <input id="chat-input" type="text" class="form-control me-2" placeholder="Ask me something...">
                <button id="chat-send" class="btn btn-primary me-2">➤</button>
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
        const keywords = {
        "menu": ["menu", "food", "drinks", "pastries"],
        "time": ["time", "hours", "open", "close"],
        "ambience": ["ambience", "atmosphere", "vibe"],
        "location": ["location", "address", "place"],
        "booking": ["booking", "reserve", "reservation"],
        "wifi": ["wifi", "internet", "wireless"],
        "loyalty": ["loyalty", "discount", "offer", "promo"],
        "phone": ["phone", "contact", "call"],
        "login": ["login", "sign in"],
        "spotify": ["relaxing", "chill", "music", "songs"],  // added "songs"
        "caffeine": ["caffeine", "espresso", "latte", "mocha", "cappuccino", "coffee"]
    };
    const coffeeData = {
    "espresso": 64,
    "latte": 63,
    "cappuccino": 63,
    "mocha": 70,
    "coffee": 95
    };

    

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

    setTimeout(() => {
        const lowerText = text.toLowerCase();

        // 1️⃣ Coffee calculator logic
        if (keywords["caffeine"].some(k => lowerText.includes(k))) {
            let foundType = Object.keys(coffeeData).find(type => lowerText.includes(type));
            let numberMatch = lowerText.match(/(\d+(\.\d+)?)/);
            let number = numberMatch ? parseFloat(numberMatch[0]) : 1;

            let reply = "";

            if (foundType) {
                if (lowerText.includes("cup")) {
                    let totalCaffeine = coffeeData[foundType] * number;
                    reply = `☕ ${number} cup(s) of ${foundType} contains approximately ${totalCaffeine} mg of caffeine.`;
                } else if (lowerText.includes("mg") || lowerText.includes("milligrams")) {
                    let cupsNeeded = Math.ceil(number / coffeeData[foundType]);
                    reply = `☕ You would need about ${cupsNeeded} cup(s) of ${foundType} to get ${number} mg of caffeine.`;
                } else {
                    reply = `☕ 1 cup of ${foundType} contains approximately ${coffeeData[foundType]} mg of caffeine.`;
                }
            } else {
                reply = "☕ Please mention a coffee type like espresso, latte, mocha, cappuccino, or coffee.";
            }

            addMessage(reply, "bot");
            return; // Stop further processing
        }

        // 2️⃣ Regular keyword matching logic
        let reply = chatbotData["default"] || "Sorry, I don't understand that yet.";
        for (let key in keywords) {
            if (keywords[key].some(k => lowerText.includes(k))) {
                if (key === "spotify") {
                    const playlists = chatbotData["spotify"];
                    reply = playlists[Math.floor(Math.random() * playlists.length)];
                } else {
                    reply = chatbotData[key];
                }
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