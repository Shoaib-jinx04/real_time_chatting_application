import { useSelector } from "react-redux";
import ChatArea from "./components/chat";
import Header from "./components/header";
import Sidebar from "./components/sideBar";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io("http://localhost:3000");

function Home() {
  const { selectedChat, user } = useSelector((state) => state.userReducer);
  const [onlineUsers, setOnlineUser] = useState([]);

  useEffect(() => {
    if (user) {
      socket.emit("join-room", user._id);
      socket.emit("user-login", user._id);

      socket.on("online-users", (onlineusers) => {
        setOnlineUser(onlineusers);
      });
      socket.on("online-users-updated", (onlineusers) => {
        setOnlineUser(onlineusers);
      });
    }
  }, [user, onlineUsers]);

  return (
    <div className="home-page">
      <Header socket={socket}></Header>
      <div className="main-content">
        <Sidebar socket={socket} onlineUsers={onlineUsers}></Sidebar>
        {selectedChat && <ChatArea socket={socket}></ChatArea>}
      </div>
    </div>
  );
}

export default Home;
