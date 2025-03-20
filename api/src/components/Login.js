import React, { useState } from 'react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            newErrors.email = 'Email is required.';
        } else if (!emailPattern.test(email)) {
            newErrors.email = 'Invalid email format.';
        }

        if (!password) {
            newErrors.password = 'Password is required.';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setErrors({});

        if (!validateForm()) {
            return;
        }

        const response = await fetch('/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ EmailAddress: email, Password: password })
        });

        const data = await response.json();
        if (response.ok) {
            setMessage(`Login successful! Welcome, ${data.user.EmailAddress}.`);
        } else {
            setMessage(`Error: ${data.message}`);
        }
    };

    return (
        <div className="container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {errors.password && <div style={{ color: 'red' }}>{errors.password}</div>}
                <button type="submit">Login</button>
            </form>
            {message && <div id="message">{message}</div>}
        </div>
    );
};

export default Login;
