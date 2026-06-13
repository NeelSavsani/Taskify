import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Dashboard() {
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

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
            <div className="dashboard-header">
                <h1>📋 Todo Dashboard</h1>

                <button
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>

            <div className="task-form-card">
                <h2>Create New Task</h2>

                <form onSubmit={handleCreateTask}>
                    <div className="input-group">
                        <input
                            type="text"
                            name="title"
                            placeholder="Task Title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <textarea
                            name="description"
                            placeholder="Task Description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                    >
                        Add Task
                    </button>
                </form>
            </div>

            <div className="tasks-section">
                <h2>Your Tasks</h2>

                {loading ? (
                    <p>Loading Tasks...</p>
                ) : tasks.length === 0 ? (
                    <p>No tasks found.</p>
                ) : (
                    tasks.map((task) => (
                        <div
                            className="task-card"
                            key={task._id}
                        >
                            <div>
                                <h3>{task.title}</h3>

                                <p>
                                    {task.description}
                                </p>

                                <span className="task-status">
                                    {task.status}
                                </span>
                            </div>

                            <button
                                className="delete-btn"
                                onClick={() =>
                                    handleDeleteTask(
                                        task._id
                                    )
                                }
                            >
                                Delete
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Dashboard;