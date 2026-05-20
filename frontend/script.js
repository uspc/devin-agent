const chatContainer = document.getElementById("chatContainer");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const conversationHistory = [];

function addMessage(role, content) {
  const welcome = chatContainer.querySelector(".welcome-message");
  if (welcome) welcome.remove();

  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", role);

  const label = document.createElement("div");
  label.classList.add("message-label");
  label.textContent = role === "user" ? "You" : "Assistant";

  const bubble = document.createElement("div");
  bubble.classList.add("message-bubble");
  bubble.textContent = content;

  messageDiv.appendChild(label);
  messageDiv.appendChild(bubble);
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  return bubble;
}

function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.classList.add("error-message");
  errorDiv.textContent = message;
  chatContainer.appendChild(errorDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function setLoading(loading) {
  sendBtn.disabled = loading;
  userInput.disabled = loading;
}

async function sendMessage(userText) {
  addMessage("user", userText);
  conversationHistory.push({ role: "user", content: userText });

  setLoading(true);

  const assistantBubble = addMessage("assistant", "");
  let fullContent = "";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: conversationHistory,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Request failed");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      const lines = text.split("\n");

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();

        if (data === "[DONE]") break;

        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            showError(parsed.error);
            break;
          }
          if (parsed.token) {
            fullContent += parsed.token;
            assistantBubble.textContent = fullContent;
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        } catch {
          // skip malformed JSON
        }
      }
    }

    if (fullContent) {
      conversationHistory.push({ role: "assistant", content: fullContent });
    }
  } catch (error) {
    assistantBubble.remove();
    assistantBubble.previousElementSibling?.remove();
    showError(`Error: ${error.message}`);
  } finally {
    setLoading(false);
    userInput.focus();
  }
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;
  userInput.value = "";
  userInput.style.height = "auto";
  sendMessage(text);
});

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    chatForm.dispatchEvent(new Event("submit"));
  }
});

userInput.addEventListener("input", () => {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(userInput.scrollHeight, 150) + "px";
});
