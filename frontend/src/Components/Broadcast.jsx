import React, { useState, useEffect } from 'react';
import { Send, Users, Mail, MessageSquare, Sparkles, CheckCircle } from 'lucide-react';
import { getUserStats, sendBroadcast } from '../APIs/AdminAPI';


export default function BroadcastComponent() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

  
     useEffect(() => {
        const fetchUsers = async () => {
          try {
            setLoading(true);
            const response = await getUserStats();
            console.log("userdata",response);
            const formattedUsers = response.map(user => {
              
              const joinDate = user.joinDate || user.createdAt;
              const dateObj = joinDate ? new Date(joinDate) : new Date();
              
              return {
                id: user._id,
                name: user.name || 'No Name',
                email: user.email,
                role: user.role || 'user',
                status: user.isActive ? 'active' : 'inactive',
                joined: dateObj,
                profilePic: user.profilePic,
                orders: user.orderCount || user.orders?.length || 0,
                spent: user.totalSpent || 0
              };
            });
            setUsers(formattedUsers);
          } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to load users. Please try again later.');
          } finally {
            setLoading(false);
          }
        };
        fetchUsers();
      }, []);

      const userCount = users.length;


  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return;
    
    setIsLoading(true);
    
    try {
    
        const response = await sendBroadcast(subject, message);
        console.log(response);
    setIsLoading(false);
    setIsSent(true);
    
    
    setTimeout(() => {
      setIsSent(false);
      setSubject('');
      setMessage('');
    }, 3000);
  } catch (error) {
    console.error('Error sending broadcast:', error);
    setIsLoading(false);
    setError('Failed to send broadcast. Please try again later.');
  }
};

  const isFormValid = subject.trim() && message.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full text-white mb-4 shadow-lg">
              <Mail className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Broadcast Message
          </h1>
          <p className="text-slate-600 text-lg">Send messages to all users in your project</p>
        </div>

        {/* Stats Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20 shadow-xl">
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-purple-600 mr-2" />
                <span className="text-2xl font-bold text-slate-800">{userCount}</span>
              </div>
              <p className="text-slate-600 text-sm">Total Recipients</p>
            </div>
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-slate-300 to-transparent"></div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6 text-blue-600 mr-2" />
                <span className="text-2xl font-bold text-slate-800">100%</span>
              </div>
              <p className="text-slate-600 text-sm">Delivery Rate</p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="space-y-6">
            {/* Subject Field */}
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Subject
              </label>
              <div className={`relative transition-all duration-300 ${
                focusedField === 'subject' ? 'transform scale-[1.02]' : ''
              }`}>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  onFocus={() => setFocusedField('subject')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your email subject..."
                  className="w-full px-4 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-slate-800 placeholder-slate-400 shadow-sm"
                />
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 pointer-events-none transition-opacity duration-300 ${
                  focusedField === 'subject' ? 'opacity-100' : 'opacity-0'
                }`}></div>
              </div>
            </div>

            {/* Message Field */}
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Message Content
              </label>
              <div className={`relative transition-all duration-300 ${
                focusedField === 'message' ? 'transform scale-[1.02]' : ''
              }`}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Write your message here..."
                  rows={8}
                  className="w-full px-4 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-slate-800 placeholder-slate-400 shadow-sm resize-none"
                />
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 pointer-events-none transition-opacity duration-300 ${
                  focusedField === 'message' ? 'opacity-100' : 'opacity-0'
                }`}></div>
              </div>
            </div>

            {/* Character Count */}
            <div className="text-right">
              <span className={`text-sm transition-colors duration-200 ${
                message.length > 500 ? 'text-orange-500' : 'text-slate-500'
              }`}>
                {message.length} characters
              </span>
            </div>

            {/* Send Button */}
            <div className="pt-4">
              <button
                onClick={handleSend}
                disabled={!isFormValid || isLoading}
                className={`relative w-full py-4 px-8 rounded-xl font-semibold text-white text-lg transition-all duration-300 transform ${
                  isFormValid && !isLoading
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-[1.02] hover:shadow-2xl shadow-lg'
                    : 'bg-slate-400 cursor-not-allowed'
                } ${isLoading ? 'animate-pulse' : ''}`}
              >
                {/* Button Background Animation */}
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 transition-opacity duration-300 ${
                  isFormValid && !isLoading ? 'opacity-100' : 'opacity-0'
                }`}></div>
                
                {/* Button Content */}
                <div className="relative flex items-center justify-center space-x-3">
                  {isSent ? (
                    <>
                      <CheckCircle className="w-6 h-6 animate-bounce" />
                      <span>Message Sent Successfully!</span>
                    </>
                  ) : isLoading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6" />
                      <span>Send to All Users</span>
                    </>
                  )}
                </div>

                {/* Ripple Effect */}
                {isLoading && (
                  <div className="absolute inset-0 rounded-xl">
                    <div className="absolute inset-0 rounded-xl bg-white/20 animate-ping"></div>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {(subject || message) && (
          <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl animate-fade-in">
            <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
              Message Preview
            </h3>
            <div className="bg-white/50 rounded-xl p-4 border border-slate-200">
              {subject && (
                <div className="mb-3">
                  <span className="text-sm font-medium text-slate-600">Subject:</span>
                  <p className="text-slate-800 font-medium">{subject}</p>
                </div>
              )}
              {message && (
                <div>
                  <span className="text-sm font-medium text-slate-600">Message:</span>
                  <p className="text-slate-700 whitespace-pre-wrap">{message}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Success Animation Overlay */}
      {isSent && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 shadow-2xl animate-bounce">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Success!</h3>
              <p className="text-slate-600">Your message has been sent to all users</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}