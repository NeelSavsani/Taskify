import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Dashboard() {
    const navigate = useNavigate();

    const noteRef = useRef(null);

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [expanded, setExpanded] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
    });

    const fetchTasks = async () => {
        try {
            const response = await API.get("/tasks", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                        "token"
                    )}`,
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
            if (
                noteRef.current &&
                !noteRef.current.contains(event.target)
            ) {
                setExpanded(false);
                setOpenMenu(null);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
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

        if (
            !formData.title.trim() &&
            !formData.description.trim()
        ) {
            return;
        }

        try {
            const response = await API.post(
                "/tasks",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );

            setTasks([response.data, ...tasks]);

            setFormData({
                title: "",
                description: "",
            });

            setExpanded(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            await API.delete(`/tasks/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                        "token"
                    )}`,
                },
            });

            setTasks(
                tasks.filter(
                    (task) => task._id !== id
                )
            );
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

                <button
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </header>

            <div
                ref={noteRef}
                className={`keep-note-box ${
                    expanded ? "expanded" : ""
                }`}
            >
                {!expanded ? (
                    <input
                        className="keep-placeholder"
                        placeholder="Take a note..."
                        onFocus={() =>
                            setExpanded(true)
                        }
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
                            value={
                                formData.description
                            }
                            onChange={handleChange}
                            rows="5"
                            className="keep-content"
                        />

                        <div className="keep-actions">
                            <button
                                type="button"
                                className="close-btn"
                                onClick={() =>
                                    setExpanded(
                                        false
                                    )
                                }
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                className="create-btn"
                                onClick={
                                    handleCreateTask
                                }
                            >
                                Add
                            </button>
                        </div>
                    </>
                )}
            </div>

            {loading ? (
                <p className="empty-text">
                    Loading Tasks...
                </p>
            ) : tasks.length === 0 ? (
                <p className="empty-text">
                    No notes yet.
                </p>
            ) : (
                <div className="notes-grid">

                    {tasks.map((task) => (
                        <div
                            key={task._id}
                            className="note-card"
                        >
                            {task.title && (
                                <h3>
                                    {task.title}
                                </h3>
                            )}

                            <p>
                                {task.description}
                            </p>

                            <div className="note-footer">

                                <div className="note-actions">

                                    <button
                                        className="icon-btn"
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>

                                    <button
                                        className="icon-btn"
                                        title="Delete"
                                        onClick={() =>
                                            handleDeleteTask(
                                                task._id
                                            )
                                        }
                                    >
                                        🗑️
                                    </button>

                                    <div className="menu-wrapper">
                                        <button
                                            className="icon-btn"
                                            onClick={() =>
                                                setOpenMenu(
                                                    openMenu ===
                                                        task._id
                                                        ? null
                                                        : task._id
                                                )
                                            }
                                        >
                                            ⋮
                                        </button>

                                        {openMenu ===
                                            task._id && (
                                            <div className="keep-menu">
                                                <button>
                                                    Archive
                                                </button>

                                                <button>
                                                    Change
                                                    Status
                                                </button>

                                                <button>
                                                    Duplicate
                                                </button>

                                                <button>
                                                    Details
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                </div>

                            </div>
                        </div>
                    ))}

                </div>
            )}
        </div>
    );
}

export default Dashboard;