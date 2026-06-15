import Masonry from "react-masonry-css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faPen,
  faTrash,
  faEllipsisVertical,
} from "@fortawesome/free-solid-svg-icons";

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const noteRef = useRef(null);
  const textareaRef = useRef(null);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [expanded, setExpanded] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const [editData, setEditData] = useState({
    title: "",
    description: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  // Calculate dynamic auto-grow until layout max boundary limit is reached
  useEffect(() => {
    if (editingTask && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editData.description, editingTask]);

  const fetchTasks = async () => {
    try {
      const response = await API.get("/tasks", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTasks(response.data);
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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          task._id === editingTask._id ? response.data : task
        )
      );

      setEditingTask(null);
      setEditData({ title: "", description: "" });
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Taskify</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

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

      {loading ? (
        <p className="empty-text">Loading Tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="empty-text">No notes yet.</p>
      ) : (
        <Masonry
          breakpointCols={{
            default: 6,
            1700: 5,
            1400: 4,
            1100: 3,
            800: 2,
            600: 1,
          }}
          className="notes-grid"
          columnClassName="notes-grid-column"
        >
          {tasks.map((task) => (
            <div
              key={task._id}
              className="note-card"
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