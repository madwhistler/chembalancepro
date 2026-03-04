import React, { useState } from 'react';
import './EquationInput.css';

export function EquationInput({ value, onChange, placeholder, error }) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={`input-container ${isFocused ? 'focused' : ''} ${error ? 'error' : ''}`}>
            <div className="input-wrapper">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder || 'Enter equation (e.g. H2 + O2 -> H2O)'}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    spellCheck="false"
                    autoComplete="off"
                />
                <div className="input-focus-ring"></div>
            </div>
            {error && <div className="error-message">Error: {error}</div>}
        </div>
    );
}
