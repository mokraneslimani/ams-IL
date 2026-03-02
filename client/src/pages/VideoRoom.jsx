import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import "./VideoRoom.css";

const DEFAULT_AVATAR = "/avatar.svg";

export default function VideoRoom() {
  const navigate = useNavigate();
  const { roomId } = useParams(); // /room/:roomId
  const [effectiveRoomId, setEffectiveRoomId] = useState("");

  // Profil / utilisateur courant
  const [profile, setProfile] = useState({ username: "mon_pseudo", avatar: DEFAULT_AVATAR });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  // Menu
  const [menuItems] = useState([
    { id: "profile", label: "Profil", path: "/profile" },
    { id: "settings", label: "Parametres", path: "/settings" },
    { id: "playlist", label: "Playlist", path: "/playlist" },
  ]);

  // Controles
  const [controls, setControls] = useState([
    { id: "camera", label: "Camera", enabled: true },
    { id: "micro", label: "Micro", enabled: true },
    { id: "screen", label: "Partage d'ecran", enabled: false },
  ]);

  // Infos room
  const [roomInfo, setRoomInfo] = useState({ id: roomId || "room", name: "Room", link: "" });
  const [roomError, setRoomError] = useState("");


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
    navigate("/login");
  };

  const handleCloseRoom = () => {
    if (!effectiveRoomId || !socketRef.current) return;
    socketRef.current.emit("close_room", String(effectiveRoomId));
    navigate("/profile");
  };

  // Video
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [currentVideo, setCurrentVideo] = useState({ url: "", title: "" });

  // Historique
  const [history, setHistory] = useState([]);

  // Participants
  const [participants, setParticipants] = useState([]);
  const socketRef = useRef(null);
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const ytApiReadyRef = useRef(null);
  const changeVideoRef = useRef(false);
  const playlistUpdateRef = useRef(false);
  const isRemoteActionRef = useRef(false);
  const selfSocketIdRef = useRef(null);
  const hostIdRef = useRef(null);
  const pendingSyncRef = useRef(null);
  const lastTimeRef = useRef(0);

  // Chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatError, setChatError] = useState("");

  // Playlist
  const [playlistItems, setPlaylistItems] = useState([]);
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [playlistTitle, setPlaylistTitle] = useState("");

  // Invites / friends
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteStatus, setInviteStatus] = useState("");

  // Settings
  const [videoSettings, setVideoSettings] = useState({
    autoplay: false,
    defaultVolume: 50,
    subtitles: "off",
    quality: "auto",
    syncMode: "strict",
  });
  const [roomSettings, setRoomSettings] = useState({
    privacy: "private",
    hostDelay: 0,
    chatLocked: false,
    screenShare: true,
    maxParticipants: 10,
    pin: "",
    expireMinutes: 0,
    notifInvites: true,
    notifChanges: true,
    notifParticipants: true,
    showInitials: false,
  });

  // --------- Effects ----------

  // Profil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
        if (!storedId) {
          setProfileError("Utilisateur non connecte (userId manquant).");
          return;
        }

        const res = await fetch(`http://localhost:5000/api/users/${storedId}`);
        if (!res.ok) {
          throw new Error("Impossible de recuperer l'utilisateur connecte");
        }
        const user = await res.json();

        setProfile({
          username: user.username || "user",
          avatar: user.avatar || DEFAULT_AVATAR,
        });
        localStorage.setItem("profileName", user.username || user.email || "Utilisateur");
        localStorage.setItem("profileAvatar", user.avatar || DEFAULT_AVATAR);
      } catch (err) {
        setProfileError(err.message);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Room + video principale
  useEffect(() => {
    if (!roomId) return;
    const loadRoom = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      try {
        let res = await fetch(`http://localhost:5000/api/rooms/${roomId}`, { headers });
        if (!res.ok) {
          const linkRes = await fetch(`http://localhost:5000/api/rooms/link/${roomId}`);
          if (!linkRes.ok) {
            throw new Error(res.status === 401 ? "Connexion requise" : "Room introuvable");
          }

          const roomByLink = await linkRes.json();
          setEffectiveRoomId(roomByLink.id);
          setRoomInfo({
            id: roomByLink.id,
            name: roomByLink.name || "Room sans nom",
            description: roomByLink.description || "",
            link: roomByLink.link || "",
          });

          setCurrentVideo({
            url: roomByLink.video_url || "",
            title: roomByLink.name || "",
          });

          if (!token) {
            setRoomError("Connexion requise pour rejoindre cette room");
            return;
          }

          const joinRes = await fetch(
            `http://localhost:5000/api/rooms/link/${roomId}/join`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!joinRes.ok) {
            const data = await joinRes.json().catch(() => ({}));
            throw new Error(data.message || "Impossible de rejoindre la room");
          }

          return;
        }

        const room = await res.json();

        setEffectiveRoomId(room.id);
        setRoomInfo({
          id: room.id,
          name: room.name || "Room sans nom",
          description: room.description || "",
          link: room.link || "",
        });

        setCurrentVideo({
          url: room.video_url || "",
          title: room.name || "",
        });
      } catch (err) {
        setRoomError(err.message);
      }
    };
    loadRoom();
  }, [roomId]);

  // Historique
  useEffect(() => {
    if (!effectiveRoomId) return;
    const loadHistory = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/history/${effectiveRoomId}`);
        if (!res.ok) {
          throw new Error("Erreur lors du chargement de l'historique");
        }
        const data = await res.json();
        const mapped = await Promise.all(data.map(async (item) => {
          const fallbackThumb = item.thumbnail || getYouTubeThumb(item.video_url);
          let title = item.title;
          let thumbnail = item.thumbnail || "";
          if (!title || !thumbnail) {
            const meta = await fetchYouTubeMeta(item.video_url);
            title = title || meta.title || "Video YouTube";
            thumbnail = thumbnail || meta.thumbnail || fallbackThumb;
          }
          return {
            id: item.id,
            title: title || "Video",
            category: "Historique",
            views: item.created_at ? new Date(item.created_at).toLocaleString("fr-FR") : "",
            thumbnail: thumbnail || fallbackThumb,
            videoUrl: item.video_url,
          };
        }));
        setHistory(mapped);
      } catch (err) {
        console.error("Erreur chargement history :", err);
      }
    };
    loadHistory();
  }, [effectiveRoomId]);

  // Members
  const loadMembers = useCallback(async () => {
    if (!effectiveRoomId) return;
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${effectiveRoomId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Impossible de charger les membres");
      const data = await res.json();
      const mapped = data.map((m) => ({
        id: m.id || m.user_id || Math.random(),
        username: m.username || m.email || "user",
        avatar: m.avatar || DEFAULT_AVATAR,
        initials: (m.username || m.email || "U").slice(0, 1).toUpperCase(),
      }));
      setParticipants(mapped);
    } catch (err) {
      console.error(err);
    }
  }, [effectiveRoomId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Live participants via socket
  useEffect(() => {
    if (!effectiveRoomId) return;

    if (!socketRef.current) {
      socketRef.current = io("http://localhost:5000");
    }

    const socket = socketRef.current;
    socket.emit("join_room", String(effectiveRoomId));

    const handleParticipantsUpdate = () => {
      loadMembers();
    };

    socket.on("participants_update", handleParticipantsUpdate);

    return () => {
      socket.off("participants_update", handleParticipantsUpdate);
    };
  }, [effectiveRoomId, loadMembers]);

  useEffect(() => {
    if (!effectiveRoomId || !socketRef.current) return;
    const socket = socketRef.current;

    const handlePlaylistUpdate = (data) => {
      if (!data || String(data.roomId) !== String(effectiveRoomId)) return;
      playlistUpdateRef.current = true;
      setPlaylistItems(Array.isArray(data.items) ? data.items : []);
    };

    socket.on("playlist_update", handlePlaylistUpdate);

    return () => {
      socket.off("playlist_update", handlePlaylistUpdate);
    };
  }, [effectiveRoomId]);

  useEffect(() => {
    if (!effectiveRoomId || !socketRef.current) return;
    const socket = socketRef.current;

    const handleChangeVideo = async (data) => {
      if (!data || String(data.roomId) !== String(effectiveRoomId)) return;
      const url = data.videoUrl || "";
      if (!url) return;
      changeVideoRef.current = true;
      const meta = await fetchYouTubeMeta(url);
      const title = data.title || meta.title || "Video YouTube";
      const thumbnail = meta.thumbnail || getYouTubeThumb(url);
      setCurrentVideo({ url, title });
      setHistory((prev) => [
        {
          id: Date.now(),
          title,
          category: data.category || "Synchro",
          views: new Date().toLocaleString("fr-FR"),
          thumbnail,
          videoUrl: url,
        },
        ...prev,
      ]);
    };

    socket.on("change_video", handleChangeVideo);

    return () => {
      socket.off("change_video", handleChangeVideo);
    };
  }, [effectiveRoomId]);

  useEffect(() => {
    if (!effectiveRoomId) return;
    const timer = setInterval(() => {
      const player = playerRef.current;
      if (!player || !window.YT || typeof player.getCurrentTime !== "function") return;
      let state;
      try {
        state = player.getPlayerState?.();
      } catch {
        return;
      }
      const currentTime = player.getCurrentTime();
      if (isRemoteActionRef.current) {
        lastTimeRef.current = currentTime;
        return;
      }
      if (state === window.YT.PlayerState.PAUSED) {
        if (Math.abs(currentTime - lastTimeRef.current) > 0.75) {
          if (socketRef.current) {
            socketRef.current.emit("video_seek", {
              roomId: String(effectiveRoomId),
              currentTime,
            });
          }
        }
      }
      lastTimeRef.current = currentTime;
    }, 700);
    return () => clearInterval(timer);
  }, [effectiveRoomId]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Messages (persisted)
  useEffect(() => {
    if (!effectiveRoomId) return;
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const loadMessages = async () => {
      setChatError("");
      try {
        const res = await fetch(`http://localhost:5000/api/messages/${effectiveRoomId}?limit=200`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Impossible de charger le chat");
        const data = await res.json();
        const mapped = data.map((m) => ({
          id: m.id,
          author: m.username || m.email || "user",
          text: m.content,
          avatar: m.avatar,
        }));
        setChatMessages(
          mapped.length > 0
            ? mapped
            : [{ id: "system", author: "System", text: "Bienvenue dans la room !" }]
        );
      } catch (err) {
        setChatError(err.message);
        setChatMessages([{ id: "system", author: "System", text: "Bienvenue dans la room !" }]);
      }
    };
    loadMessages();
  }, [effectiveRoomId]);

  useEffect(() => {
    if (!effectiveRoomId || !socketRef.current) return;
    const socket = socketRef.current;

    const handleChatMessage = (data) => {
      if (!data || String(data.roomId) !== String(effectiveRoomId)) return;
      const text = data.message || data.content || "";
      if (!text) return;
      setChatMessages((prev) => [
        ...prev,
        {
          id: data.id || Date.now(),
          author: data.username || data.email || "user",
          text,
          avatar: data.avatar || "",
        },
      ]);
    };

    socket.on("chat_message", handleChatMessage);
    return () => {
      socket.off("chat_message", handleChatMessage);
    };
  }, [effectiveRoomId]);

  const playlistStorageKey = effectiveRoomId ? `playlist:${effectiveRoomId}` : "";

  useEffect(() => {
    if (!playlistStorageKey) return;
    try {
      const stored = localStorage.getItem(playlistStorageKey);
      setPlaylistItems(stored ? JSON.parse(stored) : []);
    } catch {
      setPlaylistItems([]);
    }
  }, [playlistStorageKey]);

  useEffect(() => {
    if (!playlistStorageKey) return;
    localStorage.setItem(playlistStorageKey, JSON.stringify(playlistItems));
  }, [playlistItems, playlistStorageKey]);

  useEffect(() => {
    if (!effectiveRoomId || !socketRef.current) return;
    if (playlistUpdateRef.current) {
      playlistUpdateRef.current = false;
      return;
    }
    socketRef.current.emit("playlist_update", {
      roomId: String(effectiveRoomId),
      items: playlistItems,
    });
  }, [playlistItems, effectiveRoomId]);

  // Friends list (for invites)
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;
    const loadFriends = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/friends", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Impossible de charger vos amis");
        const data = await res.json();
        setFriends(data.friends || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadFriends();
  }, []);

  // --------- Helpers ----------

  const toggleControl = (id) => {
    setControls((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const getYouTubeId = (url) => {
    if (!url) return "";
    try {
      const u = new URL(url);
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      if (u.hostname.includes("youtu.be")) {
        return u.pathname.replace("/", "");
      }
      return "";
    } catch {
      return "";
    }
  };

  const getYouTubeThumb = (url) => {
    const id = getYouTubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
  };

  const ensureYouTubeApi = useCallback(() => {
    if (ytApiReadyRef.current) return ytApiReadyRef.current;
    ytApiReadyRef.current = new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve();
        return;
      }
      const existingScript = document.getElementById("youtube-iframe-api");
      if (!existingScript) {
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousReady) previousReady();
        resolve();
      };
    });
    return ytApiReadyRef.current;
  }, []);

  const applyRemoteAction = (fn) => {
    isRemoteActionRef.current = true;
    try {
      fn();
    } finally {
      setTimeout(() => {
        isRemoteActionRef.current = false;
      }, 300);
    }
  };

  const applyPendingSync = useCallback(() => {
    const pending = pendingSyncRef.current;
    if (!pending || !playerRef.current) return;
    if (typeof playerRef.current.cueVideoById !== "function") return;
    pendingSyncRef.current = null;
    const pendingVideoId = getYouTubeId(pending.videoUrl || "");
    if (pendingVideoId) {
      playerRef.current.cueVideoById(pendingVideoId);
    }
    if (typeof pending.currentTime === "number") {
      applyRemoteAction(() => {
        playerRef.current.seekTo(pending.currentTime, true);
      });
    }
    if (pending.isPlaying) {
      applyRemoteAction(() => {
        playerRef.current.playVideo();
      });
    } else {
      applyRemoteAction(() => {
        playerRef.current.pauseVideo();
      });
    }
  }, []);

  const initOrUpdatePlayer = useCallback(
    async (url) => {
      const videoId = getYouTubeId(url);
      if (!videoId) return;
      await ensureYouTubeApi();
      if (!playerContainerRef.current) return;
      if (playerRef.current) {
        playerRef.current.cueVideoById(videoId);
        applyPendingSync();
        return;
      }
      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId,
        playerVars: {
          enablejsapi: 1,
          origin: window.location.origin,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => {
            if (typeof playerRef.current?.setVolume === "function") {
              playerRef.current.setVolume(videoSettings.defaultVolume);
            }
            applyPendingSync();
          },
          onStateChange: (event) => {
            if (!socketRef.current || !effectiveRoomId) return;
            if (isRemoteActionRef.current) return;
            const currentTime = playerRef.current?.getCurrentTime?.() || 0;
            if (event.data === window.YT.PlayerState.PLAYING) {
              socketRef.current.emit("video_play", {
                roomId: String(effectiveRoomId),
                currentTime,
              });
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              socketRef.current.emit("video_pause", {
                roomId: String(effectiveRoomId),
                currentTime,
              });
            }
          },
        },
      });
    },
    [applyPendingSync, ensureYouTubeApi, effectiveRoomId, videoSettings.defaultVolume]
  );

  useEffect(() => {
    if (!currentVideo.url) return;
    initOrUpdatePlayer(currentVideo.url);
  }, [currentVideo.url, initOrUpdatePlayer]);

  useEffect(() => {
    if (!effectiveRoomId || !socketRef.current) return;
    const socket = socketRef.current;

    const handleConnect = () => {
      selfSocketIdRef.current = socket.id;
    };
    socket.on("connect", handleConnect);

    const handleHostUpdate = (hostId) => {
      hostIdRef.current = hostId;
    };
    socket.on("host_update", handleHostUpdate);

    const handleVideoPlay = (data) => {
      if (!data || String(data.roomId) !== String(effectiveRoomId)) return;
      if (!playerRef.current) return;
      applyRemoteAction(() => {
        if (typeof data.currentTime === "number") {
          playerRef.current.seekTo(data.currentTime, true);
        }
        playerRef.current.playVideo();
      });
    };

    const handleVideoPause = (data) => {
      if (!data || String(data.roomId) !== String(effectiveRoomId)) return;
      if (!playerRef.current) return;
      applyRemoteAction(() => {
        if (typeof data.currentTime === "number") {
          playerRef.current.seekTo(data.currentTime, true);
        }
        playerRef.current.pauseVideo();
      });
    };

    const handleVideoSeek = (data) => {
      if (!data || String(data.roomId) !== String(effectiveRoomId)) return;
      if (!playerRef.current) return;
      applyRemoteAction(() => {
        if (typeof data.currentTime === "number") {
          playerRef.current.seekTo(data.currentTime, true);
        }
      });
    };

    const handleVideoSyncRequest = () => {
      if (!playerRef.current || !currentVideo.url) return;
      if (hostIdRef.current && selfSocketIdRef.current !== hostIdRef.current) return;
      const state = playerRef.current.getPlayerState?.();
      socket.emit("video_sync_response", {
        roomId: String(effectiveRoomId),
        videoUrl: currentVideo.url,
        currentTime: playerRef.current.getCurrentTime?.() || 0,
        isPlaying: state === window.YT?.PlayerState?.PLAYING,
      });
    };

    const handleVideoSyncResponse = (data) => {
      if (!data || String(data.roomId) !== String(effectiveRoomId)) return;
      pendingSyncRef.current = data;
      if (data.videoUrl && data.videoUrl !== currentVideo.url) {
        setCurrentVideo({ url: data.videoUrl, title: currentVideo.title || "Video" });
      } else {
        applyPendingSync();
      }
    };

    socket.on("video_play", handleVideoPlay);
    socket.on("video_pause", handleVideoPause);
    socket.on("video_seek", handleVideoSeek);
    socket.on("video_sync_request", handleVideoSyncRequest);
    socket.on("video_sync_response", handleVideoSyncResponse);

    socket.emit("video_sync_request", String(effectiveRoomId));

    return () => {
      socket.off("connect", handleConnect);
      socket.off("host_update", handleHostUpdate);
      socket.off("video_play", handleVideoPlay);
      socket.off("video_pause", handleVideoPause);
      socket.off("video_seek", handleVideoSeek);
      socket.off("video_sync_request", handleVideoSyncRequest);
    socket.off("video_sync_response", handleVideoSyncResponse);
    };
  }, [applyPendingSync, currentVideo.title, currentVideo.url, effectiveRoomId]);

  useEffect(() => {
    if (!effectiveRoomId || !socketRef.current) return;
    const socket = socketRef.current;
    const handleRoomClosed = (data) => {
      if (!data || String(data.roomId) !== String(effectiveRoomId)) return;
      if (data.message) {
        window.alert(data.message);
      }
      navigate("/profile");
    };
    socket.on("room_closed", handleRoomClosed);
    return () => {
      socket.off("room_closed", handleRoomClosed);
    };
  }, [effectiveRoomId, navigate]);

  const fetchYouTubeMeta = async (url) => {
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
      if (!res.ok) throw new Error("oembed");
      const data = await res.json();
      return { title: data.title, thumbnail: data.thumbnail_url };
    } catch {
      return { title: "", thumbnail: getYouTubeThumb(url) };
    }
  };

  // --------- Actions ----------

  const syncChangeVideo = async (url, category) => {
    const meta = await fetchYouTubeMeta(url);
    const title = meta.title || "Nouvelle video";
    const thumbnail = meta.thumbnail || getYouTubeThumb(url);

    setCurrentVideo({ url, title });
    setHistory((prev) => [
      { id: Date.now(), title, category, views: "N/A", thumbnail, videoUrl: url },
      ...prev,
    ]);

    if (socketRef.current && !changeVideoRef.current) {
      socketRef.current.emit("change_video", {
        roomId: String(effectiveRoomId),
        videoId: getYouTubeId(url),
        videoUrl: url,
        title,
        category,
      });
    }
    changeVideoRef.current = false;
  };

  const loadVideo = async () => {
    const url = videoUrlInput.trim();
    if (!url) return;
    await syncChangeVideo(url, "Custom");
  };

  const sendMessage = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setChatError("Connexion requise pour envoyer un message");
      return;
    }
    if (!socketRef.current || !effectiveRoomId) {
      setChatError("Connexion temps reel indisponible");
      return;
    }
    const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
    if (!userId) {
      setChatError("Utilisateur non connecte");
      return;
    }
    socketRef.current.emit("chat_message", {
      roomId: String(effectiveRoomId),
      userId,
      username: profile.username || "user",
      avatar: profile.avatar || "",
      message: trimmed,
    });
    setChatInput("");
    setChatError("");
  };

  const addToPlaylist = async () => {
    const url = playlistUrl.trim();
    if (!url) return;
    const meta = await fetchYouTubeMeta(url);
    const item = {
      id: Date.now(),
      title: (playlistTitle || meta.title || "Video YouTube").trim(),
      url,
      thumbnail: meta.thumbnail || getYouTubeThumb(url),
    };
    setPlaylistItems((prev) => [...prev, item]);
    setPlaylistUrl("");
    setPlaylistTitle("");
  };

  const removeFromPlaylist = (id) => {
    setPlaylistItems((prev) => prev.filter((item) => item.id !== id));
  };

  const playFromPlaylist = async (item) => {
    await syncChangeVideo(item.url, "Playlist");
  };

  const toggleFriend = (id) => {
    setSelectedFriends((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const sendInvites = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!effectiveRoomId || selectedFriends.length === 0) {
      setInviteStatus("Selectionne au moins un ami.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${effectiveRoomId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ friendIds: selectedFriends }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Envoi invitations echoue");
      setInviteStatus("Invitations envoyees !");
      setSelectedFriends([]);
    } catch (err) {
      setInviteStatus(err.message);
    }
  };

  const roomLink = `${window.location.origin}/room/${roomInfo.link || roomInfo.id || roomId}`;
  const copyLink = () => {
    navigator.clipboard.writeText(roomLink);
    setInviteStatus("Lien copie !");
  };

  // --------- Rendu ---------

  const normalizeAvatar = (value) => {
    const trimmed = (value || "").trim();
    if (!trimmed) return DEFAULT_AVATAR;
    if (
      trimmed === "avatar.png" ||
      trimmed === "avatar.jpg" ||
      trimmed === "avatar.jpeg" ||
      trimmed === "avatar"
    ) {
      return DEFAULT_AVATAR;
    }
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    if (trimmed.startsWith("data:") || trimmed.startsWith("/")) {
      return trimmed;
    }
    return `/${trimmed}`;
  };

  return (
    <div className="room-container">
      {/* HEADER */}
      <header className="room-header">
        <Link to="/" className="logo">CoWatch</Link>
        <div className="room-header-right">
          <span className="room-name">
            Room : <strong>{roomError ? "Room inconnue" : roomInfo.name}</strong>
          </span>
          <input className="search-input" type="text" placeholder="Rechercher..." />
          <button className="btn-logout" onClick={handleLogout}>Deconnexion</button>
        </div>
      </header>

      <div className="room-layout">
        {/* Sidebar gauche */}
        <aside className="room-sidebar">
          <div className="profile-mini">
            <img src={normalizeAvatar(profile.avatar)} alt={profile.username} className="profile-mini-avatar" />
            <span>
              {profileLoading ? "Chargement..." : profileError ? "Erreur profil" : `@${profile.username}`}
            </span>
          </div>

          <h3>Mon espace</h3>
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.id}>
                {item.path ? <Link to={item.path}>{item.label}</Link> : <span>{item.label}</span>}
              </li>
            ))}
            <li>
              <button className="sidebar-action" onClick={() => setShowInvite(true)}>
                Inviter des amis
              </button>
            </li>
            <li>
              <button className="sidebar-action" onClick={handleCloseRoom}>
                Quitter la room
              </button>
            </li>
          </ul>

        </aside>

        {/* Centre : video + historique */}
        <main className="room-center">
          <div className="video-section">
            <div className="url-input-box">
              <input
                type="text"
                placeholder="Collez une URL YouTube ici..."
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
              />
              <button onClick={loadVideo}>Load Video</button>
            </div>

            <div className="video-box">
              {currentVideo.url && getYouTubeId(currentVideo.url) ? (
                <div className="yt-player" ref={playerContainerRef}></div>
              ) : (
                <p className="placeholder">Aucune video chargee.</p>
              )}
            </div>
          </div>

          <section className="history-section">
            <h3>Historique</h3>
            <div className="history-list">
              {history.length === 0 && <p className="placeholder">Aucun historique pour cette room.</p>}
              {history.map((item) => (
                <div
                  key={item.id}
                  className="history-card"
                  onClick={() => syncChangeVideo(item.videoUrl, "Historique")}
                >
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.title} className="thumb-image" />
                  ) : (
                    <div className="thumb-placeholder"></div>
                  )}
                  <div className="history-info">
                    <h4>{item.title}</h4>
                    <p>{item.category}</p>
                    <span>{item.views}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Droite : Live room + chat */}
        <aside className="room-right">
          <section className="live-room">
            <h3>Live Room</h3>
            <div className="avatars">
              {participants.map((p) => (
                <div key={p.id} className="avatar" title={p.username}>
                  {roomSettings.showInitials ? (
                    p.initials
                  ) : (
                    <>
                      <img src={normalizeAvatar(p.avatar)} alt={p.username} />
                      <span className="avatar-name">{p.username}</span>
                    </>
                  )}
                </div>
              ))}
              {participants.length === 0 && <p className="placeholder">Aucun membre pour l'instant.</p>}
            </div>
          </section>

          <section className="playlist-section">
            <h3>Playlist</h3>
            <div className="playlist-inputs">
              <input
                type="text"
                placeholder="URL YouTube"
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
              />
              <input
                type="text"
                placeholder="Titre (optionnel)"
                value={playlistTitle}
                onChange={(e) => setPlaylistTitle(e.target.value)}
              />
              <button onClick={addToPlaylist}>Ajouter</button>
            </div>
            <ul className="playlist-list">
              {playlistItems.map((item) => (
                <li key={item.id} className="playlist-item">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.title} />
                  ) : (
                    <div className="playlist-thumb-placeholder"></div>
                  )}
                  <div className="playlist-info">
                    <span className="playlist-title">{item.title}</span>
                    <div className="playlist-actions">
                      <button onClick={() => playFromPlaylist(item)}>Lire</button>
                      <button onClick={() => removeFromPlaylist(item.id)}>Supprimer</button>
                    </div>
                  </div>
                </li>
              ))}
              {playlistItems.length === 0 && (
                <li className="playlist-empty">Ajoute des videos a ta playlist.</li>
              )}
            </ul>
          </section>

          <section className="chat-section">
            <h3>Chat</h3>
            {chatError && <p className="auth-error">{chatError}</p>}
            <div className="chat-messages">
              {chatMessages.map((msg) => (
                <p key={msg.id}>
                  <strong>{msg.author} :</strong> {msg.text}
                </p>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Ecrire un message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button onClick={sendMessage}>Envoyer</button>
            </div>
          </section>
        </aside>
      </div>

      {showInvite && (
        <div className="modal-overlay" onClick={() => setShowInvite(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Inviter des amis</h3>
            <div className="modal-section">
              <p>Lien de la room</p>
              <div className="link-box">
                <input type="text" value={roomLink} readOnly />
                <button onClick={copyLink}>Copier</button>
                <a href={`mailto:?subject=Rejoins ma room&body=${encodeURIComponent(roomLink)}`} className="share-btn">Gmail</a>
                <a href={`https://wa.me/?text=${encodeURIComponent(roomLink)}`} target="_blank" rel="noreferrer" className="share-btn">WhatsApp</a>
              </div>
            </div>
            <div className="modal-section">
              <p>Selectionne des amis</p>
              <div className="friends-grid">
                {friends.length === 0 && <p>Aucun ami disponible.</p>}
                {friends.map((f) => (
                  <label key={f.id} className="friend-item">
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(f.id)}
                      onChange={() => toggleFriend(f.id)}
                    />
                    <img src={normalizeAvatar(f.avatar)} alt={f.username || f.email} />
                    <span>{f.username || f.email}</span>
                  </label>
                ))}
              </div>
              {inviteStatus && <p className="auth-error" style={{ marginTop: 8 }}>{inviteStatus}</p>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                <button onClick={() => setShowInvite(false)} className="share-btn">Fermer</button>
                <button onClick={sendInvites} className="share-btn">Envoyer invitations</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
