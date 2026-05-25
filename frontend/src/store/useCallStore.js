import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

// Sound effects utilities (using synth tones or public audio so there are no file-not-found issues)
let ringtoneInterval = null;
let dialtoneInterval = null;

const playTone = (freq1, freq2, duration) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc1.frequency.value = freq1;
    osc2.frequency.value = freq2;

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc1.start();
    osc2.start();

    setTimeout(() => {
      osc1.stop();
      osc2.stop();
      audioCtx.close();
    }, duration);
  } catch (e) {
    console.error("Audio synth error:", e);
  }
};

const startRingtone = () => {
  if (ringtoneInterval) return;
  // Standard Vietnamese ringtone tone (400Hz + 450Hz pulsating)
  ringtoneInterval = setInterval(() => {
    playTone(400, 450, 1000);
  }, 3000);
};

const stopRingtone = () => {
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
};

const startDialtone = () => {
  if (dialtoneInterval) return;
  // standard ringback tone (440Hz + 480Hz)
  dialtoneInterval = setInterval(() => {
    playTone(440, 480, 1500);
  }, 4000);
};

const stopDialtone = () => {
  if (dialtoneInterval) {
    clearInterval(dialtoneInterval);
    dialtoneInterval = null;
  }
};

export const useCallStore = create((set, get) => ({
  callState: "idle", // 'idle' | 'calling' | 'incoming' | 'connected'
  callType: null, // 'video' | 'voice'
  callerInfo: null, // user who is calling
  receiverInfo: null, // user being called
  localStream: null,
  remoteStream: null,
  isMuted: false,
  isVideoOff: false,
  peerConnection: null,
  incomingOffer: null,
  iceCandidatesQueue: [],

  initiateCall: async (recipient, type) => {
    const authUser = useAuthStore.getState().authUser;
    const socket = useAuthStore.getState().socket;

    if (!socket) {
      toast.error("Socket not connected!");
      return;
    }

    set({
      callState: "calling",
      callType: type,
      receiverInfo: recipient,
      callerInfo: authUser,
      isMuted: false,
      isVideoOff: false,
      iceCandidatesQueue: [],
    });

    startDialtone();

    try {
      // Get media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === "video",
        audio: true,
      });

      set({ localStream: stream });

      // Create Peer Connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      // Add tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle remote tracks
      pc.ontrack = (event) => {
        set({ remoteStream: event.streams[0] });
      };

      // Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            to: recipient._id,
            candidate: event.candidate,
          });
        }
      };

      // Create Offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      set({ peerConnection: pc });

      // Emit calling socket event with complete caller details
      socket.emit("call-user", {
        to: recipient._id,
        offer,
        callType: type,
        callerInfo: authUser,
      });
    } catch (error) {
      console.error("Failed to initiate call:", error);
      toast.error("Failed to access camera/microphone");
      get().endCall();
    }
  },

  handleIncomingCall: ({ from, offer, callType, callerInfo }) => {
    if (get().callState !== "idle") {
      // Busy
      const socket = useAuthStore.getState().socket;
      if (socket) {
        socket.emit("reject-call", { to: from });
      }
      return;
    }

    set({
      callState: "incoming",
      callType,
      callerInfo: callerInfo || { _id: from, fullName: "Someone" },
      incomingOffer: offer,
      isMuted: false,
      isVideoOff: false,
      iceCandidatesQueue: [],
    });

    startRingtone();
  },

  acceptCall: async () => {
    stopRingtone();
    const { callerInfo, callType, incomingOffer } = get();
    const socket = useAuthStore.getState().socket;

    if (!socket || !callerInfo) {
      toast.error("Call failed to connect");
      get().endCall();
      return;
    }

    set({ callState: "connected" });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === "video",
        audio: true,
      });

      set({ localStream: stream });

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        set({ remoteStream: event.streams[0] });
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            to: callerInfo._id,
            candidate: event.candidate,
          });
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      set({ peerConnection: pc });

      socket.emit("answer-call", {
        to: callerInfo._id,
        answer,
      });

      // Process any queued ICE candidates
      const { iceCandidatesQueue } = get();
      for (const candidate of iceCandidatesQueue) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
      set({ iceCandidatesQueue: [] });
    } catch (error) {
      console.error("Failed to accept call:", error);
      toast.error("Failed to access camera/microphone");
      get().endCall();
    }
  },

  handleCallAccepted: async ({ answer }) => {
    stopDialtone();
    const { peerConnection } = get();
    if (!peerConnection) return;

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      set({ callState: "connected" });

      // Process queued candidates
      const { iceCandidatesQueue } = get();
      for (const candidate of iceCandidatesQueue) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
      set({ iceCandidatesQueue: [] });
    } catch (error) {
      console.error("Error setting remote description:", error);
      get().endCall();
    }
  },

  handleNewIceCandidate: async ({ candidate }) => {
    const { peerConnection } = get();
    if (peerConnection && peerConnection.remoteDescription) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding ice candidate:", error);
      }
    } else {
      // Queue it
      set((state) => ({
        iceCandidatesQueue: [...state.iceCandidatesQueue, candidate],
      }));
    }
  },

  rejectCall: () => {
    stopRingtone();
    const { callerInfo } = get();
    const socket = useAuthStore.getState().socket;

    if (socket && callerInfo) {
      socket.emit("reject-call", { to: callerInfo._id });
    }
    get().endCall(false);
  },

  handleCallRejected: () => {
    stopDialtone();
    toast.error("Call was declined");
    get().endCall(false);
  },

  endCall: (emitEvent = true) => {
    stopRingtone();
    stopDialtone();

    const { localStream, peerConnection, callerInfo, receiverInfo } = get();
    const socket = useAuthStore.getState().socket;

    if (emitEvent && socket) {
      const activePartnerId =
        callerInfo?._id === useAuthStore.getState().authUser?._id
          ? receiverInfo?._id
          : callerInfo?._id;
      if (activePartnerId) {
        socket.emit("end-call", { to: activePartnerId });
      }
    }

    // Stop streams
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    if (peerConnection) {
      try {
        peerConnection.close();
      } catch (e) {}
    }

    set({
      callState: "idle",
      callType: null,
      callerInfo: null,
      receiverInfo: null,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
      incomingOffer: null,
      isMuted: false,
      isVideoOff: false,
      iceCandidatesQueue: [],
    });
  },

  toggleMute: () => {
    const { localStream, isMuted } = get();
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = isMuted; // enable if previously muted
      });
      set({ isMuted: !isMuted });
    }
  },

  toggleVideo: () => {
    const { localStream, isVideoOff } = get();
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = isVideoOff; // enable if previously video was off
      });
      set({ isVideoOff: !isVideoOff });
    }
  },
}));
