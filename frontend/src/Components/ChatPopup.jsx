import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import axios from "axios";

const ChatPopup = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi, how can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false); // ✅ NEW
  const chatRef = useRef();

  const TypingIndicator = () => (
    <div className="bg-gray-200 text-gray-900 text-sm px-4 py-2 rounded-lg max-w-[75%] break-words">
      <div className="flex items-center space-x-1">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );

  const displayTypingEffect = (fullText) => {
    let index = 0;
    const actualText = fullText;

    const type = () => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (!last || last.from !== "bot") return prev;

        const updated = {
          ...last,
          text: last.text + actualText.charAt(index),
        };

        return [...prev.slice(0, -1), updated];
      });

      index++;
      if (index < actualText.length) {
        setTimeout(type, 25);
      }
    };

    type();
  };

  const sendBotMessage = (text) => {
    const modifiedText = "_" + text;
    setMessages((prev) => [...prev, { from: "bot", text: "" }]);
    displayTypingEffect(modifiedText);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const userMsg = { from: "user", text: userMessage };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/chat", {
        message: userMessage,
      });

      setIsLoading(false);
      sendBotMessage(response.data.reply);
    } catch (error) {
      console.error("Chatbot error:", error);
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Oops, something went wrong. Please try again." },
      ]);
    }
  };

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white shadow-2xl rounded-xl flex flex-col overflow-hidden z-50">
      <div className="bg-black text-white p-4 font-bold text-lg flex justify-between items-center">
        Lensbot AI
        <button
          onClick={() => setShowConfirmation(true)} // ✅ show confirmation
          className="text-gray-300 hover:text-white text-xl"
        >
          &times;
        </button>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[500px] bg-gray-100">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`text-sm px-4 py-2 rounded-lg max-w-[75%] break-words ${
              msg.from === "user"
                ? "bg-blue-600 text-white ml-auto"
                : "bg-gray-200 text-gray-900"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={chatRef}></div>
      </div>

      <div className="flex p-2 gap-2 border-t">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          className="flex-1 px-3 py-2 text-sm border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="flex items-center justify-center w-8 h-8 bg-black text-white rounded-full hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <Send size={16} />
        </button>
      </div>

      {/* ✅ Confirmation Modal */}
      {showConfirmation && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-xs w-full text-center">
            <p className="text-lg font-semibold mb-4">
              Are you sure you want to close the chat?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              All messages will be lost.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  onClose(); // ✅ Confirm close
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Yes, Close
              </button>
              <button
                onClick={() => setShowConfirmation(false)} // ✅ Cancel
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
              >
                No, Stay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPopup;
