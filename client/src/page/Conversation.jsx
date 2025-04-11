import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    getUserConversations,
    getUserMessages,
    markUserMessagesRead,
    sendUserMessage,
    getDoctorConversations,
    getDoctorMessages,
    markDoctorMessagesRead,
    sendDoctorMessage,
    resetMessageState,
} from '../features/Messages/MessageSlice.js';
import { getMyAppointments, getDoctorAppointments } from '../features/Appointment/AppointmentSlice.js';
import { toast } from 'react-toastify';

const ConversationPage = ({ userType }) => {
    const dispatch = useDispatch();
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    const {
        conversations,
        messages,
        isLoading,
        isSuccess,
        isError,
        message: errorMessage,
    } = useSelector((state) => state.messages);

    // console.log(messages)

    const { myAppointments, doctorAppointments } = useSelector((state) => state.appointment);

    const [activeConversation, setActiveConversation] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [showNewConversationModal, setShowNewConversationModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [initialMessage, setInitialMessage] = useState('');

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Load conversations and appointments based on user type
    useEffect(() => {
        if (userType === 'user') {
            dispatch(getUserConversations());
            dispatch(getMyAppointments());
        } else if (userType === 'doctor') {
            dispatch(getDoctorConversations());
            dispatch(getDoctorAppointments());
        }

        return () => {
            dispatch(resetMessageState());
        };
    }, [dispatch, userType]);

    // Handle errors
    useEffect(() => {
        if (isError) {
            toast.error(errorMessage);
        }
    }, [isError, errorMessage]);

    // Handle conversation click
    const handleConversationClick = (conversationId) => {
        setActiveConversation(conversationId);

        if (userType === 'user') {
            dispatch(getUserMessages(conversationId));
            dispatch(markUserMessagesRead(conversationId));
        } else if (userType === 'doctor') {
            dispatch(getDoctorMessages(conversationId));
            dispatch(markDoctorMessagesRead(conversationId));
        }
    };

    // Handle send message
    const handleSendMessage = (e) => {
        e.preventDefault();

        if (!newMessage.trim()) return;

        // For existing conversation
        if (activeConversation) {
            const currentConversation = conversations.find(c => c._id === activeConversation);
            if (!currentConversation) return;

            const messageData = {
                recipientId: userType === 'user'
                    ? currentConversation.doctor._id
                    : currentConversation.patient._id,
                content: newMessage,
                attachments: [],
                appointmentId: currentConversation.lastMessage?.metadata?.appointment || null
            };

            if (userType === 'user') {
                dispatch(sendUserMessage(messageData));
            } else if (userType === 'doctor') {
                dispatch(sendDoctorMessage(messageData));
            }
        }

        setNewMessage('');
    };

    // Handle start new conversation
    const handleStartNewConversation = async () => {
        if (!selectedAppointment || !initialMessage.trim()) {
            toast.warning('Please select an appointment and enter a message');
            return;
        }

        const messageData = {
            recipientId: userType === 'user'
                ? selectedAppointment.doctor._id
                : selectedAppointment.patient._id,
            content: initialMessage,
            attachments: [],
            appointmentId: selectedAppointment._id
        };

        try {
            // Send the initial message which will create the conversation
            const resultAction = userType === 'user'
                ? await dispatch(sendUserMessage(messageData))
                : await dispatch(sendDoctorMessage(messageData));

            if (resultAction.payload) {
                // Reload conversations to include the new one
                userType === 'user'
                    ? await dispatch(getUserConversations())
                    : await dispatch(getDoctorConversations());

                // Find and activate the new conversation
                const newConversation = conversations.find(
                    conv => conv.lastMessage?._id === resultAction.payload._id
                );

                if (newConversation) {
                    setActiveConversation(newConversation._id);
                    setShowNewConversationModal(false);
                    setSelectedAppointment(null);
                    setInitialMessage('');
                    toast.success('Conversation started successfully');

                    // Load messages for the new conversation
                    userType === 'user'
                        ? dispatch(getUserMessages(newConversation._id))
                        : dispatch(getDoctorMessages(newConversation._id));
                }
            }
        } catch (error) {
            toast.error('Failed to start conversation');
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Get the other participant's name
    const getParticipantName = (conversation) => {
        if (userType === 'user') {
            return `${conversation.doctor?.name || 'Unknown'}`;
        } else {
            return conversation.patient?.username || 'Unknown User';
        }
    };

    // Get appointments for new conversation
    const getAvailableAppointments = () => {
        return userType === 'user' ? myAppointments : doctorAppointments;
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar with conversations */}
            <div className="w-1/3 border-r border-gray-300 bg-white">
                <div className="p-4 border-b border-gray-300 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                        {userType === 'user' ? 'Your Conversations' : 'Patient Conversations'}
                    </h2>
                    <button
                        onClick={() => setShowNewConversationModal(true)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 text-sm"
                    >
                        New
                    </button>
                </div>

                <div className="overflow-y-auto h-[calc(100%-60px)]">
                    {isLoading && conversations.length === 0 ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="flex justify-center items-center h-full text-gray-500">
                            No conversations found
                        </div>
                    ) : (
                        conversations.map((conversation) => (
                            <div
                                key={conversation._id}
                                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                                    activeConversation === conversation._id ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => handleConversationClick(conversation._id)}
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="font-medium">
                                        {getParticipantName(conversation)}
                                    </h3>
                                    {conversation.unreadCount > 0 && (
                                        <span className="h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                                            {conversation.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 truncate">
                                    {conversation.lastMessage?.content || 'No messages yet'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {conversation.lastMessage?.createdAt
                                        ? formatDate(conversation.lastMessage.createdAt)
                                        : 'No date'}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main chat area */}
            <div className="flex flex-col w-2/3">
                {activeConversation ? (
                    <>
                        {/* Chat header */}
                        <div className="p-4 border-b border-gray-300 bg-white">
                            <h2 className="text-xl font-semibold">
                                {userType === 'user'
                                    ? `Conversation with ${
                                        conversations.find(c => c._id === activeConversation)?.doctor?.name || 'Unknown'
                                    }`
                                    : `Conversation with ${
                                        conversations.find(c => c._id === activeConversation)?.patient?.username || 'Unknown User'
                                    }`}
                            </h2>
                        </div>

                        {/* Messages container with reverse flex column */}
                        <div
                            ref={messagesContainerRef}
                            className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col-reverse"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                            }}
                        >
                            <div>
                                {isLoading && messages.length === 0 ? (
                                    <div className="flex justify-center items-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex justify-center items-center h-full text-gray-500">
                                        No messages in this conversation
                                    </div>
                                ) : (
                                    <>
                                        {/* Messages will render here*/}
                                        {messages.map((msg) => (
                                            <div
                                                key={msg._id}
                                                className={`mb-4 flex ${
                                                    msg.senderModel?.toLowerCase() === userType ? 'justify-end' : 'justify-start'
                                                }`}
                                            >
                                                <div
                                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                        msg.senderModel?.toLowerCase() === userType
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-white border border-gray-300'
                                                    }`}
                                                >
                                                    <p>{msg.content}</p>
                                                    <p
                                                        className={`text-xs mt-1 ${
                                                            msg.senderModel?.toLowerCase() === userType ? 'text-blue-100' : 'text-gray-500'
                                                        }`}
                                                    >
                                                        {formatDate(msg.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {/* This empty div should be at the bottom for auto-scrolling */}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Message input */}
                        <div className="p-4 border-t border-gray-300 bg-white">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || isLoading}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex justify-center items-center h-full text-gray-500">
                        {userType === 'user'
                            ? 'Select a conversation or create a new one to view messages'
                            : 'Select a conversation to view messages'}
                    </div>
                )}
            </div>

            {/* New Conversation Modal */}
            {showNewConversationModal && (
                <div className="fixed inset-0 flex items-center justify-center p-4 z-50"
                     style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4">Start New Conversation</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Appointment
                            </label>
                            <select
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedAppointment?._id || ''}
                                onChange={(e) => {
                                    const appointment = getAvailableAppointments().find(a => a._id === e.target.value);
                                    setSelectedAppointment(appointment || null);
                                }}
                            >
                                <option value="">Select an appointment</option>
                                {getAvailableAppointments().map((appointment) => (
                                    <option key={appointment._id} value={appointment._id}>
                                        {formatDate(appointment.date)} - {userType === 'user'
                                        ? `${appointment.doctor?.name}`
                                        : appointment.patient?.username}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Initial Message
                            </label>
                            <textarea
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                value={initialMessage}
                                onChange={(e) => setInitialMessage(e.target.value)}
                                placeholder={`Type your initial message to the ${userType === 'user' ? 'doctor' : 'patient'}...`}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                onClick={() => {
                                    setShowNewConversationModal(false);
                                    setSelectedAppointment(null);
                                    setInitialMessage('');
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                                disabled={!selectedAppointment || !initialMessage.trim()}
                                onClick={handleStartNewConversation}
                            >
                                Start Conversation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConversationPage;