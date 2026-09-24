const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const newChatButtons =
    document.querySelectorAll("#newChat, #newChatHeader");

const chatHistory =
    document.getElementById("chatHistory");

const userName =
    document.getElementById("userName");

const profilePic =
    document.querySelector(".profile-pic");

// =========================
// MOBILE MENU
// =========================

const mobileMenuBtn =
    document.getElementById("mobileMenuBtn");

const sidebar =
    document.querySelector(".sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

function openMobileMenu() {
    if (sidebar) {
        sidebar.classList.add("mobile-open");
    }

    if (sidebarOverlay) {
        sidebarOverlay.classList.add("mobile-open");
    }
}

function closeMobileMenu() {
    if (sidebar) {
        sidebar.classList.remove("mobile-open");
    }

    if (sidebarOverlay) {
        sidebarOverlay.classList.remove("mobile-open");
    }
}

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener(
        "click",
        openMobileMenu
    );
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener(
        "click",
        closeMobileMenu
    );
}

// =========================
// GUEST PROFILE
// =========================

if (userName) {
    userName.textContent = "Guest";
}

if (profilePic) {
    profilePic.textContent = "👤";
}

// =========================
// CURRENT CHAT
// =========================

let currentChat = {
    id: null,
    title: "",
    messages: []
};

// =========================
// CHAT HISTORY
// =========================

function getChatHistory() {
    try {
        const saved =
            localStorage.getItem("dulaaxChats");

        if (!saved) {
            return [];
        }

        const chats =
            JSON.parse(saved);

        return Array.isArray(chats)
            ? chats
            : [];

    } catch (error) {
        console.error(
            "Chat history error:",
            error
        );

        return [];
    }
}

// =========================
// SAVE CHAT HISTORY
// =========================

function saveChatHistory(chats) {
    try {
        localStorage.setItem(
            "dulaaxChats",
            JSON.stringify(chats)
        );

    } catch (error) {
        console.error(
            "Could not save chat history:",
            error
        );
    }
}

// =========================
// CREATE CHAT TITLE
// =========================

function createChatTitle(text) {
    let title =
        String(text || "")
            .trim()
            .replace(/\s+/g, " ");

    if (title.length > 35) {
        title =
            title.substring(0, 35) +
            "...";
    }

    return title || "New Chat";
}

// =========================
// SAVE CURRENT CHAT
// =========================

function saveCurrentChat() {
    if (
        !currentChat ||
        !currentChat.messages ||
        currentChat.messages.length === 0
    ) {
        return;
    }

    if (!currentChat.id) {
        currentChat.id =
            Date.now().toString() +
            Math.random()
                .toString(36)
                .substring(2, 7);
    }

    const chats =
        getChatHistory();

    const index =
        chats.findIndex(
            chat =>
                chat.id === currentChat.id
        );

    if (index !== -1) {
        chats[index] = currentChat;
    } else {
        chats.unshift(currentChat);
    }

    saveChatHistory(chats);

    renderChatHistory();
}

// =========================
// SAVE MESSAGE
// =========================

function saveMessageToCurrentChat(
    role,
    text
) {
    if (!text) {
        return;
    }

    if (
        text === "Thinking" ||
        text.startsWith("Thinking.")
    ) {
        return;
    }

    if (!currentChat.messages) {
        currentChat.messages = [];
    }

    currentChat.messages.push({
        role: role,
        text: text
    });

    if (
        role === "user" &&
        !currentChat.title
    ) {
        currentChat.title =
            createChatTitle(text);
    }

    saveCurrentChat();
}

// =========================
// RENDER CHAT HISTORY
// =========================

function renderChatHistory() {
    if (!chatHistory) {
        return;
    }

    chatHistory.innerHTML = "";

    const chats =
        getChatHistory();

    chats.forEach(chat => {
        const item =
            document.createElement("div");

        item.className =
            "history-item";

        if (
            currentChat.id === chat.id
        ) {
            item.classList.add("active");
        }

        const title =
            document.createElement("span");

        title.className =
            "history-title-text";

        title.textContent =
            chat.title || "New Chat";

        const actions =
            document.createElement("div");

        actions.className =
            "history-actions";

        // =====================
        // RENAME
        // =====================

        const renameBtn =
            document.createElement("button");

        renameBtn.type = "button";

        renameBtn.className =
            "history-action-btn";

        renameBtn.textContent = "✏️";

        renameBtn.title = "Rename";

        renameBtn.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();

                const newTitle =
                    prompt(
                        "Enter new chat name:",
                        chat.title || "New Chat"
                    );

                if (
                    !newTitle ||
                    !newTitle.trim()
                ) {
                    return;
                }

                const chats =
                    getChatHistory();

                const index =
                    chats.findIndex(
                        savedChat =>
                            savedChat.id === chat.id
                    );

                if (index !== -1) {
                    chats[index].title =
                        createChatTitle(newTitle);

                    saveChatHistory(chats);

                    if (
                        currentChat.id === chat.id
                    ) {
                        currentChat.title =
                            chats[index].title;
                    }
                }

                renderChatHistory();
            }
        );

        // =====================
        // DELETE
        // =====================

        const deleteBtn =
            document.createElement("button");

        deleteBtn.type = "button";

        deleteBtn.className =
            "history-action-btn delete-btn";

        deleteBtn.textContent = "🗑️";

        deleteBtn.title = "Delete";

        deleteBtn.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();

                const confirmed =
                    confirm("Delete this chat?");

                if (!confirmed) {
                    return;
                }

                const chats =
                    getChatHistory();

                const updated =
                    chats.filter(
                        savedChat =>
                            savedChat.id !== chat.id
                    );

                saveChatHistory(updated);

                if (
                    currentChat.id === chat.id
                ) {
                    currentChat = {
                        id: null,
                        title: "",
                        messages: []
                    };

                    showWelcome();
                }

                renderChatHistory();
            }
        );

        actions.appendChild(renameBtn);
        actions.appendChild(deleteBtn);

        item.appendChild(title);
        item.appendChild(actions);

        // =====================
        // OPEN CHAT
        // =====================

        item.addEventListener(
            "click",
            function () {
                openChat(chat);
                closeMobileMenu();
            }
        );

        chatHistory.appendChild(item);
    });
}

