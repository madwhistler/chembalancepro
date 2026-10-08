import React, { useState } from 'react';
import './ChemKeyboard.css';

const UPPER = 'ABCDEFGHIKLMNOPRSTUVWXYZ'.split('');
const LOWER = 'abcdefghiklmnoprstuvwxyz'.split('');
const DIGITS = ['1','2','3','4','5','6','7','8','9','0'];

export function ChemKeyboard({ onKey, onDismiss }) {
    const [upper, setUpper] = useState(true);
    const letters = upper ? UPPER : LOWER;

    const key = (label, value, cls = '') => (
        <button
            key={label}
            className={`ck-key ${cls}`}
            onPointerDown={(e) => { e.preventDefault(); onKey(value ?? label); }}
        >
            {label}
        </button>
    );

    return (
        <div className="chem-keyboard">
            <div className="ck-row">
                {letters.slice(0, 8).map(l => key(l))}
            </div>
            <div className="ck-row">
                {letters.slice(8, 16).map(l => key(l))}
            </div>
            <div className="ck-row">
                {letters.slice(16).map(l => key(l))}
                <button
                    className={`ck-key ck-shift ${upper ? 'ck-shift-active' : ''}`}
                    onPointerDown={(e) => { e.preventDefault(); setUpper(u => !u); }}
                >
                    {upper ? '⇧' : '⇩'}
                </button>
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
                    onPointerDown={(e) => { e.preventDefault(); onDismiss?.(); }}
                >
                    Done
                </button>
            </div>
        </div>
    );
}
