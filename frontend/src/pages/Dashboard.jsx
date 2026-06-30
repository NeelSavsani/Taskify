import Masonry from "react-masonry-css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faPen,
  faTrash,
  faEllipsisVertical,
  faRotateRight,
  faTableCellsLarge,
  faMoon,
  faSun,
  faList,
  faUser,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const noteRef = useRef(null);
  const textareaRef = useRef(null);
  const profileRef = useRef(null);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [expanded, setExpanded] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [openProfile, setOpenProfile] = useState(false);

  const [isListView, setIsListView] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [username, setUsername] = useState("");

  const avatarColors = [
    "#1A73E8", // Blue
    "#34A853", // Green
    "#EA4335", // Red
    "#FBBC04", // Yellow
    "#A142F4", // Purple
    "#F4511E", // Deep Orange
    "#00ACC1", // Cyan
    "#7CB342", // Lime
    "#8E24AA", // Violet
    "#E91E63", // Pink
    "#5E35B1", // Indigo
    "#039BE5", // Light Blue
    "#00897B", // Teal
    "#43A047", // Green
    "#F57C00", // Orange
    "#C2185B", // Dark Pink
    "#6D4C41", // Brown
    "#546E7A", // Blue Grey
  ];

  const [avatarColor, setAvatarColor] = useState("#1A73E8");

  const [editData, setEditData] = useState({
    title: "",
    description: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    if (editingTask && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editData.description, editingTask]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await API.get("/tasks", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTasks(response.data);

      if (response.data && response.data.user) {
        const apiUser =
          response.data.user.username ||
          response.data.user.email ||
          response.data.user.name;
        if (apiUser) setUsername(apiUser.trim());
      } else if (
        response.data &&
        response.data.length > 0 &&
        response.data[0].user
      ) {
        const noteUser =
          response.data[0].user.username || response.data[0].user.email;
        if (noteUser) setUsername(noteUser.trim());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const savedName =
        localStorage.getItem("username") || localStorage.getItem("user");
      const savedEmail = localStorage.getItem("email");

      if (
        savedName &&
        savedName !== "undefined" &&
        savedName !== "null" &&
        savedName.trim() !== ""
      ) {
        setUsername(savedName.trim());
      } else if (
        savedEmail &&
        savedEmail !== "undefined" &&
        savedEmail !== "null" &&
        savedEmail.trim() !== ""
      ) {
        setUsername(savedEmail.split("@")[0].trim());
      } else {
        const payloadBase64 = token.split(".")[1];
        if (payloadBase64) {
          const decodedJson = JSON.parse(atob(payloadBase64));
          const jwtName =
            decodedJson.username || decodedJson.name || decodedJson.email;
          if (jwtName) {
            setUsername(jwtName.split("@")[0].trim());
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse user tracking metadata:", e);
    }

    const randomIndex = Math.floor(Math.random() * avatarColors.length);

    setAvatarColor(avatarColors[randomIndex]);

    fetchTasks();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (noteRef.current && !noteRef.current.contains(event.target)) {
        setExpanded(false);
      }

      if (
        !event.target.closest(".menu-wrapper") &&
        !event.target.closest(".keep-menu")
      ) {
        setOpenMenu(null);
      }

      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpenProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleTheme = () => {
    setIsLightTheme((prev) => {
      const nextTheme = !prev;
      if (nextTheme) {
        document.body.classList.add("light-theme");
      } else {
        document.body.classList.remove("light-theme");
      }
      return nextTheme;
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() && !formData.description.trim()) {
      return;
    }

    try {
      const response = await API.post("/tasks", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setTasks((prevTasks) => [response.data, ...prevTasks]);

      setFormData({
        title: "",
        description: "",
      });

      setExpanded(false);
      document.activeElement?.blur();

      if (noteRef.current) {
        const inputs = noteRef.current.querySelectorAll("input, textarea");
        inputs.forEach((input) => {
          input.value = "";
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    try {
      const response = await API.put(`/tasks/${editingTask._id}`, editData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setTasks(
        tasks.map((task) =>
          task._id === editingTask._id ? response.data : task,
        ),
      );

      setEditingTask(null);
      setEditData({ title: "", description: "" });
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    document.body.classList.remove("light-theme");
    navigate("/");
  };

  const handleProfileClick = () => {
    setOpenProfile(false);
    navigate("/profile");
  };

  const masonryBreakpoints = isListView
    ? { default: 1 }
    : {
        default: 6,
        1700: 5,
        1400: 4,
        1100: 3,
        800: 2,
        600: 1,
      };

  const getAvatarLetter = () => {
    // Priority 1: username stored in state
    if (username && username.trim()) {
      return username.trim().charAt(0).toUpperCase();
    }

    // Priority 2: try localStorage username
    const storedUsername = localStorage.getItem("username");
    if (
      storedUsername &&
      storedUsername !== "undefined" &&
      storedUsername !== "null" &&
      storedUsername.trim()
    ) {
      return storedUsername.trim().charAt(0).toUpperCase();
    }

    // Priority 3: try email
    const storedEmail = localStorage.getItem("email");
    if (
      storedEmail &&
      storedEmail !== "undefined" &&
      storedEmail !== "null" &&
      storedEmail.trim()
    ) {
      return storedEmail.trim().charAt(0).toUpperCase();
    }

    // Priority 4: decode JWT
    try {
      const token = localStorage.getItem("token");

      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));

        const name = payload.username || payload.name || payload.email;

        if (name) {
          return name.trim().charAt(0).toUpperCase();
        }
      }
    } catch (err) {
      console.error(err);
    }

    return "?";
  };

  return (
    <div className="dashboard-container">
      {/* GOOGLE KEEP STYLE HEADER */}
      <header className="dashboard-header">
        <div className="header-left">
          <img
            src="/Logo.png"
            alt="Taskify Logo"
            style={{
              width: "40px",
              height: "40px",
              objectFit: "contain",
              marginRight: "4px",
            }}
          />
          <h1>Taskify</h1>
        </div>

        <div className="header-right">
          <button className="header-btn" title="Refresh" onClick={fetchTasks}>
            <FontAwesomeIcon icon={faRotateRight} />
          </button>

          <button
            className="header-btn"
            title={isListView ? "Grid view" : "List view"}
            onClick={() => setIsListView(!isListView)}
          >
            <FontAwesomeIcon icon={isListView ? faTableCellsLarge : faList} />
          </button>

          <button
            className="header-btn"
            title="Toggle theme"
            onClick={toggleTheme}
          >
            <FontAwesomeIcon icon={isLightTheme ? faMoon : faSun} />
          </button>

          <div className="avatar-container" ref={profileRef}>
            <div
              className="user-avatar"
              style={{
                backgroundColor: avatarColor,
              }}
              onClick={() => setOpenProfile(!openProfile)}
            >
              {getAvatarLetter()}
            </div>

            {openProfile && (
              <div
                className="profile-menu"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={handleProfileClick}>
                  <FontAwesomeIcon icon={faUser} />
                  <span>My Profile</span>
                </button>
                <button onClick={handleLogout}>
                  <FontAwesomeIcon icon={faRightFromBracket} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CREATE NOTE INPUT */}
      <div
        ref={noteRef}
        className={`keep-note-box ${expanded ? "expanded" : ""}`}
      >
        {!expanded ? (
          <input
            className="keep-placeholder"
            placeholder="Take a note..."
            onFocus={() => setExpanded(true)}
            readOnly
          />
        ) : (
          <>
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleChange}
              className="keep-title"
            />

            <textarea
              name="description"
              placeholder="Take a note..."
              value={formData.description}
              onChange={handleChange}
              rows="5"
              className="keep-content"
            />

            <div className="keep-actions">
              <button
                type="button"
                className="close-btn"
                onClick={() => setExpanded(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="create-btn"
                onClick={handleCreateTask}
              >
                Add
              </button>
            </div>
          </>
        )}
      </div>

      {/* MASONRY CARDS LAYOUT CONTAINER */}
      {loading ? (
        <p className="empty-text">Loading Tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="empty-text">No notes yet.</p>
      ) : (
        <Masonry
          breakpointCols={masonryBreakpoints}
          className="notes-grid"
          columnClassName="notes-grid-column"
        >
          {tasks.map((task) => (
            <div
              key={task._id}
              className="note-card"
              style={{
                maxWidth: isListView ? "600px" : "100%",
                margin: isListView ? "0 auto 16px" : "",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setEditingTask(task);
                setEditData({
                  title: task.title,
                  description: task.description,
                });
                setOpenMenu(null);
              }}
            >
              {task.title && <h3>{task.title}</h3>}
              <p>{task.description}</p>

              <div className="note-footer">
                <div
                  className={`note-actions ${
                    openMenu === task._id ? "menu-open" : ""
                  }`}
                >
                  <button
                    className="icon-btn"
                    title="Edit"
                    onClick={() => {
                      setEditingTask(task);
                      setEditData({
                        title: task.title,
                        description: task.description,
                      });
                      setOpenMenu(null);
                    }}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>

                  <button
                    className="icon-btn"
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task._id);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>

                  <div className="menu-wrapper">
                    <button
                      className="icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenu(openMenu === task._id ? null : task._id);
                      }}
                    >
                      <FontAwesomeIcon icon={faEllipsisVertical} />
                    </button>

                    {openMenu === task._id && (
                      <div
                        className="keep-menu"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button onClick={() => setOpenMenu(null)}>
                          Archive
                        </button>
                        <button onClick={() => setOpenMenu(null)}>
                          Change Status
                        </button>
                        <button onClick={() => setOpenMenu(null)}>
                          Duplicate
                        </button>
                        <button onClick={() => setOpenMenu(null)}>
                          Details
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Masonry>
      )}

      {/* EDIT MODAL ELEMENT */}
      {editingTask && (
        <div
          className="keep-modal-overlay"
          onClick={async () => {
            await handleUpdateTask();
          }}
        >
          <div className="keep-modal" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              className="modal-title"
              placeholder="Title"
              value={editData.title}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  title: e.target.value,
                })
              }
            />

            <textarea
              ref={textareaRef}
              className="modal-content"
              placeholder="Note"
              value={editData.description}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  description: e.target.value,
                })
              }
              rows="1"
            />

            <div className="modal-actions">
              <button className="close-btn" onClick={handleUpdateTask}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
