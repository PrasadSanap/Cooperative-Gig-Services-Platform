import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();

  const user = JSON.parse(localStorage.getItem('user'));

  const services = [
    {
      icon: '⚡',
      title: 'Electrician',
      description: 'Trusted electrical repair, installation and maintenance services.'
    },
    {
      icon: '🔧',
      title: 'Plumber',
      description: 'Quick solutions for leaks, pipes, taps and other plumbing needs.'
    },
    {
      icon: '🛠️',
      title: 'Carpenter',
      description: 'Reliable furniture repair, fitting and household carpentry services.'
    },
    {
      icon: '🧹',
      title: 'Cleaning',
      description: 'Professional household and community cleaning services.'
    }
  ];

  const getDashboardLink = () => {
    if (user?.role === 'customer') return '/my-bookings';
    if (user?.role === 'worker') return '/worker-dashboard';
    if (user?.role === 'admin') return '/dashboard';
    return '/login';
  };

  const getDashboardText = () => {
    if (user?.role === 'customer') return 'View My Bookings';
    if (user?.role === 'worker') return 'Go to Worker Dashboard';
    if (user?.role === 'admin') return 'Go to Admin Dashboard';
    return 'Login to Continue';
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background:
            'linear-gradient(135deg, #e8f5e9 0%, #f6f8f7 55%, #fff3e0 100%)',
          padding: '5rem 1rem'
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              display: 'inline-block',
              background: '#dcfce7',
              color: '#15803d',
              padding: '7px 14px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '600',
              marginBottom: '1.25rem'
            }}
          >
            🤝 Trusted Community Services
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              marginBottom: '1rem',
              maxWidth: '900px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
            {t('appTitle')}
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: '#6b7280',
              maxWidth: '750px',
              margin: '0 auto 2rem'
            }}
          >
            Connecting verified cooperative workers with households and
            communities for trusted services, fair opportunities and better
            livelihoods.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}
          >
            {user?.role === 'customer' ? (
              <Link
                to="/booking"
                className="primary-button"
                style={{
                  padding: '13px 24px'
                }}
              >
                🛠️ Book a Service
              </Link>
            ) : !user ? (
              <Link
                to="/register"
                className="primary-button"
                style={{
                  padding: '13px 24px'
                }}
              >
                Get Started
              </Link>
            ) : null}

            <Link
              to={getDashboardLink()}
              className="secondary-button"
              style={{
                padding: '13px 24px'
              }}
            >
              {getDashboardText()} →
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="page-container">
        <div
          style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}
        >
          <h2>Our Popular Services</h2>

          <p
            style={{
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            Find skilled and verified workers for your everyday household and
            community service needs.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {services.map((service) => (
            <div
              key={service.title}
              className="card"
              style={{
                textAlign: 'center',
                transition: 'transform 0.2s ease'
              }}
            >
              <div
                style={{
                  fontSize: '2.5rem',
                  marginBottom: '0.75rem'
                }}
              >
                {service.icon}
              </div>

              <h3>{service.title}</h3>

              <p
                style={{
                  color: '#6b7280',
                  fontSize: '0.95rem',
                  marginTop: '0.5rem'
                }}
              >
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency Section */}
      <section
        style={{
          padding: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            background:
              'linear-gradient(135deg, #fff3e0, #ffffff)',
            border: '1px solid #fed7aa',
            borderRadius: '12px',
            padding: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap'
          }}
        >
          <div>
            <h2 style={{ marginBottom: '0.5rem' }}>
              ⚡ Need Help Urgently?
            </h2>

            <p style={{ color: '#6b7280', marginBottom: 0 }}>
              Create an emergency booking and we will match you with an
              available verified worker nearby.
            </p>
          </div>

          {user?.role === 'customer' && (
            <Link
              to="/booking"
              className="primary-button"
              style={{
                background: '#d97706',
                padding: '12px 20px',
                whiteSpace: 'nowrap'
              }}
            >
              Emergency Booking
            </Link>
          )}

          {!user && (
            <Link
              to="/login"
              className="primary-button"
              style={{
                background: '#d97706',
                padding: '12px 20px',
                whiteSpace: 'nowrap'
              }}
            >
              Login to Book
            </Link>
          )}
        </div>
      </section>

      {/* Why SevaSetu */}
      <section
        style={{
          background: '#ffffff',
          padding: '4rem 1rem'
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            textAlign: 'center'
          }}
        >
          <h2>Why Choose SevaSetu?</h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
              marginTop: '2rem'
            }}
          >
            <div>
              <div style={{ fontSize: '2rem' }}>✅</div>
              <h3 style={{ marginTop: '0.75rem' }}>
                Verified Workers
              </h3>
              <p style={{ color: '#6b7280' }}>
                Connect with trusted and verified service professionals.
              </p>
            </div>

            <div>
              <div style={{ fontSize: '2rem' }}>📍</div>
              <h3 style={{ marginTop: '0.75rem' }}>
                Nearby Matching
              </h3>
              <p style={{ color: '#6b7280' }}>
                Match bookings with suitable available workers nearby.
              </p>
            </div>

            <div>
              <div style={{ fontSize: '2rem' }}>⭐</div>
              <h3 style={{ marginTop: '0.75rem' }}>
                Transparent Feedback
              </h3>
              <p style={{ color: '#6b7280' }}>
                Customers can rate and share feedback after service completion.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;