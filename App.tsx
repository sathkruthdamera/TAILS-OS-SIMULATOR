
import React from 'react';
import Desktop from './components/Desktop';

const App: React.FC = () => {
  return (
    <div className="h-screen w-screen overflow-hidden antialiased">
      <Desktop />
    </div>
  );
};

export default App;
