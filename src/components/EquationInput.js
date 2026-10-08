import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChemKeyboard } from './ChemKeyboard';
import './EquationInput.css';

const mobile =
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

export function EquationInput({ value, onChange, onCommit, placeholder, error }) {
    const [isFocused, setIsFocused] = useState(false);
    const [showKeyboard, setShowKeyboard] = useState(false);
    const inputRef = useRef(null);
    // Track whether a keyboard button press is in progress so we can suppress blur
    const suppressBlur = useRef(false);
    // Own cursor position — iOS with inputMode="none" reports selectionStart=0 unreliably
    const cursorPos = useRef(0);

    // Keep cursorPos in sync when value changes externally (e.g. cleared from outside)
    useEffect(() => {
        cursorPos.current = Math.min(cursorPos.current, value.length);
    }, [value]);

    const handleKey = useCallback((k) => {
        const input = inputRef.current;
        if (!input) return;

        // Prefer native selection when it looks valid; fall back to our tracked position
        const nativeStart = input.selectionStart;
        const nativeEnd = input.selectionEnd;
        const hasNative = nativeStart !== null && (nativeStart !== 0 || nativeEnd !== 0 || value.length === 0);
        const start = hasNative ? nativeStart : cursorPos.current;
        const end   = hasNative ? nativeEnd   : cursorPos.current;

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

        cursorPos.current = newCursor;
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
                        onKeyDown={(e) => { if (e.key === 'Enter') onCommit?.(); }}
                        onFocus={() => {
                            setIsFocused(true);
                            if (mobile) setShowKeyboard(true);
                        }}
                        onBlur={() => {
                            if (suppressBlur.current) return;
                            setIsFocused(false);
                        }}
                        onSelect={(e) => {
                            cursorPos.current = e.target.selectionStart ?? value.length;
                        }}
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
                <ChemKeyboard
                    onKey={handleKey}
                    onDismiss={() => { setShowKeyboard(false); setIsFocused(false); onCommit?.(); }}
                    suppressBlurRef={suppressBlur}
                />
            )}
        </>
    );
}
