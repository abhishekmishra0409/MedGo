import { useState } from "react";
import axios from "axios";
import { Copy, Video } from "lucide-react";
import { toast } from "react-toastify";
import { buildApiUrl, createAuthConfig, getErrorMessage } from "../../utils/api.js";

const copy = async (value, label) => {
    try {
        await navigator.clipboard.writeText(value);
        toast.success(`${label} copied`);
    } catch {
        // Clipboard is blocked outside secure contexts. The value is on screen
        // to read off, which is the whole point of the fallback.
        toast.info(`Copy manually: ${value}`);
    }
};

/**
 * Two doors into the same call, which is what the patient actually needs when
 * the first one fails: a personal link, and the meeting id + code to type by
 * hand. Both come from one POST — the room is created on the first click.
 */
const JoinTeleconsultation = ({ appointment, tokenKey }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fallback, setFallback] = useState(null);

    if (appointment?.type !== "teleconsultation" || appointment?.status !== "confirmed") {
        return null;
    }

    const handleJoin = async () => {
        setLoading(true);
        setError("");

        try {
            const { data } = await axios.post(
                buildApiUrl(`appointments/${appointment._id}/teleconsultation/join`),
                {},
                createAuthConfig(tokenKey),
            );

            const join = data?.data;
            setFallback(join);

            if (!join?.joinLink) {
                setError("Your personal link is unavailable — use the meeting code below.");
            } else if (!window.open(join.joinLink, "_blank", "noopener")) {
                // Blocked pop-up returns null. Silently doing nothing here read
                // as a dead button; the link below is the same door, hand-clicked.
                setError("Your browser blocked the pop-up — open the call with the link below.");
            }
        } catch (err) {
            // The server's message is the useful part here: "opens 15 minutes
            // before your slot", "this appointment is pending", and so on.
            setError(getErrorMessage(err, "Could not open the call. Please try again."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <button
                type="button"
                onClick={handleJoin}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
                <Video className="h-4 w-4" />
                {loading ? "Opening…" : "Join call"}
            </button>

            {error ? (
                <p className="rounded-2xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">{error}</p>
            ) : null}

            {fallback?.joinCode ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                    <p className="font-semibold text-slate-950">Link didn&apos;t open?</p>
                    {fallback.joinLink ? (
                        <p className="mt-1">
                            <a
                                href={fallback.joinLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-teal-700 underline"
                            >
                                Open the call in a new tab
                            </a>{" "}
                            — this is your personal link, it lets you straight in.
                        </p>
                    ) : null}
                    <p className="mt-2">
                        Or go to{" "}
                        <a
                            href={fallback.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-teal-700 underline"
                        >
                            {fallback.meetingUrl}
                        </a>{" "}
                        and enter the meeting code. That route asks the doctor to
                        admit you, so it only works once they have joined.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => copy(fallback.meetingId, "Meeting ID")}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 font-mono font-semibold text-slate-950"
                        >
                            {fallback.meetingId}
                            <Copy className="h-3 w-3 text-slate-500" />
                        </button>
                        <button
                            type="button"
                            onClick={() => copy(fallback.joinCode, "Meeting code")}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 font-mono font-semibold text-slate-950"
                        >
                            {fallback.joinCode}
                            <Copy className="h-3 w-3 text-slate-500" />
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default JoinTeleconsultation;
