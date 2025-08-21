
import React from 'react';
import { AppProps } from '../../types';
import { TorBrowserIcon } from '../../constants';


const TorBrowserApp: React.FC<AppProps> = () => {
  return (
    <div className="h-full flex flex-col bg-slate-100 text-slate-800">
      <div className="p-2 bg-slate-300 flex items-center space-x-2 border-b border-slate-400">
        <button className="p-1 rounded hover:bg-slate-400 disabled:opacity-50" disabled>{"<"}</button>
        <button className="p-1 rounded hover:bg-slate-400 disabled:opacity-50" disabled>{">"}</button>
        <button className="p-1 rounded hover:bg-slate-400 disabled:opacity-50" disabled>&#x21BB;</button>
        <input 
          type="text" 
          value="https://tails.net (simulated)" 
          readOnly 
          className="flex-grow bg-white p-1 rounded border border-slate-400 text-sm focus:outline-none"
        />
      </div>
      <div className="flex-grow p-6 flex flex-col items-center justify-center text-center">
        <TorBrowserIcon className="w-24 h-24 text-purple-600 mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Tor Browser (Simulated)</h1>
        <p className="text-slate-600 mb-4">
          This is a simplified simulation of the Tor Browser.
          <br />
          In a real Tails OS, Tor Browser routes your internet traffic through the Tor network for anonymity.
        </p>
        <p className="text-sm bg-yellow-100 border border-yellow-300 text-yellow-700 p-3 rounded">
          <strong>Note:</strong> Your connection is <strong>NOT</strong> actually anonymized through this simulation.
        </p>
      </div>
      <div className="p-1 bg-slate-300 text-xs text-slate-600 border-t border-slate-400 text-center">
        Status: Connected (Simulated)
      </div>
    </div>
  );
};

export default TorBrowserApp;
