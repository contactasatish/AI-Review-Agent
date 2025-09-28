import React from 'react';

interface HeaderProps {
    activeRoute: string;
}

const Header: React.FC<HeaderProps> = ({ activeRoute }) => {

  const navLinkClasses = (path: string) => 
    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      activeRoute === path
        ? 'bg-brand-primary text-white'
        : 'text-brand-text-secondary hover:bg-brand-surface-light hover:text-white'
    }`;

  return (
    <header className="text-center mb-8">
      <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
        AI Review Assistant
      </h1>
      <p className="mt-2 text-lg text-brand-text-secondary">
        Analyze, Generate, and Approve Responses with Human-in-the-Loop AI
      </p>
      <nav className="mt-6 flex justify-center items-center space-x-4 border border-gray-700/50 bg-brand-surface rounded-lg p-2 max-w-xs mx-auto">
        <a href="#/" className={navLinkClasses('#/')}>Dashboard</a>
        <a href="#/admin" className={navLinkClasses('#/admin')}>Admin</a>
      </nav>
    </header>
  );
};

export default Header;