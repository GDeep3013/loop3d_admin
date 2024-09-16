// apis/chatgptApi.js

export const sendChatGptPrompt = async (prompt) => {
    try {
        const url = 'https://api.openai.com/v1/chat/completions';  // OpenAI API URL
        const response = await fetch(url, {
            method: 'POST',  // HTTP method to send the prompt
            headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,  // API key from environment variables
                'Content-Type': 'application/json'  // Content-Type header
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',  // Model to use (replace with desired model)
                messages: [{ role: 'user', content: prompt }]  // Prompt data
            })
        });

        // Check if the response is successful
        if (response.ok) {
            return await response.json();  // Parse and return the JSON response
        } else {
            console.error('Failed to fetch response from ChatGPT');
            return null;
        }
    } catch (error) {
        console.error('Error sending prompt to ChatGPT:', error);  // Catch and log any error
        return null;
    }
};
