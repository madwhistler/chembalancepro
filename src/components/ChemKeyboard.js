import React, { useState } from 'react';
import './ChemKeyboard.css';

const UPPER = 'ABCDEFGHIKLMNOPRSTUVWXYZ'.split('');
const LOWER = 'abcdefghiklmnoprstuvwxyz'.split('');
const DIGITS = ['1','2','3','4','5','6','7','8','9','0'];

export function ChemKeyboard({ onKey, onDismiss, suppressBlurRef, lastCharWasUpper }) {
    const [upper, setUpper] = useState(true);

    const press = (fn) => (e) => {
        e.preventDefault();
        if (suppressBlurRef) suppressBlurRef.current = true;
        fn();
        setTimeout(() => { if (suppressBlurRef) suppressBlurRef.current = false; }, 50);
    };

    const handleLetter = (l) => {
        onKey(l);
        // After uppercase: shift to lowercase (ready for 2nd char of element like Cl, Na)
        // After lowercase: shift back to uppercase (element 2nd char done, next will be new element)
        setUpper(l === l.toLowerCase());
    };

    const letters = upper ? UPPER : LOWER;

    const keyWithReset = (label, value, cls = '') => (
        <button
            key={label}
            className={`ck-key ${cls}`}
            onPointerDown={press(() => { onKey(value ?? label); setUpper(true); })}
        >
            {label}
        </button>
    );

    return (
        <div className="chem-keyboard">
            <div className="ck-row">
                {letters.slice(0, 8).map(l => (
                    <button key={l} className="ck-key" onPointerDown={press(() => handleLetter(l))}>{l}</button>
                ))}
            </div>
            <div className="ck-row">
                {letters.slice(8, 16).map(l => (
                    <button key={l} className="ck-key" onPointerDown={press(() => handleLetter(l))}>{l}</button>
                ))}
            </div>
            <div className="ck-row">
                {letters.slice(16).map(l => (
                    <button key={l} className="ck-key" onPointerDown={press(() => handleLetter(l))}>{l}</button>
                ))}
                <button
                    className={`ck-key ck-shift ${upper ? 'ck-shift-active' : ''}`}
                    onPointerDown={press(() => setUpper(u => !u))}
                >
                    {upper ? 'ABC' : 'abc'}
                </button>
            </div>
            <div className="ck-row">
                {DIGITS.map(d => keyWithReset(d, d, 'ck-digit'))}
                {keyWithReset('(', '(', 'ck-special')}
                {keyWithReset(')', ')', 'ck-special')}
            </div>
            <div className="ck-row ck-row-action">
                {keyWithReset('+', '+', 'ck-action')}
                {keyWithReset('→', '->', 'ck-action ck-arrow')}
                {keyWithReset('space', ' ', 'ck-action ck-space')}
                {keyWithReset('⌫', 'BACKSPACE', 'ck-action ck-back')}
                <button
                    className="ck-key ck-action ck-done"
                    onPointerDown={press(() => onDismiss?.())}
                >
                    Done
                </button>
            </div>
        </div>
    );
}
