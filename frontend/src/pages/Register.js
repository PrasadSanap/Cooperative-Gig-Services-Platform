import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
    cooperativeId: ''
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
      const response = await api.post('/auth/register', form);

      localStorage.setItem('token', response.data.token);

      localStorage.setItem(
        'user',
        JSON.stringify(response.data.user)
      );

      window.dispatchEvent(new Event('authChanged'));

      navigate('/');
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '3rem auto',
        padding: '2rem'
      }}
    >
      <h2>Create Your SevaSetu Account</h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <label>
          Full Name

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

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
          Phone Number

          <input
            type="tel"
            name="phone"
            value={form.phone}
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

        <label>
          Register As

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="customer">
              Customer
            </option>

            <option value="worker">
              Worker
            </option>
          </select>
        </label>

        {form.role === 'worker' && (
          <label>
            Cooperative ID

            <input
              type="text"
              name="cooperativeId"
              value={form.cooperativeId}
              onChange={handleChange}
              placeholder="Enter your Cooperative ID"
              required
            />

            <small
              style={{
                display: 'block',
                marginTop: '5px',
                color: '#666'
              }}
            >
              Enter the Cooperative ID provided by your
              cooperative.
            </small>
          </label>
        )}

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? 'Creating Account...'
            : 'Register'}
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: '1rem',
            color: 'red'
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default Register;