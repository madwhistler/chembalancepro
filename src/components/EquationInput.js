import React, { useState, useRef, useCallback } from 'react';
import { ChemKeyboard } from './ChemKeyboard';
import './EquationInput.css';

const isMobile = () =>
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

export function EquationInput({ value, onChange, placeholder, error }) {
    const [isFocused, setIsFocused] = useState(false);
    const [showKeyboard, setShowKeyboard] = useState(false);
    const inputRef = useRef(null);
    const mobile = isMobile();

    const handleKey = useCallback((k) => {
        const input = inputRef.current;
        if (!input) return;

        const start = input.selectionStart ?? value.length;
        const end = input.selectionEnd ?? value.length;

        let newVal, newCursor;
        if (k === 'BACKSPACE') {
            if (start !== end) {
                newVal = value.slice(0, start) + value.slice(end);
                newCursor = start;
            } else if (start > 0) {
                newVal = value.slice(0, start - 1) + value.slice(start);
                newCursor = start - 1;
            } else {
                return;
            }
        } else {
            newVal = value.slice(0, start) + k + value.slice(end);
            newCursor = start + k.length;
        }

        onChange(newVal);
        requestAnimationFrame(() => {
            input.focus();
            input.setSelectionRange(newCursor, newCursor);
        });
    }, [value, onChange]);

    return (
        <>
            <div className={`input-container ${isFocused ? 'focused' : ''} ${error ? 'error' : ''}`}>
                <div className="input-wrapper">
                    <input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder || 'Enter equation (e.g. H2 + O2 -> H2O)'}
                        onFocus={() => { setIsFocused(true); if (mobile) setShowKeyboard(true); }}
                        onBlur={() => { setIsFocused(false); }}
                        spellCheck="false"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="none"
                        inputMode={mobile ? 'none' : 'text'}
                    />
                    <div className="input-focus-ring"></div>
                </div>
                {error && <div className="error-message">Error: {error}</div>}
            </div>

            {mobile && showKeyboard && (
                <ChemKeyboard onKey={handleKey} onDismiss={() => setShowKeyboard(false)} />
            )}
        </>
    );
}
