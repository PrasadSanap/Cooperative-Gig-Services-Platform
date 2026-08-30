// Top navigation bar with language switcher
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => i18n.changeLanguage(lng);

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#2e7d32', color: '#fff' }}>
      <h2>{t('appTitle')}</h2>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/" style={{ color: '#fff' }}>{t('nav.home')}</Link>
        <Link to="/booking" style={{ color: '#fff' }}>{t('nav.booking')}</Link>
        <Link to="/dashboard" style={{ color: '#fff' }}>{t('nav.dashboard')}</Link>
        {/* Language switcher for multilingual support */}
        <select onChange={(e) => changeLanguage(e.target.value)} defaultValue="en">
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
        </select>
      </div>
    </nav>
  );
};

export default Navbar;