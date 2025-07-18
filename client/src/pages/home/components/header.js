import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function Header({ socket }) {
  const { user } = useSelector((state) => state.userReducer);
  const navigate = useNavigate();

  function getFullName() {
    let fName =
      user?.firstName.charAt(0).toUpperCase() +
      user?.firstName.slice(1).toLowerCase();
    let lName =
      user?.lastName.charAt(0).toUpperCase() +
      user?.lastName.slice(1).toLowerCase();
    return fName + " " + lName;
  }

  function getInitials() {
    let f = user?.firstName.toUpperCase()[0];
    let l = user?.lastName.toUpperCase()[0];
    return f + l;
  }

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    socket.emit("user-offline", user._id);
  };

  return (
    <div className="app-header">
      <div className="app-logo">
        <i className="fa fa-comments" aria-hidden="true"></i>
        Chit-Chattery
      </div>
      <div className="app-user-profile">
        {user?.profilePic && (
          <img
            src={user?.profilePic}
            alt="profile-pic"
            className="logged-user-profile-pic"
            onClick={() => navigate("/profile")}
          ></img>
        )}
        {!user?.profilePic && (
          <div
            className="logged-user-profile-pic"
            onClick={() => navigate("/profile")}
          >
            {getInitials()}
          </div>
        )}
        <div className="logged-user-name">{getFullName()}</div>
        <button className="logout-btn" onClick={logout}>
          <i className="fa fa-power-off"></i>
        </button>
      </div>
    </div>
  );
}

export default Header;
