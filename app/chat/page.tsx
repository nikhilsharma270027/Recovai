"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sidebar } from '@/components/SideBar';
import { useAuth } from 'context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Paperclip, Mic, Image, Smile, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';

const ChatPage = () => {
  const { user, loading, logout } = useAuth();
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "👋 Hi there! I'm your medical AI assistant. I can help you understand your medical reports and answer health-related questions.", 
      sender: 'bot', 
      timestamp: new Date() 
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;3
      
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!user?.uid) {
      setError('Please login to continue');
      return;
    }

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setError('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
          user_id: user.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const botMessage = {
        id: messages.length + 2,
        text: data.response,
        sender: 'bot',
        timestamp: new Date(),
        documents: data.documents, // Add source documents
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setError('Failed to get response. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen w-full bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Header */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/ai-avatar.png" />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">AI</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">AI Assistant</h2>
              {isTyping && <p className="text-sm text-gray-500">typing...</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
            <Button variant="ghost" onClick={logout}>Logout</Button>
          </div>
        </header>

        {/* Enhanced Chat Container */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 p-6">
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-3 animate-slideIn",
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.sender === 'bot' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl p-4 shadow-sm",
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'bg-white text-gray-800 border border-gray-100'
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    {message.documents && (
                      <div className="mt-2 text-xs text-gray-400">
                        <p>Sources:</p>
                        <ul className="list-disc list-inside">
                          {message.documents.map((doc, index) => (
                            <li key={index}>{doc}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <span className={cn(
                      "text-xs mt-2 block",
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                    )}>
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  {message.sender === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {error && (
                <div className="text-center text-red-500 text-sm mt-2">
                  {error}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Enhanced Input Area */}
          <div className="bg-white p-4 rounded-lg shadow-lg mt-4 border">
            <div className="flex items-center gap-2">
              <Tooltip content="Attach file">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-blue-500">
                  <Paperclip className="h-5 w-5" />
                </Button>
              </Tooltip>
              <Tooltip content="Add image">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-blue-500">
                  <Image className="h-5 w-5" />
                </Button>
              </Tooltip>
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 border-none focus:ring-1 focus:ring-blue-500 bg-gray-50 rounded-full px-6 py-4"
              />
              <Tooltip content="Add emoji">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-blue-500">
                  <Smile className="h-5 w-5" />
                </Button>
              </Tooltip>
              <Button
                onClick={handleSend}
                className="bg-blue-600 hover:bg-blue-700 rounded-full px-6"
              >
                <Send className="h-5 w-5 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;