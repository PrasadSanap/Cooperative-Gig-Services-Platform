// Landing page
import React from 'react';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>{t('appTitle')}</h1>
      <p>Connecting verified cooperative workers with households & communities — fair wages, trusted service.</p>
    </div>
  );
};

export default Home;