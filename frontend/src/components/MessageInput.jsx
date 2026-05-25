import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X, Mic, Trash2, Smile } from "lucide-react";
import toast from "react-hot-toast";

const STICKERS = [
  { id: "s1", name: "Tears of Joy", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Smileys/Face%20With%20Tears%20Of%20Joy.webp" },
  { id: "s2", name: "Heart Eyes", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Smileys/Smiling%20Face%20With%20Hearts.webp" },
  { id: "s3", name: "Blow Kiss", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Smileys/Face%20Blowing%20A%20Kiss.webp" },
  { id: "s4", name: "Partying Face", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Smileys/Partying%20Face.webp" },
  { id: "s5", name: "Loudly Crying", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Smileys/Loudly%20Crying%20Face.webp" },
  { id: "s6", name: "Thumbs Up", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/People/Thumbs%20Up.webp" },
  { id: "s7", name: "Waving Hand", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/People/Waving%20Hand.webp" },
  { id: "s8", name: "Thinking Face", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Smileys/Thinking%20Face.webp" },
  { id: "s9", name: "Screaming Fear", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Smileys/Face%20Screaming%20In%20Fear.webp" },
  { id: "s10", name: "Star Struck", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Smileys/Star%20Struck.webp" },
  { id: "s11", name: "Fire Flame", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Animals%20and%20Nature/Fire.webp" },
  { id: "s12", name: "Red Heart", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Symbols/Red%20Heart.webp" },
  { id: "s13", name: "See No Evil Monkey", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Smileys/See%20No%20Evil%20Monkey.webp" },
  { id: "s14", name: "Cute Dog Face", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Animals%20and%20Nature/Dog%20Face.webp" },
  { id: "s15", name: "Smiling Cat", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Smileys/Grinning%20Cat.webp" },
  { id: "s16", name: "Rocket Fly", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Travel%20and%20Places/Rocket.webp" }
];


const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage, selectedUser } = useChatStore();
  const socket = useAuthStore((state) => state.socket);
  const [isStickerOpen, setIsStickerOpen] = useState(false);

  // Typing state refs
  const typingTimeoutRef = useRef(null);
  const isTypingEmitRef = useRef(false);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (socket && selectedUser && isTypingEmitRef.current) {
        socket.emit("typing", { to: selectedUser._id, isTyping: false });
        isTypingEmitRef.current = false;
      }
    };
  }, [selectedUser?._id, socket]);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const streamRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Clear typing indicator immediately
      if (socket && selectedUser && isTypingEmitRef.current) {
        socket.emit("typing", { to: selectedUser._id, isTyping: false });
        isTypingEmitRef.current = false;
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setText(val);

    if (!socket || !selectedUser) return;

    // If not currently marked as typing, emit event
    if (!isTypingEmitRef.current && val.trim().length > 0) {
      isTypingEmitRef.current = true;
      socket.emit("typing", { to: selectedUser._id, isTyping: true });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Set timeout to stop typing after 1.5s of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingEmitRef.current) {
        isTypingEmitRef.current = false;
        socket.emit("typing", { to: selectedUser._id, isTyping: false });
      }
    }, 1500);
  };

  const handleSendSticker = async (stickerUrl) => {
    setIsStickerOpen(false);
    try {
      await sendMessage({
        text: "[Sticker]",
        image: stickerUrl,
      });
    } catch (error) {
      console.error("Failed to send sticker:", error);
    }
  };

  // Voice Recording Functions
  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // If we stopped but didn't have chunks or user cancelled
        if (audioChunksRef.current.length === 0) return;

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result;
          try {
            await sendMessage({
              text: "",
              image: null,
              voice: base64Audio,
            });
          } catch (err) {
            console.error("Failed to send voice message:", err);
          }
        };
        reader.readAsDataURL(audioBlob);

        // Release the microphone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Failed to start voice recording:", error);
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = (shouldSend = true) => {
    // Clear timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;

    if (shouldSend) {
      recorder.stop();
    } else {
      // Cancel
      recorder.onstop = () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };
      recorder.stop();
      toast("Recording cancelled", { icon: "🗑️" });
    }

    setIsRecording(false);
    setRecordingTime(0);
  };

  const formatRecordingTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  return (
    <div className="p-4 w-full relative">
      {/* Stickers Popover */}
      {isStickerOpen && (
        <div className="absolute bottom-20 left-4 bg-zinc-900 border border-zinc-800 p-3 rounded-2xl shadow-2xl z-40 w-72 sm:w-80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Choose a Sticker</span>
            <button
              type="button"
              onClick={() => setIsStickerOpen(false)}
              className="text-zinc-500 hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
            {STICKERS.map((sticker) => (
              <button
                key={sticker.id}
                type="button"
                onClick={() => handleSendSticker(sticker.url)}
                className="hover:bg-zinc-800 p-1.5 rounded-xl transition-all duration-150 transform hover:scale-105 flex items-center justify-center cursor-pointer"
                title={sticker.name}
              >
                <img src={sticker.url} alt={sticker.name} className="w-12 h-12 object-contain" />
              </button>
            ))}
          </div>
        </div>
      )}

      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center cursor-pointer"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {isRecording ? (
        /* Voice Recording UI */
        <div className="flex items-center justify-between gap-4 bg-red-50 dark:bg-red-950/30 p-3 rounded-2xl border border-red-200 dark:border-red-900 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
            </span>
            <span className="text-red-600 dark:text-red-400 font-semibold font-mono text-sm">
              Recording: {formatRecordingTime(recordingTime)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Cancel Button */}
            <button
              onClick={() => stopRecording(false)}
              className="btn btn-sm btn-ghost text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full cursor-pointer"
              title="Cancel Recording"
            >
              <Trash2 size={18} />
            </button>
            {/* Stop and Send Button */}
            <button
              onClick={() => stopRecording(true)}
              className="btn btn-sm btn-circle btn-primary shadow-md cursor-pointer"
              title="Stop and Send"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* Standard input UI */
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div className="flex-1 flex gap-2 items-center">
            {/* Hidden File Input */}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />

            {/* Sticker Select Button */}
            <button
              type="button"
              className={`btn btn-sm sm:btn-md btn-circle btn-ghost cursor-pointer text-zinc-400 hover:text-white ${
                isStickerOpen ? "text-primary hover:text-primary" : ""
              }`}
              onClick={() => setIsStickerOpen(!isStickerOpen)}
              title="Send Sticker"
            >
              <Smile size={20} />
            </button>

            {/* Image Select Button (Responsive: visible on mobile too) */}
            <button
              type="button"
              className={`btn btn-sm sm:btn-md btn-circle btn-ghost cursor-pointer
                       ${imagePreview ? "text-emerald-500" : "text-zinc-400 hover:text-white"}`}
              onClick={() => fileInputRef.current?.click()}
              title="Attach Image"
            >
              <Image size={20} />
            </button>

            {/* Input field */}
            <input
              type="text"
              className="w-full input input-bordered rounded-lg input-sm sm:input-md"
              placeholder="Type a message..."
              value={text}
              onChange={handleInputChange}
              disabled={isRecording}
            />
          </div>

          {/* Action buttons (Mic or Send) */}
          <div className="flex items-center gap-1.5">
            {!text.trim() && !imagePreview ? (
              <button
                type="button"
                onClick={startRecording}
                className="btn btn-sm sm:btn-md btn-circle btn-ghost text-zinc-400 hover:text-white cursor-pointer"
                title="Record Voice Message"
              >
                <Mic size={22} />
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-sm sm:btn-md btn-circle btn-primary shadow-md cursor-pointer"
                disabled={!text.trim() && !imagePreview}
              >
                <Send size={18} className="ml-0.5" />
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default MessageInput;