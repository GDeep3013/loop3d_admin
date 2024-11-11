// pages/ChatGPTPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import AuthLayout from '../layout/Auth'
import { sendChatGptPrompt } from '../apis/chatgptApi';
const ChatGPTPage = () => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSendPrompt = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await sendChatGptPrompt(prompt);

             } catch (err) {
                setError('Failed to connect to ChatGPT API.');
            } finally {
                setLoading(false);
            }
        };

        return (
            <>
                <AuthLayout title={"Chat-Bot"} >
                    <div className="chat-container">
                        <h1>Chat with ChatGPT</h1>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Type your prompt here..."
                            rows="5"
                            cols="50"
                        />
                        <button onClick={handleSendPrompt} disabled={loading}>
                            {loading ? 'Loading...' : 'Send'}
                        </button>

                        {error && <p className="error">{error}</p>}

                        {response && (
                            <div className="response-container">
                                <h3>Response from ChatGPT:</h3>
                                <p>{response}</p>
                            </div>
                        )}
                    </div>
                </AuthLayout>
            </>
        );
    };

    export default ChatGPTPage;
