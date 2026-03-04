import React from 'react';
import './ReactionDetails.css';
import { classifyReactionType } from '../lib/reactionKnowledge';
import { findReactionInfo } from '../lib/reactionDatabase';
import { parseEquationString } from '../lib/chemistry';

export const ReactionDetails = ({ equation }) => {
    if (!equation) return null;

    const parsedEquation = parseEquationString(equation);
    if (!parsedEquation) return null;

    const reactionClass = classifyReactionType(parsedEquation);
    const dbInfo = findReactionInfo(parsedEquation);

    // We always show the classification at least.
    return (
        <div className="reaction-details">
            <h3 className="section-title">Reaction Analysis</h3>

            <div className="details-grid">
                <div className="detail-card">
                    <div className="detail-label">Reaction Type</div>
                    <div className="detail-value highlight">{reactionClass}</div>
                </div>

                {dbInfo && (
                    <>
                        <div className="detail-card">
                            <div className="detail-label">Common Name</div>
                            <div className="detail-value">{dbInfo.name}</div>
                        </div>

                        <div className="detail-card">
                            <div className="detail-label">Energy Change</div>
                            <div className="detail-value color-badge">{dbInfo.enthalpy}</div>
                        </div>

                        <div className="detail-card full-width">
                            <div className="detail-label">Catalysts / Requirements</div>
                            <div className="detail-value text-muted">{dbInfo.catalysts}</div>
                        </div>

                        <div className="detail-card full-width">
                            <div className="detail-label">Common Uses</div>
                            <div className="detail-value text-muted">{dbInfo.uses}</div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
