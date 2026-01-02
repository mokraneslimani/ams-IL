import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignIn from "./pages/SignIn";
import VideoRoom from "./pages/VideoRoom";
import CreateRoom from "./pages/CreateRoom";
import Profile from "./pages/Profile";
import StartRoom from "./pages/StartRoom";
import Friends from "./pages/Friends";
import Notifications from "./pages/Notifications";
import CGU from "./pages/CGU";
import ProtectedRoute from "./components/ProtectedRoute";

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
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/start-room"
          element={
            <ProtectedRoute>
              <StartRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-room"
          element={
            <ProtectedRoute>
              <CreateRoom />
            </ProtectedRoute>
          }
        />

        {/* Watch */}
        <Route
          path="/room/:roomId"
          element={
            <ProtectedRoute>
              <VideoRoom />
            </ProtectedRoute>
          }
        />

        {/* Social */}
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <Friends />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route path="/cgu" element={<CGU />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
