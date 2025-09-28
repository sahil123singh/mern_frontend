import { io } from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaUserCircle, FaArrowLeft, FaTrash, FaTimes } from "react-icons/fa";
import Header from "../Header";
import { useLocation } from "react-router-dom";

const DEFAULT_AVATAR = "/default-avatar.png";

export default function Messages() {
    const [selectedChat, setSelectedChat] = useState(null);
    const [newMsg, setNewMsg] = useState("");
    const [chatHeads, setChatHeads] = useState([]);
    const [messages, setMessages] = useState([]);
    const [socketConnected, setSocketConnected] = useState(false);
    const [currentUserId, setCurrentUserId] = useState("");
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
    const socketRef = useRef();
    const location = useLocation();
    const messagesEndRef = useRef(null);
    const [showChatView, setShowChatView] = useState(false);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Format time
    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDateSeparator = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        if (messageDate.getTime() === today.getTime()) return "Today";
        else if (messageDate.getTime() === yesterday.getTime()) return "Yesterday";
        else if (now - date < 7 * 24 * 60 * 60 * 1000) return date.toLocaleDateString([], { weekday: 'long' });
        else return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
    };

    const shouldShowDateSeparator = (currentMsg, previousMsg) => {
        if (!previousMsg) return true;
        const currentDate = new Date(currentMsg.timestamp || currentMsg.time);
        const previousDate = new Date(previousMsg.timestamp || previousMsg.time);
        return currentDate.toDateString() !== previousDate.toDateString();
    };

    const getOtherUser = (chat) =>
        chat.receiverId._id === currentUserId ? chat.senderId.userInfo : chat.receiverId.userInfo;

    const truncateText = (text, maxLength = 18) =>
        text && text.length > maxLength ? text.substring(0, maxLength) + "..." : text || "";

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        setCurrentUserId(userId);

        socketRef.current = io("http://localhost:4000", {
            path: "/api/v1/connect",
            query: { userId }
        });

        // Initial connection and chat heads
        socketRef.current.on("connection", (data) => {
            setSocketConnected(true);
            let chatHeadsList = data.data?.chatHeads || [];

            if (location.state?.receiverId && location.state?.receiverInfo) {
                const existingChat = chatHeadsList.find(chat =>
                    (chat.senderId._id === location.state.receiverId || chat.receiverId._id === location.state.receiverId)
                );

                if (existingChat) handleChatSelect(existingChat, true);
                else {
                    const tempChatHead = {
                        _id: "temp_" + location.state.receiverId,
                        senderId: { _id: userId },
                        receiverId: location.state.receiverInfo,
                        lastMessage: '',
                        updatedAt: new Date().toISOString()
                    };
                    chatHeadsList = [tempChatHead, ...chatHeadsList];
                    handleChatSelect(tempChatHead, true);
                }
            }

            setChatHeads(chatHeadsList);
        });

        // New message
        socketRef.current.on("new_message", (data) => {
            if (!data.success || !data.data) return;

            const message = {
                id: data.data.messageId,
                text: data.data.message,
                timestamp: data.data.timestamp,
                senderId: data.data.senderId,
                receiverId: data.data.receiverId,
                senderProfileImage: data.data.senderInfo?.userInfo?.profileImage || DEFAULT_AVATAR,
                isSeen: data.data.isSeen || false
            };

            // Update messages
            setMessages(prevMessages => {
                const filtered = prevMessages.filter(msg => !msg.id.startsWith('temp_') || msg.id === message.id);
                if (!filtered.find(m => m.id === message.id)) filtered.push(message);
                return filtered;
            });

            // Update selected chat ID if temp
            setSelectedChat(prev => prev && prev._id.startsWith('temp_') ? { ...prev, _id: data.data.chatId } : prev);

            // Update chat head
            setChatHeads(prevChatHeads => prevChatHeads.map(chat => {
                if (chat._id === data.data.chatId || (chat._id.startsWith('temp_') && chat._id === selectedChat?._id)) {
                    return { ...chat, _id: data.data.chatId, lastMessage: data.data.message, updatedAt: data.data.timestamp };
                }
                return chat;
            }));
        });

        // Chat history
        socketRef.current.on("chat_history", (data) => {
            if (data.success && data.data.messages) {
                const formatted = data.data.messages.map(msg => ({
                    id: msg._id,
                    text: msg.message,
                    timestamp: msg.createdAt,
                    senderId: msg.senderId._id,
                    receiverId: msg.receiverId._id,
                    senderProfileImage: msg.senderId.userInfo?.profileImage || DEFAULT_AVATAR,
                    isSeen: msg.isSeen || false
                }));
                setMessages(formatted);

                // Mark last message as seen
                if (formatted.length) {
                    const lastMessage = formatted[formatted.length - 1];
                    if (lastMessage.receiverId === userId && !lastMessage.isSeen) {
                        socketRef.current.emit("message_seen", { messageId: lastMessage.id, userId });
                    }
                }
            }
        });

        // Error handling
        socketRef.current.on("message_error", (data) => alert(`Error: ${data.message}`));

        return () => socketRef.current.disconnect();
    }, []);

    // Scroll to bottom
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const handleChatSelect = (chat, fromProfile = false) => {
        setSelectedChat(chat);
        setMessages([]);
        if (socketRef.current) {
            const otherUserId = chat.senderId._id === currentUserId ? chat.receiverId._id : chat.senderId._id;
            socketRef.current.emit("join_room", { senderId: currentUserId, receiverId: otherUserId });
        }
        if (isMobileView && fromProfile) setShowChatView(true);
    };

    const handleBackToList = () => setShowChatView(false);

    const handleSend = () => {
        if (!newMsg.trim() || !selectedChat) return;

        const otherUserId = selectedChat.senderId._id === currentUserId ? selectedChat.receiverId._id : selectedChat.senderId._id;
        const currentTime = new Date();
        const tempMessage = {
            id: "temp_" + currentTime.getTime(),
            text: newMsg,
            timestamp: currentTime.toISOString(),
            senderId: currentUserId,
            receiverId: otherUserId,
            senderProfileImage: DEFAULT_AVATAR
        };

        setMessages(prev => [...prev, tempMessage]);

        // Update chatHeads lastMessage immediately
        setChatHeads(prev => {
            let found = false;
            const updated = prev.map(chat => {
                if (chat._id === selectedChat._id) {
                    found = true;
                    return { ...chat, lastMessage: newMsg, updatedAt: currentTime.toISOString() };
                }
                return chat;
            });
            if (!found && selectedChat._id.startsWith("temp_")) return [{ ...selectedChat, lastMessage: newMsg, updatedAt: currentTime.toISOString() }, ...prev];
            return updated;
        });

        const payload = { chatId: selectedChat._id.startsWith('temp_') ? null : selectedChat._id, senderId: currentUserId, receiverId: otherUserId, message: newMsg };
        socketRef.current.emit("send_message", payload);
        setNewMsg("");
    };

    // Delete single message
    const handleDeleteMessage = (messageId) => {
        socketRef.current.emit("delete_message", { messageId, userId: currentUserId });
        setMessages(prev => prev.filter(m => m.id !== messageId));
    };

    // Clear chat
    const handleClearChat = () => {
        if (!selectedChat) return;
        socketRef.current.emit("clear_chat", { chatId: selectedChat._id, userId: currentUserId });
        setMessages([]);
    };

    const getDisplayTime = (updatedAt) => {
        const date = new Date(updatedAt);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const yesterday = new Date(); yesterday.setDate(now.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();
        if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (isYesterday) return "Yesterday";
        return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    };

    return (
        <div className="d-flex flex-column vh-100">
            <Header />
            <div className="container-fluid flex-grow-1 d-flex justify-content-center py-2 px-1">
                <div className="row shadow-lg rounded overflow-hidden w-100" style={{ maxWidth: "1000px", height: "calc(100vh - 70px)" }}>

                    {/* Chat List */}
                    {(!isMobileView || !showChatView) && (
                        <div className={`col-12 ${isMobileView ? "" : "col-md-4"} d-flex flex-column mb-2 mb-md-0`} style={{ height: "100%" }}>
                            <div className={`card shadow-lg rounded-4 border-0 d-flex flex-column h-100 ${isMobileView ? 'mobile-chat-list' : ''}`}>
                                <div className={`p-2 fw-bold fs-5 text-center rounded-top-4 ${isMobileView ? 'mobile-chat-header' : ''}`} style={{ background: "linear-gradient(135deg, #6a11cb, #2575fc)", color: "white" }}>
                                    Chats {!socketConnected && <small>(Connecting...)</small>}
                                </div>
                                <div className={`flex-grow-1 overflow-auto chat-list-scroll px-2 ${isMobileView ? 'mobile-chat-content' : ''}`}>
                                    {chatHeads.length === 0 ? <div className="d-flex align-items-center justify-content-center h-100 text-muted">No chats available</div> :
                                        chatHeads.map(chat => {
                                            const otherUser = getOtherUser(chat);
                                            return (
                                                <div key={chat._id} onClick={() => { handleChatSelect(chat, false); isMobileView && setShowChatView(true); }} className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${selectedChat?._id === chat._id ? "bg-dark bg-opacity-25" : ""}`} style={{ cursor: "pointer", padding: "0.5rem 1rem" }}>
                                                    <div className="d-flex align-items-center">
                                                        {otherUser?.profileImage ? <img src={otherUser.profileImage} alt="profile" className="rounded-circle me-2" style={{ width: "40px", height: "40px", objectFit: "cover" }} /> : <FaUserCircle size={40} className="text-secondary me-2" />}
                                                        <div>
                                                            <div className="fw-semibold">{otherUser?.firstName + " " + otherUser?.lastName || otherUser?.email || "Unknown"}</div>
                                                            <div className="text-muted small">{truncateText(chat.lastMessage)}</div>
                                                        </div>
                                                    </div>
                                                    <small className="text-muted">{getDisplayTime(chat.updatedAt)}</small>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Message Window */}
                    {(!isMobileView || showChatView) && (
                        <div className={`col-12 ${isMobileView ? "" : "col-md-8"} d-flex flex-column`} style={{ height: "100%" }}>
                            {selectedChat ? (
                                <div className={`card shadow-lg rounded-4 border-0 d-flex flex-column h-100 ${isMobileView ? 'mobile-message-container' : ''}`}>
                                    {/* Chat Header */}
                                    <div className={`d-flex align-items-center p-2 rounded-top-4 ${isMobileView ? 'mobile-message-header' : ''}`} style={{ background: "linear-gradient(135deg, #6a11cb, #2575fc)", color: "white" }}>
                                        {isMobileView && <FaArrowLeft size={20} className="me-2" style={{ cursor: "pointer" }} onClick={handleBackToList} />}
                                        {getOtherUser(selectedChat)?.profileImage ? <img src={getOtherUser(selectedChat).profileImage} alt="profile" className="rounded-circle me-2" style={{ width: "35px", height: "35px", objectFit: "cover" }} /> : <FaUserCircle size={35} className="text-white me-2" />}
                                        <strong>{getOtherUser(selectedChat)?.firstName + " " + getOtherUser(selectedChat)?.lastName || "Unknown"}</strong>
                                        <FaTimes className="ms-auto" style={{ cursor: "pointer" }} onClick={handleClearChat} title="Clear Chat" />
                                    </div>

                                    {/* Messages */}
                                    <div className={`flex-grow-1 overflow-auto message-box-scroll px-2 py-2 d-flex flex-column ${isMobileView ? 'mobile-messages-content' : ''}`}>
                                        {messages.length === 0 ? <div className="d-flex align-items-center justify-content-center h-100 text-muted">No messages yet. Start the conversation!</div> :
                                            messages.map((msg, index) => (
                                                <div key={msg.id}>
                                                    {shouldShowDateSeparator(msg, messages[index - 1]) && <div className="d-flex justify-content-center my-3"><div className="px-3 py-1 bg-white rounded-pill shadow-sm border"><small className="text-muted fw-medium">{formatDateSeparator(msg.timestamp)}</small></div></div>}
                                                    <div className={`d-flex ${msg.senderId === currentUserId ? "justify-content-end" : "justify-content-start"} mb-2`}>
                                                        {msg.senderId !== currentUserId && <div className="me-2 d-flex align-items-end">{msg?.senderProfileImage ? <img src={msg.senderProfileImage} alt="profile" className="rounded-circle" style={{ width: "25px", height: "25px", objectFit: "cover" }} /> : <FaUserCircle size={25} className="text-secondary" />}</div>}
                                                        <div className={`d-flex flex-column ${msg.senderId === currentUserId ? "align-items-end" : "align-items-start"}`}>
                                                            <div className={`p-2 rounded-3 ${msg.senderId === currentUserId ? "bg-primary text-white" : "bg-secondary bg-opacity-75"}`} style={{ maxWidth: "300px", wordBreak: "break-word", position: "relative" }}>
                                                                {msg.text}
                                                                {msg.senderId === currentUserId && <FaTrash style={{ cursor: "pointer", position: "absolute", top: 2, right: 2, fontSize: "0.65rem" }} onClick={() => handleDeleteMessage(msg.id)} />}
                                                            </div>
                                                            <div className="px-1 text-muted" style={{ fontSize: "0.65rem", marginTop: "2px" }}>{formatMessageTime(msg.timestamp)}</div>
                                                        </div>
                                                        {msg.senderId === currentUserId && <div style={{ width: "25px" }} />}
                                                    </div>
                                                </div>
                                            ))}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input */}
                                    <div className={`p-2 border-top bg-light d-flex gap-2 ${isMobileView ? 'mobile-message-input' : ''}`}>
                                        <input type="text" className="form-control form-control-sm" placeholder="Type a message..." value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
                                        <button className="btn btn-dark btn-sm d-flex align-items-center" onClick={handleSend}><FaPaperPlane /></button>
                                    </div>
                                </div>
                            ) : <div className="d-flex align-items-center justify-content-center flex-grow-1">Select a chat to start messaging</div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
