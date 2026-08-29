import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    MessageSquareText,
    Plus,
    Send,
    Stethoscope,
    UserRound,
    X,
} from "lucide-react";
import { toast } from "react-toastify";
import {
    clearMessages,
    getDoctorConversations,
    getDoctorMessages,
    getUserConversations,
    getUserMessages,
    markDoctorMessagesRead,
    markUserMessagesRead,
    resetMessageState,
    sendDoctorMessage,
    sendUserMessage,
} from "../features/Messages/MessageSlice.js";
import { getDoctorAppointments, getMyAppointments } from "../features/Appointment/AppointmentSlice.js";

const formatDate = (dateString, options = {}) => {
    if (!dateString) return "No date";
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) return "No date";

    return parsed.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        ...options,
    });
};

const getInitial = (value) => String(value || "M").trim().charAt(0).toUpperCase();

const getOtherParticipant = (conversation, userType) => {
    if (!conversation) return null;
    return userType === "user" ? conversation.doctor : conversation.patient;
};

const getParticipantName = (conversation, userType) => {
    const participant = getOtherParticipant(conversation, userType);
    return participant?.name || participant?.username || (userType === "user" ? "Doctor unavailable" : "Patient unavailable");
};

const getParticipantEmail = (conversation, userType) => {
    const participant = getOtherParticipant(conversation, userType);
    return participant?.email || "Contact details unavailable";
};

const isConversationAvailable = (conversation, userType) => {
    const participant = getOtherParticipant(conversation, userType);
    return Boolean(conversation?.isAvailable !== false && participant?._id);
};

const isOwnMessage = (message, userType) => {
    const role = message.sender?.role || message.senderRole || message.senderModel?.toLowerCase();
    return role === userType;
};

const getAppointmentLabel = (appointment, userType) => {
    const person = userType === "user"
        ? appointment.doctor?.name || appointment.doctor?.username || "Doctor unavailable"
        : appointment.patient?.username || appointment.patient?.name || "Patient unavailable";

    return `${formatDate(appointment.date, { year: "numeric" })} - ${person}`;
};

const EmptyPanel = ({ title, description, action }) => (
    <div className="flex h-full min-h-[24rem] items-center justify-center p-6 text-center">
        <div className="max-w-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-50 text-teal-700">
                <MessageSquareText className="h-8 w-8" />
            </div>
            <h3 className="mt-5 text-2xl font-bold text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            {action}
        </div>
    </div>
);

