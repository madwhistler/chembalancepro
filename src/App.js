import React, { useState, useEffect } from 'react';
import './App.css';
import { EquationInput } from './components/EquationInput';
import { Visualizer } from './components/Visualizer';
import { ReactionDetails } from './components/ReactionDetails';
import { processEquation } from './lib/chemistry';

function formatEquation(eq) {
  // Split on digits that follow a letter or closing paren (subscripts) vs. all other chars
  return eq.split(/([A-Za-z)][0-9]+)/).map((part, i) => {
    const match = part.match(/^([A-Za-z)])([0-9]+)$/);
    if (match) {
      return <React.Fragment key={i}>{match[1]}<sub>{match[2]}</sub></React.Fragment>;
    }
    return part;
  });
}

function App() {
  const [equation, setEquation] = useState('');
  const [balancedData, setBalancedData] = useState(null);
  const [committed, setCommitted] = useState(false);

  useEffect(() => {
    if (!equation.trim()) {
      setBalancedData(null);
      setCommitted(false);
      return;
    }

    const timer = setTimeout(() => {
      const result = processEquation(equation);
      setBalancedData(result);
    }, 500);

    return () => clearTimeout(timer);
  }, [equation]);

  const handleCommit = () => setCommitted(true);

  const handleEquationChange = (val) => {
    setEquation(val);
    setCommitted(false);
  };

  const isMobileDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  // On mobile, show nothing until the user taps Done
  const showResult = !isMobileDevice || committed;

  const error = !showResult ? null
    : balancedData?.state === 'impossible' ? 'Reaction is mathematically impossible.'
    : balancedData?.state === 'typo_zero' ? 'Check your formula: Did you type a zero "0" instead of the letter "O" (Oxygen)?'
    : balancedData?.state === 'invalid' && equation.length > 3 ? 'Invalid syntax. Example: H2 + O2 -> H2O'
    : null;

  const showBalanced = showResult && balancedData?.state === 'balanced';

  return (
    <div className={`App ${showBalanced ? 'active-theme' : ''}`}>
      <div className="credit-container">
        <a href="https://hexational.com" target="_blank" rel="noopener noreferrer" className="credit-inner">
          <span className="credit-text">App by</span>
          <img src="/hexational-logo.png" alt="Hexational Software" className="credit-logo" />
        </a>
        <a href="https://hexational.com/giving-page-1-1" target="_blank" rel="noreferrer" className="credit-inner">
          <span className="credit-text">Buy me a CH3CH2OH?</span>
        </a>
      </div>

      <div className="bg-glow"></div>

      <main className="main-content">
        <header className="header">
          <h1>ChemBalance Pro</h1>
          <p className="subtitle">Interactive Reaction Visualizer</p>
        </header>

        <section className="interaction-area">
          <EquationInput
            value={equation}
            onChange={handleEquationChange}
            onCommit={handleCommit}
            error={error}
          />

          {showBalanced && (
            <div className="balanced-result">
              <span className="badge">Balanced Equation</span>
              <div className="equation-display">
                {formatEquation(balancedData.balancedEq)}
              </div>
            </div>
          )}

          <Visualizer
            equation={equation}
            state={showResult ? balancedData?.state : null}
            coeffs={balancedData?.coeffs}
          />

          {showBalanced && (
            <ReactionDetails equation={balancedData.balancedEq} />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
