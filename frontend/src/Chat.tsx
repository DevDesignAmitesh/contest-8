import { useRef, useState, type FormEvent } from "react";

type Message = {
  role: "user" | "assistant" | "error";
  content: string;
};

const API_URL = "http://localhost:4000/chat";

const SUGGESTED_QUESTIONS = [
  "Did the case manager follow all of the check-in guidelines in the last meeting?",
  "What are some key themes that Robert talks about?",
  "What things seem to be important to Robert?",
  "When should a client submit a grievance?",
  "Did the case manager use the 2nd principle of effective intervention in their last meeting?",
  "What do you think are the client's biggest risks/needs?",
  "What is Nathan's relationship with his family like?",
];

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();

    const query = input.trim();
    if (!query || loading) return;

    setMessages(prev => [...prev, { role: "user", content: query }]);
    setInput("");
    setLoading(true);

    try {
      const url = `${API_URL}?query=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const message = data?.message || `Request failed with status ${res.status}`;
        setMessages(prev => [...prev, { role: "error", content: message }]);
        return;
      }

      const answer =
        typeof data?.response === "string" ? data.response : JSON.stringify(data?.response ?? data, null, 2);

      setMessages(prev => [...prev, { role: "assistant", content: answer }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "error", content: err instanceof Error ? err.message : "Something went wrong" },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto h-screen py-8">
      <h1 className="text-2xl font-bold mb-4 text-center">Chat</h1>

      <div className="flex-1 flex flex-col gap-3 overflow-y-auto bg-[#1a1a1a] border-2 border-[#fbf0df] rounded-xl p-4 mb-4">
        {messages.length === 0 && (
          <p className="text-[#fbf0df]/40 text-center my-auto">Ask something to get started</p>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 whitespace-pre-wrap text-left text-sm ${
                msg.role === "user"
                  ? "bg-[#fbf0df] text-[#1a1a1a]"
                  : msg.role === "error"
                    ? "bg-red-900/40 text-red-300 border border-red-500/50"
                    : "bg-[#2a2a2a] text-[#fbf0df]"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#2a2a2a] text-[#fbf0df]/60 rounded-lg px-3 py-2 text-sm italic">Thinking...</div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <select
        value=""
        onChange={e => {
          if (e.target.value) setInput(e.target.value);
        }}
        className="mb-2 bg-[#1a1a1a] border-2 border-[#fbf0df] rounded-xl px-4 py-2 text-[#fbf0df]/60 outline-none focus:border-[#f3d5a3] cursor-pointer"
      >
        <option value="" disabled className="bg-[#1a1a1a] text-[#fbf0df]/60">
          Suggested questions (optional)
        </option>
        {SUGGESTED_QUESTIONS.map(q => (
          <option key={q} value={q} className="bg-[#1a1a1a] text-[#fbf0df]">
            {q}
          </option>
        ))}
      </select>

      <form onSubmit={sendMessage} className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-[#1a1a1a] border-2 border-[#fbf0df] rounded-xl px-4 py-2 text-[#fbf0df] outline-none focus:border-[#f3d5a3] placeholder-[#fbf0df]/40"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-[#fbf0df] text-[#1a1a1a] border-0 px-5 py-2 rounded-xl font-bold transition-all duration-100 hover:bg-[#f3d5a3] hover:-translate-y-px cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          Send
        </button>
      </form>
    </div>
  );
}
