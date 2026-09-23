import React, { useEffect, useState } from 'react';
import {
  Link,
  useLocation,
  useNavigate
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  getUnreadNotificationCount
} from '../services/api';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');

    return savedUser
      ? JSON.parse(savedUser)
      : null;
  });

  const [unreadCount, setUnreadCount] =
    useState(0);

  // ======================================================
  // UPDATE USER WHEN AUTH CHANGES
  // ======================================================

  useEffect(() => {
    const updateUser = () => {
      const savedUser =
        localStorage.getItem('user');

      setUser(
        savedUser
          ? JSON.parse(savedUser)
          : null
      );
    };

    window.addEventListener(
      'authChanged',
      updateUser
    );

    return () => {
      window.removeEventListener(
        'authChanged',
        updateUser
      );
    };
  }, []);

  // ======================================================
  // FETCH UNREAD NOTIFICATION COUNT
  // ======================================================

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) {
        setUnreadCount(0);
        return;
      }

      try {
        const response =
          await getUnreadNotificationCount();

        setUnreadCount(
          response.data?.count || 0
        );
      } catch (error) {
        console.error(
          'Error fetching unread notification count:',
          error
        );

        setUnreadCount(0);
      }
    };

    fetchUnreadCount();

    // Refresh unread count every 30 seconds
    const interval = setInterval(
      fetchUnreadCount,
      30000
    );

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  // ======================================================
  // CHANGE LANGUAGE
  // ======================================================

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  // ======================================================
  // LOGOUT
  // ======================================================

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUnreadCount(0);

    window.dispatchEvent(
      new Event('authChanged')
    );

    navigate('/login');
  };

  // ======================================================
  // ACTIVE LINK
  // ======================================================

  const isActive = (path) =>
    location.pathname === path;

  const linkStyle = (path) => ({
    color: isActive(path)
      ? '#ffffff'
      : '#d1d5db',

    textDecoration: 'none',

    fontWeight: isActive(path)
      ? '700'
      : '500',

    padding: '8px 12px',

    borderRadius: '6px',

    background: isActive(path)
      ? 'rgba(255, 255, 255, 0.12)'
      : 'transparent',

    transition: '0.2s ease',

    whiteSpace: 'nowrap'
  });

  return (
    <nav
      style={{
        background:
          'linear-gradient(135deg, #1b5e20, #2e7d32)',

        color: '#ffffff',

        padding: '0 2rem',

        minHeight: '72px',

        display: 'flex',

        alignItems: 'center',

        justifyContent: 'space-between',

        boxShadow:
          '0 2px 10px rgba(0, 0, 0, 0.12)',

        gap: '1rem',

        flexWrap: 'wrap'
      }}
    >

      {/* ==================================================
          LOGO
      ================================================== */}

      <Link
        to="/"
        style={{
          color: '#ffffff',
          textDecoration: 'none',
          fontSize: '1.35rem',
          fontWeight: '700',
          letterSpacing: '0.3px'
        }}
      >
        {t('appTitle')}
      </Link>


      {/* ==================================================
          MAIN NAVIGATION
      ================================================== */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          flexWrap: 'wrap'
        }}
      >

        <Link
          to="/"
          style={linkStyle('/')}
        >
          {t('nav.home')}
        </Link>


        {/* CUSTOMER LINKS */}

        {user?.role === 'customer' && (
          <>
            <Link
              to="/booking"
              style={linkStyle('/booking')}
            >
              {t('nav.booking')}
            </Link>

            <Link
              to="/my-bookings"
              style={linkStyle('/my-bookings')}
            >
              📋 My Bookings
            </Link>
          </>
        )}


        {/* ADMIN LINK */}

        {user?.role === 'admin' && (
          <Link
            to="/dashboard"
            style={linkStyle('/dashboard')}
          >
            🛡️ {t('nav.dashboard')}
          </Link>
        )}


        {/* WORKER LINK */}

        {user?.role === 'worker' && (
          <Link
            to="/worker-dashboard"
            style={linkStyle(
              '/worker-dashboard'
            )}
          >
            🔧 Worker Dashboard
          </Link>
        )}

      </div>


      {/* ==================================================
          RIGHT SIDE
      ================================================== */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap'
        }}
      >

        {user ? (
          <>

            {/* ============================================
                NOTIFICATIONS
            ============================================ */}

            <Link
              to="/notifications"
              style={{
                position: 'relative',

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'center',

                width: '42px',

                height: '38px',

                borderRadius: '7px',

                color: '#ffffff',

                textDecoration: 'none',

                background:
                  isActive('/notifications')
                    ? 'rgba(255, 255, 255, 0.18)'
                    : 'rgba(255, 255, 255, 0.08)',

                transition: '0.2s ease',

                fontSize: '20px'
              }}
              title="Notifications"
            >

              🔔

              {/* UNREAD BADGE */}

              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',

                    top: '-5px',

                    right: '-5px',

                    minWidth: '19px',

                    height: '19px',

                    padding: '0 5px',

                    borderRadius: '20px',

                    background: '#dc3545',

                    color: '#ffffff',

                    fontSize: '11px',

                    fontWeight: '700',

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent: 'center',

                    border:
                      '2px solid #2e7d32',

                    boxSizing: 'border-box'
                  }}
                >
                  {unreadCount > 99
                    ? '99+'
                    : unreadCount}
                </span>
              )}

            </Link>


            {/* ============================================
                USER INFO
            ============================================ */}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                lineHeight: '1.2'
              }}
            >

              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#d1fae5'
                }}
              >
                Logged in as
              </span>

              <span
                style={{
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}
              >
                {user.name}
              </span>

            </div>


            {/* ============================================
                LOGOUT
            ============================================ */}

            <button
              onClick={handleLogout}
              style={{
                border:
                  '1px solid rgba(255, 255, 255, 0.5)',

                borderRadius: '6px',

                padding: '8px 14px',

                background: 'transparent',

                color: '#ffffff',

                fontWeight: '600',

                cursor: 'pointer'
              }}
            >
              Logout
            </button>

          </>
        ) : (
          <>

            {/* LOGIN */}

            <Link
              to="/login"
              style={{
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: '600',
                padding: '8px 12px'
              }}
            >
              Login
            </Link>


            {/* REGISTER */}

            <Link
              to="/register"
              style={{
                background: '#ffffff',
                color: '#1b5e20',
                textDecoration: 'none',
                fontWeight: '700',
                padding: '8px 14px',
                borderRadius: '6px'
              }}
            >
              Register
            </Link>

          </>
        )}


        {/* ==================================================
            LANGUAGE
        ================================================== */}

        <select
          onChange={(e) =>
            changeLanguage(e.target.value)
          }
          value={i18n.language}
          style={{
            width: 'auto',
            padding: '7px 10px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.85rem'
          }}
        >
          <option value="en">
            English
          </option>

          <option value="hi">
            हिंदी
          </option>
        </select>

      </div>

    </nav>
  );
};

export default Navbar;