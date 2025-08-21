
import React, { useState, useEffect, useContext } from 'react';
import { TailsLogo } from '../constants';
import { Settings } from '../types';
import { DesktopContext } from './Desktop'; // Import context to get settings

const TopBar: React.FC<{ activeWindowName?: string, torStatus?: Settings['torStatus'] }> = ({ activeWindowName, torStatus }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const desktop = useContext(DesktopContext); // Access context

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const currentTorStatus = torStatus || desktop.activeSettings.torStatus; // Use prop or context

  const TorStatusIndicator: React.FC<{ status: Settings['torStatus'] }> = ({ status }) => {
    let color = 'bg-gray-500'; // Default/unknown
    let title = 'Tor Status Unknown';
    if (status === 'connected') {
      color = 'bg-green-500';
      title = 'Tor: Connected (Simulated)';
    } else if (status === 'disconnected') {
      color = 'bg-red-500';
      title = 'Tor: Disconnected (Simulated)';
    } else if (status === 'connecting') {
      color = 'bg-yellow-500 animate-pulse';
      title = 'Tor: Connecting... (Simulated)';
    }
    return <span title={title} className={`inline-block w-3 h-3 ${color} rounded-full mr-1`}></span>;
  };


  return (
    <div className="h-8 bg-slate-900 text-gray-200 flex items-center justify-between px-3 shadow-md select-none z-50 relative">
      <div className="flex items-center space-x-3">
        <TailsLogo className="h-5 w-5 text-blue-400" />
        <span className="font-semibold text-sm">Activities</span>
        {activeWindowName && <span className="text-sm opacity-80 pl-2">| {activeWindowName}</span>}
      </div>
      <div className="flex items-center space-x-4 text-sm">
        <span>{formatDate(currentTime)}</span>
        <TorStatusIndicator status={currentTorStatus} />
        {/* Placeholder icons for network, sound, battery */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="Network (Simulated)">
          <title>Network (Simulated)</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.059A7.5 7.5 0 0112 4.5c2.483 0 4.734.993 6.389 2.611M12 12a3.75 3.75 0 013.75 3.75M12 12a3.75 3.75 0 00-3.75 3.75m0 0H7.5m9 0H16.5m-3-9.75v.01M12 4.5v.01M12 21a8.966 8.966 0 01-5.977-2.073A8.966 8.966 0 0112 3a8.966 8.966 0 015.977 2.073A8.966 8.966 0 0112 21z" />
        </svg>
         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="Sound (Simulated)">
          <title>Sound (Simulated)</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4.75A2.75 2.75 0 012 12.25V11.75A2.75 2.75 0 014.75 9h.836m9.9.001L19.25 9A2.75 2.75 0 0122 11.75v.5A2.75 2.75 0 0119.25 15h-.836m-1.591-4.001a3 3 0 014.182 0M10.5 18L9 15.75l-1.5 2.25" />
        </svg>
      </div>
    </div>
  );
};

export default TopBar;
