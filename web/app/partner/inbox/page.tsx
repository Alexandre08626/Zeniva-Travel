"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Send, Search } from 'lucide-react';
import { mockThreads } from '../../../src/lib/mockData';

export default function InboxPage() {
  const [threads, setThreads] = useState(mockThreads);
  const [selectedThread, setSelectedThread] = useState(threads[0]);
  const [messageText, setMessageText] = useState('');

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'host' as const,
      text: messageText,
      timestamp: new Date().toISOString()
    };

    // Update threads with new message
    setThreads(prev => prev.map(thread => 
      thread.id === selectedThread.id
        ? { 
            ...thread, 
            messages: [...thread.messages, newMessage],
            lastMessage: messageText,
            lastMessageAt: new Date().toISOString()
          }
        : thread
    ));

    // Update selected thread
    setSelectedThread(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      lastMessage: messageText,
      lastMessageAt: new Date().toISOString()
    }));

    setMessageText('');
    
    if (typeof window !== 'undefined') {
      window.showToast('Message sent successfully', 'success');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-emerald-600" />
          Inbox
        </h1>
        <p className="text-gray-600 mt-2">Communicate with your guests</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex" style={{ height: 'calc(100vh - 280px)' }}>
        {/* Threads List */}
        <div className="w-96 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
                className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left ${
                  selectedThread?.id === thread.id ? 'bg-emerald-50' : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <img src={thread.guestAvatar} alt={thread.guestName} className="w-10 h-10 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900 truncate">{thread.guestName}</span>
                      {thread.unread > 0 && (
                        <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-full">{thread.unread}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{thread.listingTitle}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 truncate">{thread.lastMessage}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(thread.lastMessageAt).toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <img src={selectedThread.guestAvatar} alt={selectedThread.guestName} className="w-10 h-10 rounded-full" />
              <div>
                <h3 className="font-semibold text-gray-900">{selectedThread.guestName}</h3>
                <p className="text-sm text-gray-600">{selectedThread.listingTitle}</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {selectedThread.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'host' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md px-4 py-3 rounded-lg ${
                  msg.sender === 'host'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === 'host' ? 'text-emerald-100' : 'text-gray-500'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
