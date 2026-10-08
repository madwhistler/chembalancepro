import React from 'react';
import './ChemKeyboard.css';

const LETTERS = 'ABCDEFGHIKLMNOPRSTUVWXYZ'.split('');
const DIGITS = ['1','2','3','4','5','6','7','8','9','0'];

export function ChemKeyboard({ onKey, onDismiss, suppressBlurRef }) {
    const press = (fn) => (e) => {
        e.preventDefault();
        if (suppressBlurRef) suppressBlurRef.current = true;
        fn();
        // Clear the flag after the blur event window has passed
        setTimeout(() => { if (suppressBlurRef) suppressBlurRef.current = false; }, 50);
    };

    const key = (label, value, cls = '') => (
        <button
            key={label}
            className={`ck-key ${cls}`}
            onPointerDown={press(() => onKey(value ?? label))}
        >
            {label}
        </button>
    );

    return (
        <div className="chem-keyboard">
            <div className="ck-row">
                {LETTERS.slice(0, 8).map(l => key(l))}
            </div>
            <div className="ck-row">
                {LETTERS.slice(8, 16).map(l => key(l))}
            </div>
            <div className="ck-row">
                {LETTERS.slice(16).map(l => key(l))}
            </div>
            <div className="ck-row">
                {DIGITS.map(d => key(d, d, 'ck-digit'))}
                {key('(', '(', 'ck-special')}
                {key(')', ')', 'ck-special')}
            </div>
            <div className="ck-row ck-row-action">
                {key('+', '+', 'ck-action')}
                {key('→', '->', 'ck-action ck-arrow')}
                {key('space', ' ', 'ck-action ck-space')}
                {key('⌫', 'BACKSPACE', 'ck-action ck-back')}
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