// =========================
// OPEN SAVED CHAT
// =========================

function openChat(chat) {
    if (!chat) {
        return;
    }

    currentChat =
        JSON.parse(
            JSON.stringify(chat)
        );

    chatBox.innerHTML = "";

    if (
        !currentChat.messages ||
        currentChat.messages.length === 0
    ) {
        showWelcome();
        return;
    }

    currentChat.messages.forEach(
        message => {
            addMessage(
                message.text,
                message.role === "user"
                    ? "user"
                    : "ai",
                false
            );
        }
    );

    chatBox.scrollTop =
        chatBox.scrollHeight;

    renderChatHistory();
}

// =========================
// WELCOME SCREEN
// =========================

function showWelcome() {
    if (!chatBox) {
        return;
    }

    chatBox.innerHTML = `
        <div class="welcome">
            <h1>
                Welcome to DulaaX GPT
            </h1>

            <p>
                Your personal AI assistant 🚀
            </p>
        </div>
    `;
}

// =========================
// ADD MESSAGE
// =========================

function addMessage(
    text,
    type,
    save = true
) {
    if (!chatBox) {
        return null;
    }

    const message =
        document.createElement("div");

    message.classList.add(
        "message",
        type
    );

    message.textContent =
        text;

    chatBox.appendChild(message);

    chatBox.scrollTop =
        chatBox.scrollHeight;

    if (
        save &&
        text !== "Thinking" &&
        !text.startsWith("Thinking.")
    ) {
        saveMessageToCurrentChat(
            type,
            text
        );
    }

    return message;
}

// =========================
// SEND MESSAGE
// =========================

async function sendMessage() {
    if (!userInput) {
        return;
    }

    const text =
        userInput.value.trim();

    if (!text) {
        return;
    }

    addMessage(
        text,
        "user"
    );

    userInput.value = "";

    const thinking =
        addMessage(
            "Thinking",
            "ai",
            false
        );

    let dots = 0;

    const thinkingInterval =
        setInterval(
            function () {
                dots =
                    (dots + 1) % 4;

                if (thinking) {
                    thinking.textContent =
                        "Thinking" +
                        ".".repeat(dots);
                }
            },
            400
        );

    try {
        const response =
            await fetch(
                "/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            message: text
                        })
                }
            );

        const data =
            await response.json();

        clearInterval(
            thinkingInterval
        );

        if (thinking) {
            thinking.remove();
        }

        if (!response.ok) {
            throw new Error(
                data.error ||
                "API request failed."
            );
        }

        if (data.reply) {
            addMessage(
                data.reply,
                "ai"
            );
        } else {
            addMessage(
                "Sorry, මට reply එකක් ලැබුණේ නැහැ.",
                "ai"
            );
        }

    } catch (error) {
        clearInterval(
            thinkingInterval
        );

        if (thinking) {
            thinking.remove();
        }

        console.error(
            "AI ERROR:",
            error
        );

        addMessage(
            "❌ AI connection error: " +
            error.message,
            "ai"
        );
    }
}

// =========================
// SEND BUTTON
// =========================

if (sendBtn) {
    sendBtn.addEventListener(
        "click",
        sendMessage
    );
}

// =========================
// ENTER KEY
// =========================

if (userInput) {
    userInput.addEventListener(
        "keydown",
        function (event) {
            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {
                event.preventDefault();

                sendMessage();
            }
        }
    );
}

// =========================
// NEW CHAT
// =========================

function startNewChat() {
    saveCurrentChat();

    currentChat = {
        id: null,
        title: "",
        messages: []
    };

    showWelcome();

    if (userInput) {
        userInput.value = "";
        userInput.focus();
    }

    renderChatHistory();

    closeMobileMenu();
}

newChatButtons.forEach(
    button => {
        button.addEventListener(
            "click",
            startNewChat
        );
    }
);

// =========================
// DARK MODE
// =========================

const darkModeBtn =
    document.getElementById(
        "darkModeBtn"
    );

function updateDarkModeButton() {
    if (!darkModeBtn) {
        return;
    }

    const isDark =
        document.body.classList.contains(
            "dark-mode"
        );

    if (isDark) {
        darkModeBtn.textContent = "☀️";
        darkModeBtn.title = "Light Mode";
    } else {
        darkModeBtn.textContent = "🌙";
        darkModeBtn.title = "Dark Mode";
    }
}

if (darkModeBtn) {
    darkModeBtn.addEventListener(
        "click",
        function () {
            document.body.classList.toggle(
                "dark-mode"
            );

            const isDark =
                document.body.classList.contains(
                    "dark-mode"
                );

            localStorage.setItem(
                "dulaaxDarkMode",
                isDark ? "true" : "false"
            );

            updateDarkModeButton();
        }
    );
}

// =========================
// LOAD DARK MODE
// =========================

if (
    localStorage.getItem(
        "dulaaxDarkMode"
    ) === "true"
) {
    document.body.classList.add(
        "dark-mode"
    );
}

updateDarkModeButton();

// =========================
// START APP
// =========================

showWelcome();
renderChatHistory();