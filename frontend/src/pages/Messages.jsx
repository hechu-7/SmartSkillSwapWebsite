import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { messageApi, userApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Send,
  MessageSquare,
  Search,
  CheckCheck,
  Check,
  User,
  Sparkles,
  Wifi,
  Clock,
} from 'lucide-react';

export const Messages = () => {
  const { user } = useAuth();
  const { connected, addMessageListener, removeMessageListener } = useSocket();
  const [searchParams] = useSearchParams();
  const initialPartnerId = searchParams.get('partnerId');

  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputContent, setInputContent] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  // Handle incoming STOMP messages in real time
  useEffect(() => {
    const handleIncomingMessage = (incomingMsg) => {
      // If message is from or to the current active chat partner, append to stream
      if (
        activePartner &&
        (incomingMsg.senderId === activePartner.id || incomingMsg.recipientId === activePartner.id)
      ) {
        setMessages((prev) => {
          // Prevent duplicates if already present
          if (prev.some((m) => m.id === incomingMsg.id)) return prev;
          return [...prev, incomingMsg];
        });
        // Mark as read
        if (incomingMsg.senderId === activePartner.id) {
          messageApi.markAsRead(activePartner.id).catch(() => {});
        }
      }
      // Refresh conversations list to update previews and unread counts
      loadConversations();
    };

    addMessageListener(handleIncomingMessage);
    return () => {
      removeMessageListener(handleIncomingMessage);
    };
  }, [activePartner]);

  // If partnerId was provided in URL query parameters, select that user
  useEffect(() => {
    if (initialPartnerId) {
      const pid = parseInt(initialPartnerId, 10);
      userApi.getProfile(pid).then((res) => {
        setActivePartner(res.data);
        loadMessages(pid);
      }).catch(() => {});
    }
  }, [initialPartnerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const res = await messageApi.getConversations();
      setConversations(res.data);
      if (!activePartner && res.data.length > 0 && !initialPartnerId) {
        selectPartner({
          id: res.data[0].partnerId,
          fullName: res.data[0].partnerName,
          email: res.data[0].partnerEmail,
          avatarUrl: res.data[0].partnerAvatar,
        });
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  const selectPartner = (partner) => {
    setActivePartner(partner);
    loadMessages(partner.id);
  };

  const loadMessages = async (partnerId) => {
    setLoadingHistory(true);
    try {
      const res = await messageApi.getConversation(partnerId);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to load message history from TiDB', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputContent.trim() || !activePartner || sending) return;

    const contentToSend = inputContent.trim();
    setInputContent('');
    setSending(true);

    try {
      const res = await messageApi.send({
        recipientId: activePartner.id,
        content: contentToSend,
      });

      // Optimistically append sent message
      setMessages((prev) => [...prev, res.data]);
      loadConversations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message');
      setInputContent(contentToSend);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.partnerName.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8.5rem)] rounded-3xl glass-panel border border-slate-800 flex overflow-hidden animate-fade-in shadow-2xl">
      {/* Left Contacts Sidebar */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-950/40">
        {/* Search header */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Direct Messages</span>
            </h2>
            <div className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              connected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{connected ? 'Live' : 'Connecting'}</span>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 space-y-2">
              <p>No active conversations yet.</p>
              <p className="text-[11px] text-slate-500">
                Go to <span className="text-indigo-400 font-semibold">Discover</span> to find mentors or peers and start chatting!
              </p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No contacts matching "{filterQuery}"
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = activePartner?.id === c.partnerId;
              return (
                <button
                  key={c.partnerId}
                  onClick={() =>
                    selectPartner({
                      id: c.partnerId,
                      fullName: c.partnerName,
                      email: c.partnerEmail,
                      avatarUrl: c.partnerAvatar,
                    })
                  }
                  className={`w-full p-4 flex items-start gap-3 text-left transition-all ${
                    isSelected ? 'bg-indigo-600/15 border-l-4 border-indigo-500' : 'hover:bg-slate-900/40'
                  }`}
                >
                  <img
                    src={c.partnerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.partnerEmail}`}
                    alt={c.partnerName}
                    className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-xs text-white truncate">{c.partnerName}</span>
                      {c.lastMessageTime && (
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">
                          {new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{c.lastMessage}</p>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-indigo-600 text-[10px] font-bold text-white self-center">
                      {c.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Chat Stream */}
      <div className="flex-1 flex flex-col bg-slate-950/20">
        {activePartner ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-3">
                <img
                  src={activePartner.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activePartner.email}`}
                  alt={activePartner.fullName}
                  className="w-10 h-10 rounded-xl bg-slate-800 border border-indigo-500/30"
                />
                <div>
                  <h3 className="font-bold text-sm text-white">{activePartner.fullName}</h3>
                  <div className="text-[11px] text-slate-400">{activePartner.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>TiDB Synchronized</span>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3">
              {loadingHistory ? (
                <div className="py-20 text-center text-xs text-slate-400">
                  Retrieving encrypted message history from TiDB...
                </div>
              ) : messages.length === 0 ? (
                <div className="py-20 text-center text-xs text-slate-400 space-y-2">
                  <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
                  <p className="text-white font-medium">Start the conversation</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Messages are delivered in real time over STOMP WebSocket and persisted in TiDB.
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.senderId === user?.id;
                  return (
                    <div
                      key={m.id || Math.random()}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          isMine
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-xs'
                            : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-xs'
                        }`}
                      >
                        {m.content}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 px-1">
                        <span>
                          {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </span>
                        {isMine && (
                          m.isRead ? <CheckCheck className="w-3 h-3 text-cyan-400" /> : <Check className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center gap-3">
              <input
                type="text"
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder={`Message ${activePartner.fullName}...`}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={sending || !inputContent.trim()}
                className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-indigo-400">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">Select a conversation</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Choose a partner from the left sidebar or visit Discover to message another student.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
