import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { resetConversation, sendMessage } from "./api.js";
import "./App.css";

const EXAMPLES = [
  "I have 3 days in Marrakech, what should I see?",
  "How do I get from Fès to Chefchaouen?",
  "Is bargaining normal in the souks?",
];

const LIMITS = [
  "No real-time information: prices, opening hours, train times and weather are estimates. Check official sources.",
  "Rihla cannot book anything (hotels, trains, tours).",
  "It only answers questions about travel in Morocco.",
  "No medical or legal advice. For visas, check the official consulate website.",
  "It can make mistakes: always double-check important information.",
];

function App() {
  const [messages, setMessages] = useState([]); // [{ role: "user" | "assistant", content: "..." }]
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLimits, setShowLimits] = useState(false);
  const bottomRef = useRef(null);

  // Scroll to the last message when a message is added
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(text) {
    const message = text.trim();
    if (!message || loading) return;

    setError("");
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setLoading(true);

    try {
      const data = await sendMessage(message, conversationId);
      setConversationId(data.conversation_id);
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err) {
      // The message was not answered: remove it and put it back in the input to try again
      setMessages((prev) => prev.slice(0, -1));
      setInput(message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleNewConversation() {
    if (conversationId) {
      try {
        await resetConversation(conversationId);
      } catch {
        // Even if the server is unreachable, we start a new conversation on screen
      }
    }
    setConversationId(null);
    setMessages([]);
    setInput("");
    setError("");
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Rihla</h1>
          <p>Your travel guide for Morocco</p>
        </div>
        <div className="header-buttons">
          <button onClick={() => setShowLimits(!showLimits)}>
            {showLimits ? "Hide limits" : "Limits"}
          </button>
          <button onClick={handleNewConversation} disabled={loading}>
            New conversation
          </button>
        </div>
      </header>

      {showLimits && (
        <section className="limits">
          <h2>What Rihla can't do</h2>
          <ul>
            {LIMITS.map((limit) => (
              <li key={limit}>{limit}</li>
            ))}
          </ul>
        </section>
      )}

      <main className="chat">
        {messages.length === 0 && (
          <div className="welcome">
            <p>
              Hi! I'm <strong>Rihla</strong>. I can help you plan your trip in Morocco: cities to
              visit, getting around, local customs, food and budget.
            </p>
            <p>Try one of these questions:</p>
            <div className="examples">
              {EXAMPLES.map((example) => (
                <button key={example} onClick={() => handleSend(example)}>
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.role === "assistant" ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
          </div>
        ))}

        {loading && <div className="message assistant typing">Rihla is writing…</div>}
        <div ref={bottomRef} />
      </main>

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}

      <form
        className="input-bar"
        onSubmit={(event) => {
          event.preventDefault();
          handleSend(input);
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask a question about your trip…"
          maxLength={2000}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default App;
