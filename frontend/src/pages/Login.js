import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', form);

      localStorage.setItem('token', response.data.token);

      localStorage.setItem(
        'user',
        JSON.stringify(response.data.user)
      );

      window.dispatchEvent(new Event('authChanged'));

      const role = response.data.user.role;

      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'worker') {
        navigate('/worker-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '3rem auto', padding: '2rem' }}>
      <h2>Login to SevaSetu</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: '1rem', color: 'red' }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default Login;