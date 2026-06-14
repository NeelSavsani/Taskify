import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Dashboard() {
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [expanded, setExpanded] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
    });

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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();

        try {
            const response = await API.post(
                "/tasks",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
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
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setTasks(tasks.filter((task) => task._id !== id));
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

            <form
                className={`keep-note-box ${expanded ? "expanded" : ""}`}
                onSubmit={handleCreateTask}
            >
                {expanded && (
                    <input
                        type="text"
                        name="title"
                        placeholder="Title"
                        value={formData.title}
                        onChange={handleChange}
                        className="keep-title"
                        required
                    />
                )}

                <textarea
                    name="description"
                    placeholder="Take a note..."
                    value={formData.description}
                    onChange={handleChange}
                    onFocus={() => setExpanded(true)}
                    rows={expanded ? 4 : 1}
                    className="keep-content"
                />

                {expanded && (
                    <div className="keep-actions">

                        <button
                            type="button"
                            className="close-btn"
                            onClick={() => {
                                setExpanded(false);
                            }}
                        >
                            Close
                        </button>

                        <button
                            type="submit"
                            className="create-btn"
                        >
                            Create
                        </button>

                    </div>
                )}
            </form>

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
                            <h3>{task.title}</h3>

                            <p>
                                {task.description}
                            </p>

                            <div className="note-footer">

                                <span className="task-status">
                                    {task.status}
                                </span>

                                <button
                                    className="delete-btn"
                                    onClick={() =>
                                        handleDeleteTask(task._id)
                                    }
                                >
                                    Delete
                                </button>

                            </div>
                        </div>
                    ))}

                </div>
            )}

        </div>
    );
}

export default Dashboard;