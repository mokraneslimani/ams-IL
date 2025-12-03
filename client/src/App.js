import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignIn from "./pages/SignIn";
import VideoRoom from "./pages/VideoRoom";
import CreateRoom from "./pages/CreateRoom";
import Profile from "./pages/Profile";
import StartRoom from "./pages/StartRoom";
// plus tard : Friends, Notifications, etc.
// import Friends from "./pages/Friends";
// import Notifications from "./pages/Notifications";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Accueil */}
        <Route path="/" element={<Home />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<SignIn />} />

        {/* Profil + Start Room */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/start-room" element={<StartRoom />} />
        <Route path="/create-room" element={<CreateRoom />} />

        {/* Watch */}
        <Route path="/room/:roomId" element={<VideoRoom />} />

        {/* Plus tard */}
        {/* <Route path="/friends" element={<Friends />} /> */}
        {/* <Route path="/notifications" element={<Notifications />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
