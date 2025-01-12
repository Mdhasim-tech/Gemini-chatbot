import { useState,useEffect} from 'react';
import './App.css';
import bot from './assets/bot.svg';
import user from './assets/user.svg';
import send from './assets/send.svg'
const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dots, setDots] = useState('.');

  const api_key = process.env.REACT_APP_GEMINI_API_KEY;
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${api_key}`;

  // Blinking dots effect
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : '.'));
    }, 500); // Change dots every 500ms

    return () => clearInterval(interval);
  }, [loading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    setMessages([...messages, { role: 'user', content: inputMessage }]);
    setInputMessage('');
    setLoading(true);
    setError(null);

    const uniqueId = generateUniqueId();

    // Add placeholder for the bot's response
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'model', content: '', uniqueId },
    ]);

    setTimeout(() => {
      const chatContainer = document.getElementById('chat_container');
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 0);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: inputMessage }],
            },
          ],
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const {
          candidates: [
            {
              content: {
                parts: [{ text }],
              },
            },
          ],
        } = data;

        simulateTyping(uniqueId, text);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const simulateTyping = (uniqueId, text) => {
    let index = 0;
    const messageDiv = document.getElementById(uniqueId);
    const interval = setInterval(() => {
      if (index < text.length) {
        messageDiv.innerHTML += text.charAt(index);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);
  };

  const generateUniqueId = () => {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
  };

  const chatStripe = (isAi, value, uniqueId) => {
    return (
      <div className={`wrapper ${isAi ? 'ai' : ''}`} key={uniqueId}>
        <div className="chat">
          <div className="profile">
            <img src={isAi ? bot : user} alt={isAi ? 'bot' : 'user'} />
          </div>
          <div className="message" id={uniqueId}>
            {value}
            {isAi && loading && !value && (
              <span className="blinking-dots">{dots}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="app">
      <h1>Chat with Gemini</h1>
      <div id="chat_container">
        {messages.map((msg, index) => {
          const uniqueId = msg.uniqueId || generateUniqueId();
          return chatStripe(msg.role === 'model', msg.content, uniqueId);
        })}
      </div>
      <div className="input-section">
        {!loading && (
          <form onSubmit={handleSendMessage}>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
            />
            <button type="submit" disabled={!inputMessage}>
              <img src={send} alt="send" />
            </button>
          </form>
        )}
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default App;

