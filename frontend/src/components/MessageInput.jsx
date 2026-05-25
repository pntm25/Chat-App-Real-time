import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X, Mic, Trash2, Smile } from "lucide-react";
import toast from "react-hot-toast";

const STICKERS = [
  { id: "s1", name: "Cute Peach Cat", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3BndmdnaW44d2d4d293dDFmZDVxb3M4eG92Y2U0Z2x6ZTB0OW9hNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/du1Lz5wgQ1cBnHezp9/giphy.gif" },
  { id: "s2", name: "Happy Quby Pentol", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDd6dmgyczB4aDRlOHpjc3p6dmpyM3E2am5maDhwdGR1YXZ0bWlqNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/K3S0mx6coApx3KSSpL/giphy.gif" },
  { id: "s3", name: "Heart Pop Rabbit", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzg1bmswbTJ2dmVsbWFidnltd245ZDRuMzBhbzJ5OWw0Y3ZtNGEyOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/9J3zMocWq7GgUWPvW1/giphy.gif" },
  { id: "s4", name: "Shiba Roll Cute", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDVtc2FhZnFna2J0eWF0bTZtdTNvd291Zjlydm82YmxscDFpdjRwaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/c12rZ39Yg3fSE/giphy.gif" },
  { id: "s5", name: "Cute Dinosaur Clap", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaG96cTV4YWphY2dtczc3czZtdTZwM3d2Mnl3bmV6cTgwMTN0dnphayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/UQ1667F8D40w1eMoc8/giphy.gif" },
  { id: "s6", name: "Panda Cute Wave", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWZ5a3N2bmQ0ZzFjNGN1a3QzaWtsNGdzN3BhbWh3ZXRiaXk3anp5ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/l3q2t2KAQQvscCqWs/giphy.gif" },
  { id: "s7", name: "Pikachu Happy Dance", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzB0dng1dDVwdjdwMGphd3ExOXo0N3p1amJ1aWRpdTdyZHhtMDZtNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/12SAy0RvZyrlTy/giphy.gif" },
  { id: "s8", name: "Among Us Dance", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWRocGNpdW10eGJrdTBxdGRtNHpsd3kyZTBjZGx6Y3hpYWRyMTBiaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/lR1L96mR3G6K7a5p7f/giphy.gif" },
  { id: "s9", name: "Bouncing Cat Cute", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdnd2M3N4aTRpYjFwMDB1ZDF2ZzZ4dGR5MG4wODg3dThlMTc3bXl3NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/yFQ0ywscgobJK/giphy.gif" },
  { id: "s10", name: "Dancing Duck", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2Jjc3Z3NDMwdTZwcmJ6NDR4bm5tbnU1dW5maDJpMXptYzN6aWN0eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/134Vp1a9MT18B2/giphy.gif" },
  { id: "s11", name: "Crying Bear Heart", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3BndmdnaW44d2d4d293dDFmZDVxb3M4eG92Y2U0Z2x6ZTB0OW9hNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3oEduQ3Ku3IapqgOD6/giphy.gif" },
  { id: "s12", name: "Dog Thumbs Up", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3BndmdnaW44d2d4d293dDFmZDVxb3M4eG92Y2U0Z2x6ZTB0OW9hNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3o7TKoWXm3okO1kgdW/giphy.gif" },
  { id: "s13", name: "Cute Strawberry Spin", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmQxbXQzdzI4dmJmNDJ2NXpsaWZpOXlqd2c0NnphZThwdHl0bzkwZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3oEdv3Ul8g6ClIG1q0/giphy.gif" },
  { id: "s14", name: "Love Hearts Cute", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3BndmdnaW44d2d4d293dDFmZDVxb3M4eG92Y2U0Z2x6ZTB0OW9hNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3oz8xAFtqo0BcnsZH2/giphy.gif" },
  { id: "s15", name: "Funny Reaction Cat", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3BndmdnaW44d2d4d293dDFmZDVxb3M4eG92Y2U0Z2x6ZTB0OW9hNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/l0IpYf339umS9z9a8/giphy.gif" },
  { id: "s16", name: "Happy Bunny Wave", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3BndmdnaW44d2d4d293dDFmZDVxb3M4eG92Y2U0Z2x6ZTB0OW9hNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/1gP0hMv7bWn67Nn3bF/giphy.gif" }
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