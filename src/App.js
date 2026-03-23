import React, { useState, useEffect } from 'react';
import './App.css';
import { EquationInput } from './components/EquationInput';
import { Visualizer } from './components/Visualizer';
import { ReactionDetails } from './components/ReactionDetails';
import { processEquation } from './lib/chemistry';

function App() {
  const [equation, setEquation] = useState('');
  const [balancedData, setBalancedData] = useState(null);

  useEffect(() => {
    if (!equation.trim()) {
      setBalancedData(null);
      return;
    }

    const timer = setTimeout(() => {
      const result = processEquation(equation);
      setBalancedData(result);
    }, 500); // Debounce typing

    return () => clearTimeout(timer);
  }, [equation]);

  const error = balancedData?.state === 'impossible' ? 'Reaction is mathematically impossible.'
    : balancedData?.state === 'typo_zero' ? 'Check your formula: Did you type a zero "0" instead of the letter "O" (Oxygen)?'
      : balancedData?.state === 'invalid' && equation.length > 3 ? 'Invalid syntax. Example: H2 + O2 -> H2O'
        : null;

  return (
    <div className={`App ${balancedData?.state === 'balanced' ? 'active-theme' : ''}`}>
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
            onChange={setEquation}
            error={error}
          />

          {balancedData?.state === 'balanced' && (
            <div className="balanced-result">
              <span className="badge">Balanced Equation</span>
              <div className="equation-display">
                {balancedData.balancedEq}
              </div>
            </div>
          )}

          <Visualizer
            equation={equation}
            state={balancedData?.state}
            coeffs={balancedData?.coeffs}
          />

          {balancedData?.state === 'balanced' && (
            <ReactionDetails equation={balancedData.balancedEq} />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
