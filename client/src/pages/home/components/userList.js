import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { createNewChat } from "./../../../apiCalls/chat";
import { hideLoader, showLoader } from "../../../redux/loaderSlice";
import { setAllChats, setSelectedChat } from "./../../../redux/userSlice";
import moment from "moment";
import { useEffect } from "react";
import store from "../../../redux/store";

function UsersList({ searchKey, socket, onlineUsers }) {
  const {
    allUsers,
    allChats,
    user: currentUser,
    selectedChat,
  } = useSelector((state) => state.userReducer);

  const dispatch = useDispatch();

  const startNewChat = async (searchedUserId) => {
    let response;
    try {
      dispatch(showLoader());
      response = await createNewChat([currentUser._id, searchedUserId]);
      dispatch(hideLoader());

      if (response.success) {
        toast.success(response.message);
        const newChat = response.data;
        const updatedChat = [...allChats, newChat];
        dispatch(setAllChats(updatedChat));
        dispatch(setSelectedChat(newChat));
      }
    } catch (error) {
      toast.error(response.message);
      dispatch(hideLoader());
    }
  };

  const openChat = (selectedUserId) => {
    const chat = allChats.find(
      (chat) =>
        chat.members.map((m) => m._id).includes(currentUser._id) &&
        chat.members.map((m) => m._id).includes(selectedUserId)
    );
    if (chat) {
      dispatch(setSelectedChat(chat));
    }
  };

  const isSelectedChat = (user) => {
    if (selectedChat) {
      return selectedChat.members.map((m) => m._id).includes(user._id);
    }
    return false;
  };

  const getLastMessageTimeStamp = (userId) => {
    const chat = allChats.find((chat) =>
      chat.members.map((m) => m._id).includes(userId)
    );

    if (!chat || !chat?.lastMessage) {
      return "";
    } else {
      return moment(chat?.lastMessage?.createdAt).format("hh:mm A");
    }
  };

  const getlastMessage = (userId) => {
    const chat = allChats.find((chat) =>
      chat.members.map((m) => m._id).includes(userId)
    );

    if (!chat || !chat.lastMessage) {
      return "";
    } else {
      const msgPrefix =
        chat?.lastMessage?.sender === currentUser._id ? "You: " : "";
      return msgPrefix + chat?.lastMessage?.text?.substring(0, 25);
    }
  };

  function formatName(user) {
    let fName =
      user.firstName.at(0).toUpperCase() +
      user.firstName.slice(1).toLowerCase();
    let lName =
      user.lastName.at(0).toUpperCase() + user.lastName.slice(1).toLowerCase();
    return fName + " " + lName;
  }

  useEffect(() => {
    socket.off("set-message-count").on("set-message-count", (message) => {
      const selectedChat = store.getState().userReducer.selectedChat;
      let allChats = store.getState().userReducer.allChats;

      if (selectedChat?._id !== message.chatId) {
        const updatedChats = allChats.map((chat) => {
          if (chat._id === message.chatId) {
            return {
              ...chat,
              unreadMessageCount: (chat?.unreadMessageCount || 0) + 1,
              lastMessage: message,
            };
          }
          return chat;
        });
        allChats = updatedChats;
      }
      const latestChat = allChats.find((chat) => chat._id === message.chatId);
      const otherChats = allChats.filter((chat) => chat._id !== message.chatId);
      allChats = [latestChat, ...otherChats];
      dispatch(setAllChats(allChats));
    });
  }, []);

  const getUnreadMessageCount = (userId) => {
    const chat = allChats.find((chat) =>
      chat.members.map((m) => m._id).includes(userId)
    );

    if (
      chat &&
      chat.unreadMessageCount &&
      chat.lastMessage.sender !== currentUser._id
    ) {
      return (
        <div className="unread-message-counter">{chat.unreadMessageCount}</div>
      );
    } else {
      return "";
    }
  };

  const getData = () => {
    if (searchKey === "") {
      return allChats;
    } else {
      return allUsers.filter((user) => {
        return (
          user.firstName.toLowerCase().includes(searchKey.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchKey.toLowerCase())
        );
      });
    }
  };

  return getData()
    .filter((obj) => obj !== undefined)
    .map((obj) => {
      let user = obj;
      if (obj.members) {
        user = obj.members.find((mem) => mem._id !== currentUser._id);
      }
      return (
        <div
          className="user-search-filter"
          onClick={() => openChat(user._id)}
          key={user._id}
        >
          <div
            className={isSelectedChat(user) ? "selected-user" : "filtered-user"}
          >
            <div className="filter-user-display">
              {user.profilePic && (
                <img
                  src={user.profilePic}
                  alt="Profile Pic"
                  className="user-profile-image"
                  style={
                    onlineUsers.includes(user._id)
                      ? { border: "#82e0aa 3px solid" }
                      : {}
                  }
                />
              )}
              {!user.profilePic && (
                <div
                  className={
                    isSelectedChat(user)
                      ? "user-selected-avatar"
                      : "user-default-avatar"
                  }
                  style={
                    onlineUsers.includes(user._id)
                      ? { border: "#82e0aa 3px solid" }
                      : {}
                  }
                >
                  {user.firstName.charAt(0).toUpperCase() +
                    user.lastName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="filter-user-details">
                <div className="user-display-name">{formatName(user)}</div>
                <div className="user-display-email">
                  {getlastMessage(user._id) || user.email}
                </div>
              </div>
              <div>
                {getUnreadMessageCount(user._id)}
                <div className="last-message-timestamp">
                  {getLastMessageTimeStamp(user._id)}
                </div>
              </div>
              {!allChats.find((chat) =>
                chat.members.map((m) => m._id).includes(user._id)
              ) && (
                <div className="user-start-chat">
                  <button
                    className="user-start-chat-btn"
                    onClick={() => startNewChat(user._id)}
                  >
                    Start Chat
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    });
}

export default UsersList;
