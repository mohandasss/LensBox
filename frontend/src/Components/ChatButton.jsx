import { useState } from 'react';
import ChatPopup from './ChatPopup';
import { MessageCircle } from 'lucide-react'; // optional icon

const ChatButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg animate-bounce hover:scale-105 transition-transform"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      </div>
      {open && <ChatPopup onClose={() => setOpen(false)} />}
    </>
  );
};

export default ChatButton;
