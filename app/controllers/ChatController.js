const axios = require('axios');

const ChatController = {
  // Method to handle sending prompt to ChatGPT
  sendPromptToChatGPT: async (req, res) => {
    const { prompt } = req.body;

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',  // Replace with the desired model
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer YOUR_OPENAI_API_KEY`, // Replace with your OpenAI API key
            'Content-Type': 'application/json',
          },
        }
      );

      res.json(response.data); // Send the API response back to the client
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error connecting to ChatGPT API' });
    }
  },
};

module.exports = ChatController;
