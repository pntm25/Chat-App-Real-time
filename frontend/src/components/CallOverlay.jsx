import { useRef, useEffect, useState } from "react";
import { useCallStore } from "../store/useCallStore";
import { PhoneOff, Phone, Mic, MicOff, Video, VideoOff, Volume2 } from "lucide-react";

const CallOverlay = () => {
  const {
    callState,
    callType,
    callerInfo,
    receiverInfo,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  } = useCallStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [callDuration, setCallDuration] = useState(0);

  // Bind local stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callState]);

  // Bind remote stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callState]);

  // Call duration counter
  useEffect(() => {
    let timer = null;
    if (callState === "connected") {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callState]);

  const formatDuration = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (callState === "idle") return null;

  // Active call partner details
  const partner = callState === "incoming" ? callerInfo : receiverInfo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 text-white animate-fade-in select-none">
      {/* 1. OUTGOING CALL STATE */}
      {callState === "calling" && (
        <div className="flex flex-col items-center justify-between h-full py-16 px-6 text-center w-full max-w-md">
          <div className="flex flex-col items-center mt-12 gap-6">
            <div className="relative">
              <div className="size-28 rounded-full overflow-hidden ring-4 ring-blue-500 animate-pulse">
                <img
                  src={partner?.profilePic || "/avatar.png"}
                  alt={partner?.fullName}
                  className="size-full object-cover"
                />
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-blue-600 text-[10px] font-semibold uppercase tracking-wider rounded-full shadow-md">
                Calling
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">{partner?.fullName}</h2>
              <p className="text-sm text-zinc-400 font-medium">Connecting voice/video line...</p>
            </div>
          </div>

          <button
            onClick={() => endCall(true)}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-all transform hover:scale-105 shadow-2xl cursor-pointer"
            title="Cancel Call"
          >
            <PhoneOff size={28} />
          </button>
        </div>
      )}

      {/* 2. INCOMING CALL STATE */}
      {callState === "incoming" && (
        <div className="flex flex-col items-center justify-between h-full py-16 px-6 text-center w-full max-w-md">
          <div className="flex flex-col items-center mt-12 gap-6">
            <div className="relative">
              <div className="size-28 rounded-full overflow-hidden ring-4 ring-green-500 animate-bounce">
                <img
                  src={partner?.profilePic || "/avatar.png"}
                  alt={partner?.fullName}
                  className="size-full object-cover"
                />
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-green-600 text-[10px] font-semibold uppercase tracking-wider rounded-full shadow-md animate-pulse">
                Incoming
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">{partner?.fullName}</h2>
              <p className="text-sm text-zinc-400 font-medium">
                Incoming {callType === "video" ? "Video" : "Voice"} Call...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {/* Decline Button */}
            <button
              onClick={rejectCall}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-all transform hover:scale-105 shadow-2xl cursor-pointer"
              title="Decline"
            >
              <PhoneOff size={28} />
            </button>

            {/* Accept Button */}
            <button
              onClick={acceptCall}
              className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-all transform hover:scale-105 shadow-2xl cursor-pointer"
              title="Accept"
            >
              <Phone size={28} />
            </button>
          </div>
        </div>
      )}

      {/* 3. CONNECTED STATE */}
      {callState === "connected" && (
        <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
          {callType === "video" ? (
            /* ================= VIDEO CALL RENDER ================= */
            <div className="absolute inset-0 w-full h-full bg-zinc-950">
              {/* Remote Video Stream (Main screen) */}
              {remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-zinc-900">
                  <div className="size-20 rounded-full overflow-hidden ring-2 ring-zinc-700">
                    <img
                      src={partner?.profilePic || "/avatar.png"}
                      alt={partner?.fullName}
                      className="size-full object-cover"
                    />
                  </div>
                  <p className="text-sm text-zinc-500 font-medium animate-pulse">
                    Waiting for remote camera...
                  </p>
                </div>
              )}

              {/* Local Video Stream (Floating picture-in-picture window) */}
              <div className="absolute top-6 right-6 w-32 sm:w-44 aspect-[3/4] bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-zinc-700 z-10">
                {isVideoOff ? (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-850 text-zinc-500">
                    <VideoOff size={24} />
                  </div>
                ) : (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                )}
              </div>

              {/* Call Timer Overlay */}
              <div className="absolute top-6 left-6 px-3.5 py-1.5 bg-black/60 backdrop-blur-md border border-zinc-800 rounded-full flex items-center gap-2 text-xs sm:text-sm font-semibold z-10">
                <span className="size-2 rounded-full bg-green-500 animate-ping"></span>
                <span>{formatDuration(callDuration)}</span>
              </div>
            </div>
          ) : (
            /* ================= VOICE CALL RENDER ================= */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-900">
              <div className="flex flex-col items-center gap-6 text-center">
                {/* Avatar with pulsing rings */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute size-44 rounded-full bg-blue-500/10 animate-ping"></div>
                  <div className="absolute size-36 rounded-full bg-blue-500/20 animate-pulse"></div>
                  <div className="size-28 rounded-full overflow-hidden ring-4 ring-blue-500 z-10">
                    <img
                      src={partner?.profilePic || "/avatar.png"}
                      alt={partner?.fullName}
                      className="size-full object-cover"
                    />
                  </div>
                </div>

                <div className="z-10">
                  <h2 className="text-2xl font-bold tracking-tight mb-2">{partner?.fullName}</h2>
                  <div className="flex items-center justify-center gap-2 text-sm text-zinc-400 font-semibold font-mono">
                    <Volume2 size={16} className="text-blue-400" />
                    <span>Active Voice Call: {formatDuration(callDuration)}</span>
                  </div>
                </div>
              </div>

              {/* Animated audio wave bar placeholder */}
              <div className="flex items-center gap-1.5 h-8">
                <span className="w-1 bg-blue-500 rounded-full animate-bounce h-5"></span>
                <span className="w-1 bg-blue-400 rounded-full animate-bounce h-8 [animation-delay:0.2s]"></span>
                <span className="w-1 bg-blue-500 rounded-full animate-bounce h-6 [animation-delay:0.4s]"></span>
                <span className="w-1 bg-blue-400 rounded-full animate-bounce h-7 [animation-delay:0.1s]"></span>
                <span className="w-1 bg-blue-500 rounded-full animate-bounce h-4 [animation-delay:0.3s]"></span>
              </div>
            </div>
          )}

          {/* ================= GLOBAL CALL ACTION CONTROLS ================= */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 z-25 flex items-center justify-center gap-6 sm:gap-8">
            {/* Audio Toggle (Mute/Unmute) */}
            <button
              onClick={toggleMute}
              className={`w-12 sm:w-14 h-12 sm:h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-105 shadow-lg cursor-pointer ${
                isMuted
                  ? "bg-red-500 text-white"
                  : "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200"
              }`}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            {/* Video Call Specific Controls (Camera on/off) */}
            {callType === "video" && (
              <button
                onClick={toggleVideo}
                className={`w-12 sm:w-14 h-12 sm:h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-105 shadow-lg cursor-pointer ${
                  isVideoOff
                    ? "bg-red-500 text-white"
                    : "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200"
                }`}
                title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
              >
                {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
              </button>
            )}

            {/* End Call Button */}
            <button
              onClick={() => endCall(true)}
              className="w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-all transform hover:scale-105 shadow-2xl cursor-pointer"
              title="Hang Up"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallOverlay;
