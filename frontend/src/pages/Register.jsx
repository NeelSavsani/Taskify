import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEye,
    faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import API from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (
            formData.password !==
            formData.confirmPassword
        ) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const response = await API.post(
                "/auth/register",
                {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }
            );

            localStorage.setItem(
                "token",
                response.data.token
            );

            navigate("/dashboard");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Create Account</h1>

                <p className="subtitle">
                    Register to start managing tasks
                </p>

                {error && (
                    <div className="error-box">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Full Name</label>

                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Email Address</label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>

                        <div className="password-wrapper">
                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                placeholder="Enter password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />

                            <button
                                type="button"
                                className="eye-btn"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >
                                <FontAwesomeIcon
                                    icon={
                                        showPassword
                                            ? faEyeSlash
                                            : faEye
                                    }
                                />
                            </button>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>
                            Confirm Password
                        </label>

                        <div className="password-wrapper">
                            <input
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                name="confirmPassword"
                                placeholder="Confirm password"
                                value={
                                    formData.confirmPassword
                                }
                                onChange={handleChange}
                                required
                            />

                            <button
                                type="button"
                                className="eye-btn"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }
                            >
                                <FontAwesomeIcon
                                    icon={
                                        showConfirmPassword
                                            ? faEyeSlash
                                            : faEye
                                    }
                                />
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating Account..."
                            : "Register"}
                    </button>
                </form>

                <p className="register-link">
                    Already have an account?{" "}
                    <Link to="/">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;