'use client';

import React from 'react';
import { HeaderNav } from './HeaderNav';
import { useApp } from '../../context/AppContext';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const handleSelectTab = (tab: any) => {
    setActiveTab(tab);
  };

  return <HeaderNav currentTab={activeTab as any} onSelectTab={handleSelectTab} />;
};
