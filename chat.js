async function sendMessage() {
    const input = document.getElementById("userInput");
    const chatbox = document.getElementById("chatbox");

    const userText = input.value;
    if (!userText) return;

    chatbox.innerHTML += `<p><b>You:</b> ${userText}</p>`;
    input.value = "";

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer YOUR_API_KEY" // ⚠️ KEEP THIS
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "system",
                        content: "You are a medical assistant. Give general advice only. Do not diagnose."
                    },
                    {
                        role: "user",
                        content: userText
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            chatbox.innerHTML += `<p><b>AI:</b> Error: ${errorText}</p>`;
            return;
        }

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            chatbox.innerHTML += `<p><b>AI:</b> ${data.choices[0].message.content}</p>`;
        } else {
            chatbox.innerHTML += `<p><b>AI:</b> Unexpected response</p>`;
        }

        chatbox.scrollTop = chatbox.scrollHeight;

    } catch (error) {
        chatbox.innerHTML += `<p><b>AI:</b> Connection error</p>`;
    }
}