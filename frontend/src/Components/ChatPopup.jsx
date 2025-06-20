import { useState, useEffect, useRef } from "react";

const ChatPopup = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi, how can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const chatRef = useRef();

  const displayTypingEffect = (fullText) => {
  let index = 0; // Start from index 1 to skip the dummy character (e.g., "_")
  const actualText = fullText; // The dummy will be stripped before setting

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
  const modifiedText = "_" + text; // Add dummy underscore character
  setMessages((prev) => [...prev, { from: "bot", text: "" }]);
  displayTypingEffect(modifiedText);
};


  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await fetch("http://127.0.0.1:5000/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      console.log("Intent:", data.intent);
      console.log("Response:", data.response);

      sendBotMessage(data.response);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Oops, something went wrong." },
      ]);
    }

    setInput("");
  };

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white shadow-2xl rounded-xl flex flex-col overflow-hidden z-50">
      <div className="bg-black text-white p-4 font-bold text-lg flex justify-between items-center">
        LensBox AI
        <button onClick={onClose} className="text-gray-300 hover:text-white">
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
        <div ref={chatRef}></div>
      </div>

      <div className="flex p-2 border-t">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 px-3 py-2 text-sm border rounded-l-lg focus:outline-none"
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          className="bg-black text-white px-4 rounded-r-lg text-sm hover:bg-gray-800"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPopup;