const ConversationPage = ({ userType }) => {
    const dispatch = useDispatch();
    const messagesEndRef = useRef(null);
    const { conversations, messages, isLoading, messagePagination } = useSelector((state) => state.messages);
    const { myAppointments, doctorAppointments } = useSelector((state) => state.appointment);

    const [activeConversation, setActiveConversation] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [showNewConversationModal, setShowNewConversationModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isAppointmentPickerOpen, setIsAppointmentPickerOpen] = useState(false);
    const [initialMessage, setInitialMessage] = useState("");

    const conversationList = Array.isArray(conversations) ? conversations : [];
    const currentConversation = conversationList.find((item) => item._id === activeConversation) || null;
    const currentAvailable = isConversationAvailable(currentConversation, userType);
    const availableAppointments = useMemo(() => {
        const appointments = userType === "user" ? myAppointments : doctorAppointments;
        return Array.isArray(appointments)
            ? appointments.filter((appointment) => (userType === "user" ? appointment?.doctor?._id : appointment?.patient?._id))
            : [];
    }, [doctorAppointments, myAppointments, userType]);

    useEffect(() => {
        if (userType === "user") {
            dispatch(getUserConversations());
            dispatch(getMyAppointments());
        } else if (userType === "doctor") {
            dispatch(getDoctorConversations());
            dispatch(getDoctorAppointments());
        }

        return () => {
            dispatch(resetMessageState());
        };
    }, [dispatch, userType]);

    // Keyed on the newest message, not the array: loading older history
    // prepends entries and must NOT yank the reader back to the bottom.
    const latestMessageId = messages[messages.length - 1]?._id;
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [latestMessageId]);

    const reloadConversations = () => (
        userType === "user" ? dispatch(getUserConversations()) : dispatch(getDoctorConversations())
    );

    const handleConversationClick = (conversation) => {
        setActiveConversation(conversation._id);

        if (!isConversationAvailable(conversation, userType)) {
            dispatch(clearMessages());
            return;
        }

        if (userType === "user") {
            dispatch(getUserMessages(conversation._id));
            dispatch(markUserMessagesRead(conversation._id));
        } else {
            dispatch(getDoctorMessages(conversation._id));
            dispatch(markDoctorMessagesRead(conversation._id));
        }
    };

    const loadOlderMessages = () => {
        if (!activeConversation || !messagePagination?.hasMore || isLoading) return;

        const args = { conversationId: activeConversation, page: (messagePagination.page || 1) + 1 };
        dispatch(userType === "user" ? getUserMessages(args) : getDoctorMessages(args));
    };

    const handleSendMessage = async (event) => {
        event.preventDefault();
        const content = newMessage.trim();

        if (!content || !currentConversation || !currentAvailable) return;

        const recipient = getOtherParticipant(currentConversation, userType);
        if (!recipient?._id) {
            toast.error("This contact is no longer available.");
            return;
        }

        setNewMessage("");

        const payload = {
            recipientId: recipient._id,
            content,
            attachments: [],
            appointmentId: currentConversation.lastMessage?.metadata?.appointment || null,
        };

        const action = userType === "user" ? sendUserMessage(payload) : sendDoctorMessage(payload);
        const result = await dispatch(action);

        if (!result.error) {
            reloadConversations();
        }
    };

    const handleStartNewConversation = async () => {
        if (!selectedAppointment || !initialMessage.trim()) {
            toast.warning("Please select an appointment and enter a message.");
            return;
        }

        const recipientId = userType === "user"
            ? selectedAppointment.doctor?._id
            : selectedAppointment.patient?._id;

        if (!recipientId) {
            toast.error("This appointment is missing contact details.");
            return;
        }

        const payload = {
            recipientId,
            content: initialMessage.trim(),
            attachments: [],
            appointmentId: selectedAppointment._id,
        };

        const result = await dispatch(userType === "user" ? sendUserMessage(payload) : sendDoctorMessage(payload));

        if (result.error) return;

        const refreshed = await reloadConversations();
        const refreshedList = Array.isArray(refreshed.payload?.data) ? refreshed.payload.data : [];
        const recipientConversation = refreshedList.find((conversation) => {
            const other = getOtherParticipant(conversation, userType);
            return String(other?._id) === String(recipientId);
        });

        setShowNewConversationModal(false);
        setSelectedAppointment(null);
        setIsAppointmentPickerOpen(false);
        setInitialMessage("");

        if (recipientConversation) {
            handleConversationClick(recipientConversation);
        }
    };

    const closeNewConversationModal = () => {
        setShowNewConversationModal(false);
        setSelectedAppointment(null);
        setIsAppointmentPickerOpen(false);
        setInitialMessage("");
    };

    return (
        <div className="w-full p-4 sm:p-6">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="grid min-h-[calc(100dvh-8rem)] lg:grid-cols-[24rem_1fr]">
                    <aside className="border-b border-slate-200 bg-slate-50/70 lg:border-b-0 lg:border-r">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white p-5">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Messages</p>
                                <h2 className="mt-1 text-xl font-bold text-slate-950">
                                    {userType === "user" ? "Care conversations" : "Patient conversations"}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowNewConversationModal(true)}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-sm transition hover:bg-teal-700"
                                aria-label="Start new conversation"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="max-h-[28rem] overflow-y-auto lg:max-h-[calc(100dvh-14rem)]">
                            {isLoading && !conversationList.length ? (
                                <div className="space-y-3 p-4">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="h-24 animate-pulse rounded-3xl bg-white" />
                                    ))}
                                </div>
                            ) : conversationList.length ? (
                                conversationList.map((conversation) => {
                                    const name = getParticipantName(conversation, userType);
                                    const available = isConversationAvailable(conversation, userType);
                                    const active = activeConversation === conversation._id;

                                    return (
                                        <button
                                            key={conversation._id}
                                            type="button"
                                            onClick={() => handleConversationClick(conversation)}
                                            className={`flex w-full gap-3 border-b border-slate-200 p-4 text-left transition ${active ? "bg-teal-50" : "bg-white hover:bg-slate-50"}`}
                                        >
                                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${available ? "bg-teal-100 text-teal-800" : "bg-amber-100 text-amber-800"}`}>
                                                {available ? getInitial(name) : <AlertCircle className="h-5 w-5" />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="truncate font-semibold text-slate-950">{name}</p>
                                                    {conversation.unreadCount > 0 ? (
                                                        <span className="rounded-full bg-teal-600 px-2 py-0.5 text-xs font-semibold text-white">
                                                            {conversation.unreadCount}
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <p className="mt-1 truncate text-sm text-slate-500">
                                                    {available ? conversation.lastMessage?.content || "No messages yet" : "Contact no longer available"}
                                                </p>
                                                <p className="mt-2 text-xs text-slate-400">
                                                    {conversation.lastMessage?.createdAt ? formatDate(conversation.lastMessage.createdAt) : "No activity yet"}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <EmptyPanel
                                    title="No conversations yet"
                                    description="Start with an appointment so your doctor and care notes stay connected."
                                    action={(
                                        <button
                                            type="button"
                                            onClick={() => setShowNewConversationModal(true)}
                                            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700"
                                        >
                                            <Plus className="h-4 w-4" />
                                            New conversation
                                        </button>
                                    )}
                                />
                            )}
                        </div>
                    </aside>

                    <main className="flex min-h-[36rem] flex-col bg-white">
                        {currentConversation ? (
                            <>
                                <header className="flex items-center justify-between gap-4 border-b border-slate-200 p-5">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${currentAvailable ? "bg-teal-100 text-teal-800" : "bg-amber-100 text-amber-800"}`}>
                                            {currentAvailable ? (
                                                userType === "user" ? <Stethoscope className="h-6 w-6" /> : <UserRound className="h-6 w-6" />
                                            ) : (
                                                <AlertCircle className="h-6 w-6" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="truncate text-xl font-bold text-slate-950">
                                                {getParticipantName(currentConversation, userType)}
                                            </h2>
                                            <p className="truncate text-sm text-slate-500">{getParticipantEmail(currentConversation, userType)}</p>
                                        </div>
                                    </div>
                                    <span className={`hidden rounded-full px-3 py-1 text-xs font-semibold sm:inline-flex ${currentAvailable ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
                                        {currentAvailable ? "Active" : "Unavailable"}
                                    </span>
                                </header>

                                {!currentAvailable ? (
                                    <EmptyPanel
                                        title="This conversation is unavailable"
                                        description="The linked contact no longer exists in the system, so this thread is kept for history only."
                                    />
                                ) : (
                                    <>
                                        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-white p-4 sm:p-6">
                                            {isLoading && !messages.length ? (
                                                <div className="flex h-full items-center justify-center">
                                                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
                                                </div>
                                            ) : messages.length ? (
                                                <div className="space-y-4">
                                                    {messagePagination?.hasMore ? (
                                                        <div className="flex justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={loadOlderMessages}
                                                                disabled={isLoading}
                                                                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-teal-200 hover:text-teal-700 disabled:opacity-50"
                                                            >
                                                                {isLoading ? "Loading..." : "Load older messages"}
                                                            </button>
                                                        </div>
                                                    ) : null}
                                                    {messages.map((message) => {
                                                        const own = isOwnMessage(message, userType);
                                                        return (
                                                            <div key={message._id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
                                                                <div className={`max-w-[85%] rounded-3xl px-4 py-3 shadow-sm sm:max-w-[70%] ${own ? "rounded-br-lg bg-teal-600 text-white" : "rounded-bl-lg border border-slate-200 bg-white text-slate-800"}`}>
                                                                    <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                                                                    <p className={`mt-2 text-[11px] ${own ? "text-teal-100" : "text-slate-400"}`}>
                                                                        {formatDate(message.createdAt)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    <div ref={messagesEndRef} />
                                                </div>
                                            ) : (
                                                <EmptyPanel
                                                    title="No messages yet"
                                                    description="Send the first message to keep this care conversation in one place."
                                                />
                                            )}
                                        </div>

                                        <form onSubmit={handleSendMessage} className="border-t border-slate-200 bg-white p-4">
                                            <div className="flex items-end gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-2 focus-within:border-teal-300 focus-within:ring-4 focus-within:ring-teal-50">
                                                <textarea
                                                    value={newMessage}
                                                    onChange={(event) => setNewMessage(event.target.value)}
                                                    placeholder="Write a message..."
                                                    rows={1}
                                                    className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm outline-none"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!newMessage.trim() || isLoading}
                                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                                                    aria-label="Send message"
                                                >
                                                    <Send className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                )}
                            </>
                        ) : (
                            <EmptyPanel
                                title="Select a conversation"
                                description={userType === "user"
                                    ? "Choose a care conversation or start a new one from an appointment."
                                    : "Choose a patient thread to review messages and follow-up notes."}
                            />
                        )}
                    </main>
                </div>
            </section>

            {showNewConversationModal ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
                    <div className="w-full max-w-xl rounded-3xl bg-white p-5 shadow-2xl sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">New message</p>
                                <h3 className="mt-2 text-2xl font-bold text-slate-950">Start conversation</h3>
                            </div>
                            <button
                                type="button"
                                onClick={closeNewConversationModal}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="relative">
                                <span className="text-sm font-semibold text-slate-700">Appointment</span>
                                <button
                                    type="button"
                                    className={`mt-2 flex w-full items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 text-left text-sm outline-none transition ${isAppointmentPickerOpen ? "border-teal-400 ring-4 ring-teal-50" : "border-slate-200 hover:border-teal-200"}`}
                                    onClick={() => {
                                        if (availableAppointments.length) {
                                            setIsAppointmentPickerOpen((value) => !value);
                                        }
                                    }}
                                    aria-expanded={isAppointmentPickerOpen}
                                    aria-haspopup="listbox"
                                    disabled={!availableAppointments.length}
                                >
                                    <span className={selectedAppointment ? "text-slate-950" : "text-slate-400"}>
                                        {selectedAppointment ? getAppointmentLabel(selectedAppointment, userType) : "Select an appointment"}
                                    </span>
                                    <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition ${isAppointmentPickerOpen ? "rotate-180" : ""}`} />
                                </button>

                                {isAppointmentPickerOpen ? (
                                    <div className="modal-scroll absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl" role="listbox">
                                        {availableAppointments.map((appointment) => {
                                            const active = selectedAppointment?._id === appointment._id;
                                            const person = userType === "user"
                                                ? appointment.doctor?.name || appointment.doctor?.username || "Doctor unavailable"
                                                : appointment.patient?.username || appointment.patient?.name || "Patient unavailable";

                                            return (
                                                <button
                                                    key={appointment._id}
                                                    type="button"
                                                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${active ? "bg-teal-50 text-teal-900" : "hover:bg-slate-50"}`}
                                                    onClick={() => {
                                                        setSelectedAppointment(appointment);
                                                        setIsAppointmentPickerOpen(false);
                                                    }}
                                                    role="option"
                                                    aria-selected={active}
                                                >
                                                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${active ? "bg-teal-600 text-white" : "bg-teal-50 text-teal-700"}`}>
                                                        <CalendarDays className="h-5 w-5" />
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block truncate text-sm font-semibold">{person}</span>
                                                        <span className="mt-0.5 block truncate text-xs text-slate-500">
                                                            {formatDate(appointment.date, { year: "numeric" })}
                                                        </span>
                                                    </span>
                                                    {active ? <CheckCircle2 className="h-4 w-4 text-teal-700" /> : null}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : null}
                            </div>

                            {!availableAppointments.length ? (
                                <div className="flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                                    <CalendarDays className="mt-0.5 h-5 w-5 shrink-0" />
                                    Conversations start from valid appointments. No message-ready appointments were found.
                                </div>
                            ) : null}

                            <label className="block">
                                <span className="text-sm font-semibold text-slate-700">Message</span>
                                <textarea
                                    className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50"
                                    rows={5}
                                    value={initialMessage}
                                    onChange={(event) => setInitialMessage(event.target.value)}
                                    placeholder="Write your first message..."
                                />
                            </label>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                onClick={closeNewConversationModal}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                                disabled={!selectedAppointment || !initialMessage.trim()}
                                onClick={handleStartNewConversation}
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Start conversation
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default ConversationPage;
