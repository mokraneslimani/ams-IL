import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignIn from "./pages/SignIn";
import VideoRoom from "./pages/VideoRoom";
import CreateRoom from "./pages/CreateRoom";
import Profile from "./pages/Profile";
import StartRoom from "./pages/StartRoom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/start-room" element={<CreateRoom />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/start-room" element={<StartRoom />} />
  
<Route path="/room/:roomId" element={<VideoRoom />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
