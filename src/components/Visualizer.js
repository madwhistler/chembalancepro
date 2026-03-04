import React, { useEffect, useState, useRef } from 'react';
import './Visualizer.css';
import { parseEquationString, parseFormula } from '../lib/chemistry.js';

const atomColors = {
    H: '#f8f9fa',
    O: '#ff4b2b',
    C: '#343a40',
    N: '#3a7bd5',
    Cl: '#00b09b',
    Na: '#9a56ff',
    S: '#f1c40f',
    Fe: '#e84118',
    K: '#8c7ae6',
    F: '#feca57',
    He: '#00a8ff',
    default: '#adb5bd'
};

const atomSizes = {
    H: 16,
    O: 22,
    C: 26,
    N: 24,
    default: 22
};

const moleculeModels = {
    'H2O': {
        name: 'Water',
        atoms: [
            { id: 'O1', element: 'O', ox: 0, oy: -12 },
            { id: 'H1', element: 'H', ox: -18, oy: 15 },
            { id: 'H2', element: 'H', ox: 18, oy: 15 }
        ],
        bonds: [
            { type: 'single', from: 'O1', to: 'H1' },
            { type: 'single', from: 'O1', to: 'H2' }
        ]
    },
    'O2': {
        name: 'Oxygen',
        atoms: [
            { id: 'O1', element: 'O', ox: -16, oy: 0 },
            { id: 'O2', element: 'O', ox: 16, oy: 0 }
        ],
        bonds: [
            { type: 'double', from: 'O1', to: 'O2' }
        ]
    },
    'H2': {
        name: 'Hydrogen',
        atoms: [
            { id: 'H1', element: 'H', ox: -14, oy: 0 },
            { id: 'H2', element: 'H', ox: 14, oy: 0 }
        ],
        bonds: [
            { type: 'single', from: 'H1', to: 'H2' }
        ]
    },
    'CO2': {
        name: 'Carbon Dioxide',
        atoms: [
            { id: 'C1', element: 'C', ox: 0, oy: 0 },
            { id: 'O1', element: 'O', ox: -30, oy: 0 },
            { id: 'O2', element: 'O', ox: 30, oy: 0 }
        ],
        bonds: [
            { type: 'double', from: 'C1', to: 'O1' },
            { type: 'double', from: 'C1', to: 'O2' }
        ]
    },
    'CH4': {
        name: 'Methane',
        atoms: [
            { id: 'C1', element: 'C', ox: 0, oy: 0 },
            { id: 'H1', element: 'H', ox: 0, oy: -24 },
            { id: 'H2', element: 'H', ox: 0, oy: 24 },
            { id: 'H3', element: 'H', ox: -24, oy: 0 },
            { id: 'H4', element: 'H', ox: 24, oy: 0 }
        ],
        bonds: [
            { type: 'single', from: 'C1', to: 'H1' },
            { type: 'single', from: 'C1', to: 'H2' },
            { type: 'single', from: 'C1', to: 'H3' },
            { type: 'single', from: 'C1', to: 'H4' }
        ]
    },
    'NH3': {
        name: 'Ammonia',
        atoms: [
            { id: 'N1', element: 'N', ox: 0, oy: -10 },
            { id: 'H1', element: 'H', ox: -20, oy: 15 },
            { id: 'H2', element: 'H', ox: 0, oy: 22 },
            { id: 'H3', element: 'H', ox: 20, oy: 15 }
        ],
        bonds: [
            { type: 'single', from: 'N1', to: 'H1' },
            { type: 'single', from: 'N1', to: 'H2' },
            { type: 'single', from: 'N1', to: 'H3' }
        ]
    },
    'N2': {
        name: 'Nitrogen',
        atoms: [
            { id: 'N1', element: 'N', ox: -16, oy: 0 },
            { id: 'N2', element: 'N', ox: 16, oy: 0 }
        ],
        bonds: [
            { type: 'triple', from: 'N1', to: 'N2' }
        ]
    },
    'C6H12O6': {
        name: 'Glucose',
        atoms: [
            // Pyranose Ring
            { id: 'O5', element: 'O', ox: 20, oy: -35 },
            { id: 'C1', element: 'C', ox: 40, oy: 0 },
            { id: 'C2', element: 'C', ox: 20, oy: 35 },
            { id: 'C3', element: 'C', ox: -20, oy: 35 },
            { id: 'C4', element: 'C', ox: -40, oy: 0 },
            { id: 'C5', element: 'C', ox: -20, oy: -35 },

            // C1 groups
            { id: 'H1c', element: 'H', ox: 60, oy: -15 },
            { id: 'O1', element: 'O', ox: 60, oy: 20 },
            { id: 'H1o', element: 'H', ox: 75, oy: 20 },

            // C2 groups
            { id: 'H2c', element: 'H', ox: 40, oy: 55 },
            { id: 'O2', element: 'O', ox: 0, oy: 60 },
            { id: 'H2o', element: 'H', ox: 0, oy: 80 },

            // C3 groups
            { id: 'H3c', element: 'H', ox: -20, oy: 60 },
            { id: 'O3', element: 'O', ox: -45, oy: 45 },
            { id: 'H3o', element: 'H', ox: -65, oy: 55 },

            // C4 groups
            { id: 'H4c', element: 'H', ox: -55, oy: 25 },
            { id: 'O4', element: 'O', ox: -65, oy: -20 },
            { id: 'H4o', element: 'H', ox: -85, oy: -20 },

            // C5 groups
            { id: 'H5c', element: 'H', ox: 0, oy: -50 },
            { id: 'C6', element: 'C', ox: -45, oy: -60 },

            // C6 groups
            { id: 'H6c1', element: 'H', ox: -65, oy: -45 },
            { id: 'H6c2', element: 'H', ox: -65, oy: -75 },
            { id: 'O6', element: 'O', ox: -30, oy: -85 },
            { id: 'H6o', element: 'H', ox: -30, oy: -105 }
        ],
        bonds: [
            // Ring bonds
            { type: 'single', from: 'O5', to: 'C1' },
            { type: 'single', from: 'C1', to: 'C2' },
            { type: 'single', from: 'C2', to: 'C3' },
            { type: 'single', from: 'C3', to: 'C4' },
            { type: 'single', from: 'C4', to: 'C5' },
            { type: 'single', from: 'C5', to: 'O5' },

            // Substituent bonds
            { type: 'single', from: 'C1', to: 'H1c' },
            { type: 'single', from: 'C1', to: 'O1' },
            { type: 'single', from: 'O1', to: 'H1o' },

            { type: 'single', from: 'C2', to: 'H2c' },
            { type: 'single', from: 'C2', to: 'O2' },
            { type: 'single', from: 'O2', to: 'H2o' },

            { type: 'single', from: 'C3', to: 'H3c' },
            { type: 'single', from: 'C3', to: 'O3' },
            { type: 'single', from: 'O3', to: 'H3o' },

            { type: 'single', from: 'C4', to: 'H4c' },
            { type: 'single', from: 'C4', to: 'O4' },
            { type: 'single', from: 'O4', to: 'H4o' },

            { type: 'single', from: 'C5', to: 'H5c' },
            { type: 'single', from: 'C5', to: 'C6' },

            { type: 'single', from: 'C6', to: 'H6c1' },
            { type: 'single', from: 'C6', to: 'H6c2' },
            { type: 'single', from: 'C6', to: 'O6' },
            { type: 'single', from: 'O6', to: 'H6o' }
        ]
    },
    'NaCl': {
        name: 'Sodium Chloride',
        atoms: [
            { id: 'Na1', element: 'Na', ox: -15, oy: 0 },
            { id: 'Cl1', element: 'Cl', ox: 15, oy: 0 }
        ],
        bonds: [
            { type: 'single', from: 'Na1', to: 'Cl1' }
        ]
    }
};

const elementsByAtomicNum = {
    1: 'H', 2: 'He', 3: 'Li', 4: 'Be', 5: 'B', 6: 'C', 7: 'N', 8: 'O', 9: 'F', 10: 'Ne',
    11: 'Na', 12: 'Mg', 13: 'Al', 14: 'Si', 15: 'P', 16: 'S', 17: 'Cl', 18: 'Ar', 19: 'K', 20: 'Ca',
    24: 'Cr', 25: 'Mn', 26: 'Fe', 27: 'Co', 28: 'Ni', 29: 'Cu', 30: 'Zn', 35: 'Br', 47: 'Ag', 53: 'I', 79: 'Au', 80: 'Hg', 82: 'Pb'
};

function toHillFormula(parsed) {
    let str = "";
    if (parsed["C"]) {
        str += "C" + (parsed["C"] > 1 ? parsed["C"] : "");
        if (parsed["H"]) {
            str += "H" + (parsed["H"] > 1 ? parsed["H"] : "");
        }
    }
    const elements = Object.keys(parsed)
        .filter(k => (parsed["C"] ? (k !== "C" && k !== "H") : true))
        .sort();

    for (let e of elements) {
        str += e + (parsed[e] > 1 ? parsed[e] : "");
    }
    return str;
}

function getModelFallback(formulaStr, parsed) {
    const atoms = [];
    const bonds = [];
    const elementArray = [];
    Object.entries(parsed).forEach(([element, amount]) => {
        for (let i = 0; i < amount; i++) elementArray.push(element);
    });

    if (elementArray.length > 2) {
        atoms.push({ id: 'A0', element: elementArray[0], ox: 0, oy: 0 });
        const numOuter = elementArray.length - 1;
        const radius = Math.max(30, numOuter * 10);
        for (let i = 1; i <= numOuter; i++) {
            const angle = (i * 2 * Math.PI) / numOuter;
            const ox = Math.cos(angle) * radius;
            const oy = Math.sin(angle) * radius;
            atoms.push({ id: `A${i}`, element: elementArray[i], ox, oy });
            bonds.push({ type: 'single', from: 'A0', to: `A${i}` });
        }
    } else {
        let x = - (elementArray.length * 20) / 2 + 10;
        for (let i = 0; i < elementArray.length; i++) {
            const id = `A${i}`;
            atoms.push({ id, element: elementArray[i], ox: x, oy: 0 });
            if (i > 0) {
                bonds.push({ type: 'single', from: `A${i - 1}`, to: id });
            }
            x += 30;
        }
    }
    return { name: formulaStr, atoms, bonds };
}

async function getModelAsync(rawFormulaStr) {
    const formulaStr = rawFormulaStr.replace(/^[0-9\s]+/, '');
    if (moleculeModels[formulaStr]) return JSON.parse(JSON.stringify(moleculeModels[formulaStr]));

    const parsed = parseFormula(formulaStr);
    const hillForm = toHillFormula(parsed);

    try {
        const res = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastformula/${hillForm}/record/JSON/?record_type=2d`);
        if (res.ok) {
            const data = await res.json();
            const comp = data.PC_Compounds?.[0];
            if (comp && comp.atoms && comp.coords && comp.coords[0].conformers[0]) {
                const atoms = [];
                const bonds = [];
                const xArr = comp.coords[0].conformers[0].x;
                const yArr = comp.coords[0].conformers[0].y;
                const elementArr = comp.atoms.element;
                let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

                for (let i = 0; i < elementArr.length; i++) {
                    const x = xArr[i];
                    const y = -yArr[i];
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }

                const centerX = (minX + maxX) / 2;
                const centerY = (minY + maxY) / 2;
                const scale = 25; // 25px per angstrom looks good visually

                for (let i = 0; i < elementArr.length; i++) {
                    const elNum = elementArr[i];
                    const elStr = elementsByAtomicNum[elNum] || 'X';
                    const x = xArr[i];
                    const y = -yArr[i];
                    atoms.push({
                        id: `A${i + 1}`,
                        element: elStr,
                        ox: (x - centerX) * scale,
                        oy: (y - centerY) * scale
                    });
                }

                if (comp.bonds) {
                    const { aid1, aid2, order } = comp.bonds;
                    for (let i = 0; i < aid1.length; i++) {
                        const o = order[i];
                        let btype = 'single';
                        if (o === 2) btype = 'double';
                        if (o === 3) btype = 'triple';
                        bonds.push({
                            type: btype,
                            from: `A${aid1[i]}`,
                            to: `A${aid2[i]}`
                        });
                    }
                }

                let name = formulaStr;
                if (comp.props) {
                    const nameProp = comp.props.find(p => p.urn && p.urn.label === 'IUPAC Name');
                    if (nameProp && nameProp.value && nameProp.value.sval) {
                        name = nameProp.value.sval;
                        // Truncate overly long IUPAC names for UX
                        if (name.length > 30) name = formulaStr;
                    }
                }

                return { name, atoms, bonds };
            }
        }
    } catch (e) {
        console.warn('PubChem fetch failed, falling back to star visualizer', e);
    }

    return getModelFallback(formulaStr, parsed);
}

function getModelBounds(model) {
    let minX = 0, maxX = 0, minY = 0, maxY = 0;
    model.atoms.forEach(a => {
        if (a.ox < minX) minX = a.ox;
        if (a.ox > maxX) maxX = a.ox;
        if (a.oy < minY) minY = a.oy;
        if (a.oy > maxY) maxY = a.oy;
    });
    // paddings for atom widths
    return {
        width: (maxX - minX) + 60,
        height: (maxY - minY) + 60
    };
}

function prepareBonds(baseMolecule, idx, cx, cy) {
    return baseMolecule.bonds.map((b, bIdx) => {
        const a1 = baseMolecule.atoms.find(a => a.id === b.from);
        const a2 = baseMolecule.atoms.find(a => a.id === b.to);
        const dx = a2.ox - a1.ox;
        const dy = a2.oy - a1.oy;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        const mx = (a1.ox + a2.ox) / 2;
        const my = (a1.oy + a2.oy) / 2;
        return {
            id: `bond-${idx}-${bIdx}`,
            cx, cy,
            mx, my,
            length, angle,
            type: b.type,
            molId: idx // tie bond to parent molecule coordinate
        };
    });
}

export function Visualizer({ equation, state, coeffs }) {
    const [atoms, setAtoms] = useState([]);
    const [reactantBonds, setReactantBonds] = useState([]);
    const [productBonds, setProductBonds] = useState([]);
    const [moleculeMeta, setMoleculeMeta] = useState([]); // Stores names and bounding locations
    const [phase, setPhase] = useState('reactants');

    // Playback state
    const [templates, setTemplates] = useState(null);
    const [step, setStep] = useState(0); // 0: Reactants, 1: Breaking, 2: Products
    const [userInteracted, setUserInteracted] = useState(false);

    const containerRef = useRef(null);

    // Custom drag state logic
    const [dragMolId, setDragMolId] = useState(null);
    const dragOffset = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (state !== 'balanced' || !equation) {
            setAtoms([]);
            setReactantBonds([]);
            setProductBonds([]);
            return;
        }

        const parsed = parseEquationString(equation);
        if (!parsed) return;

        let isStale = false;

        async function loadModelsAndRender() {
            const rAtoms = [];
            const rBonds = [];
            const pAtomsTemplate = [];
            const pBonds = [];
            const meta = [];

            // Distribute molecules carefully using 2D packing limits
            const generateSafePosition = (model, sideMeta, startPx, endPx, totalWidth, totalHeight) => {
                const bounds = getModelBounds(model);
                const wPct = (bounds.width / totalWidth) * 100;
                const hPct = (bounds.height / totalHeight) * 100;

                for (let attempt = 0; attempt < 50; attempt++) {
                    const cx = startPx + (Math.random() * (endPx - startPx));
                    const cy = 15 + Math.random() * 70; // 15% to 85% height

                    let collision = false;
                    for (const other of sideMeta) {
                        const dx = Math.abs(other.cx - cx);
                        const dy = Math.abs(other.cy - cy);
                        if (dx < (wPct / 2 + other.w / 2 + 2) && dy < (hPct / 2 + other.h / 2 + 2)) {
                            collision = true;
                            break;
                        }
                    }

                    if (!collision || attempt === 49) {
                        return { cx, cy, w: wPct, h: hPct };
                    }
                }
            };

            const rectWidth = containerRef.current?.getBoundingClientRect().width || 1000;
            const rectHeight = containerRef.current?.getBoundingClientRect().height || 400;

            const rSideMeta = [];
            for (let idx = 0; idx < parsed.reactants.length; idx++) {
                const mol = parsed.reactants[idx];
                const count = coeffs.reactants[idx];
                const model = await getModelAsync(mol);
                if (isStale) return;

                for (let i = 0; i < count; i++) {
                    const molId = `R-${idx}-${i}`;
                    const pos = generateSafePosition(model, rSideMeta, 5, 45, rectWidth, rectHeight);
                    rSideMeta.push(pos);
                    meta.push({ id: molId, name: model.name || mol, cx: pos.cx, cy: pos.cy, side: 'reactant' });

                    model.atoms.forEach(a => {
                        rAtoms.push({
                            globalId: `${molId}-${a.id}`,
                            element: a.element,
                            molId,
                            cx: pos.cx, cy: pos.cy,
                            ox: a.ox, oy: a.oy
                        });
                    });
                    rBonds.push(...prepareBonds(model, molId, pos.cx, pos.cy));
                }
            }

            const pSideMeta = [];
            for (let idx = 0; idx < parsed.products.length; idx++) {
                const mol = parsed.products[idx];
                const count = coeffs.products[idx];
                const model = await getModelAsync(mol);
                if (isStale) return;

                for (let i = 0; i < count; i++) {
                    const molId = `P-${idx}-${i}`;
                    const pos = generateSafePosition(model, pSideMeta, 55, 95, rectWidth, rectHeight);
                    pSideMeta.push(pos);
                    meta.push({ id: molId, name: model.name || mol, cx: pos.cx, cy: pos.cy, side: 'product' });

                    model.atoms.forEach(a => {
                        pAtomsTemplate.push({
                            globalId: `${molId}-${a.id}`,
                            element: a.element,
                            molId,
                            cx: pos.cx, cy: pos.cy,
                            ox: a.ox, oy: a.oy
                        });
                    });
                    pBonds.push(...prepareBonds(model, molId, pos.cx, pos.cy));
                }
            }

            // Build the deterministic scrambled atoms
            const hashVec = (id) => {
                let h = 0;
                for (let i = 0; i < id.length; i++) h = Math.imul(31, h) + id.charCodeAt(i) | 0;
                const rng1 = Math.abs(Math.sin(h)) * 10000 % 1;
                const rng2 = Math.abs(Math.cos(h)) * 10000 % 1;
                const rng3 = Math.abs(Math.tan(h)) * 10000 % 1;
                const rng4 = Math.abs(Math.sin(h + 1)) * 10000 % 1;
                return {
                    cx: 35 + rng1 * 30,
                    cy: 20 + rng2 * 60,
                    ox: (rng3 - 0.5) * 60,
                    oy: (rng4 - 0.5) * 60
                };
            };
            const sAtoms = rAtoms.map(a => {
                const s = hashVec(a.globalId);
                return { ...a, cx: s.cx, cy: s.cy, ox: s.ox, oy: s.oy };
            });

            // Build deterministic product atom mappings from reactant pools
            const pools = {};
            rAtoms.forEach(atom => {
                if (!pools[atom.element]) pools[atom.element] = [];
                pools[atom.element].push(atom);
            });
            const pAtomsMapped = pAtomsTemplate.map(pTemplate => {
                const oldAtom = pools[pTemplate.element]?.pop() || { globalId: pTemplate.globalId };
                return {
                    ...oldAtom, // retains visually tracked properties
                    molId: pTemplate.molId, // overwrites to new product parent
                    cx: pTemplate.cx, // explicitly jumps to new spatial coordinate
                    cy: pTemplate.cy,
                    ox: pTemplate.ox, // assumes product target's atomic geometry model
                    oy: pTemplate.oy
                };
            });

            setTemplates({ rAtoms, sAtoms, pAtomsTemplate: pAtomsMapped, rBonds, pBonds, meta });
            setPhase('reactants');
            setAtoms(rAtoms);
            setReactantBonds(rBonds);
            setProductBonds(pBonds);
            setMoleculeMeta(meta);
            setDragMolId(null);
            setStep(0);
            setUserInteracted(false);
        }

        loadModelsAndRender();

        return () => {
            isStale = true;
        };
    }, [equation, state, coeffs]);

    // Handle phase effects based on declarative step
    useEffect(() => {
        if (!templates) return;

        let timer1, timer2;
        if (step === 0) {
            setPhase('reactants');
            setAtoms(templates.rAtoms);
            setReactantBonds(templates.rBonds);
            setProductBonds(templates.pBonds);
            setMoleculeMeta(templates.meta);
            if (!userInteracted) timer1 = setTimeout(() => setStep(1), 2500);
        } else if (step === 1) {
            setPhase('breaking');
            setAtoms(templates.sAtoms);
            setReactantBonds(templates.rBonds);
            setProductBonds(templates.pBonds);
            setMoleculeMeta(templates.meta);
            if (!userInteracted) timer1 = setTimeout(() => setStep(2), 1500);
        } else if (step === 2) {
            setPhase('products-moving');
            setAtoms(templates.pAtomsTemplate);
            setReactantBonds(templates.rBonds);
            setProductBonds(templates.pBonds);
            setMoleculeMeta(templates.meta);
            timer2 = setTimeout(() => {
                setPhase(prev => prev === 'products-moving' ? 'products' : prev);
            }, 1200); // Wait for CSS transition to settle before showing bonds
        }

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [step, templates, userInteracted]);

    const handlePointerDown = (e, molId) => {
        // Only permit drag when molecules are formed
        if (phase !== 'products' && phase !== 'reactants') return;

        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const percentX = (mouseX / rect.width) * 100;
        const percentY = (mouseY / rect.height) * 100;

        // Find center of group
        const targetAtom = atoms.find(a => a.molId === molId);
        if (targetAtom) {
            dragOffset.current = {
                x: targetAtom.cx - percentX,
                y: targetAtom.cy - percentY
            };
            setDragMolId(molId);
        }
    };

    const handlePointerMove = (e) => {
        if (!dragMolId) return;

        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const percentX = Math.max(5, Math.min(95, (mouseX / rect.width) * 100 + dragOffset.current.x));
        const percentY = Math.max(10, Math.min(90, (mouseY / rect.height) * 100 + dragOffset.current.y));

        setAtoms(prev => prev.map(a => {
            if (a.molId === dragMolId) {
                return { ...a, cx: percentX, cy: percentY };
            }
            return a;
        }));

        // Sync meta coordinates for Tooltip hovering
        setMoleculeMeta(prev => prev.map(m => {
            if (m.id === dragMolId) {
                return { ...m, cx: percentX, cy: percentY };
            }
            return m;
        }));

        // In products phase, move product bonds
        if (phase === 'products') {
            setProductBonds(prev => prev.map(b => {
                if (b.molId === dragMolId) {
                    return { ...b, cx: percentX, cy: percentY };
                }
                return b;
            }));
        }
        // In reactants phase, move reactant bonds
        else if (phase === 'reactants') {
            setReactantBonds(prev => prev.map(b => {
                if (b.molId === dragMolId) {
                    return { ...b, cx: percentX, cy: percentY };
                }
                return b;
            }));
        }
    };

    const handlePointerUp = () => {
        setDragMolId(null);
    };

    if (state !== 'balanced') {
        return (
            <div className="visualizer-container empty">
                {state === 'impossible' ? (
                    <div className="status-text error">This reaction is not balanceable.</div>
                ) : (
                    <div className="status-text">Enter a valid equation to visualize.</div>
                )}
            </div>
        );
    }

    const handleNext = () => { setUserInteracted(true); setStep(s => Math.min(2, s + 1)); };
    const handlePrev = () => { setUserInteracted(true); setStep(s => Math.max(0, s - 1)); };

    return (
        <div
            className="visualizer-container"
            ref={containerRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            <div className="scene-bg"></div>

            <div className={`energy-field ${phase === 'breaking' || phase === 'products-moving' ? 'active' : ''}`}></div>

            {/* Playback Controls */}
            {templates && (
                <div className="playback-controls">
                    <button onClick={handlePrev} disabled={step === 0} className="play-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <div className="step-indicator">
                        <div className={`step-dot ${step >= 0 ? 'active' : ''}`} />
                        <div className={`step-line ${step >= 1 ? 'active' : ''}`} />
                        <div className={`step-dot ${step >= 1 ? 'active' : ''}`} />
                        <div className={`step-line ${step >= 2 ? 'active' : ''}`} />
                        <div className={`step-dot ${step >= 2 ? 'active' : ''}`} />
                    </div>
                    <button onClick={handleNext} disabled={step === 2} className="play-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                </div>
            )}

            {/* Molecule Tooltips layer */}
            {(phase === 'reactants' || phase === 'products') && moleculeMeta.map(m => {
                if (phase === 'reactants' && m.side === 'product') return null;
                if (phase === 'products' && m.side === 'reactant') return null;

                const isDragged = dragMolId === m.id;
                return (
                    <div
                        key={`tip-${m.id}`}
                        className={`molecule-tooltip-anchor ${isDragged ? 'dragging' : ''}`}
                        style={{
                            left: `${m.cx}%`,
                            top: `${m.cy}%`,
                            pointerEvents: dragMolId ? 'none' : 'auto',
                            cursor: isDragged ? 'grabbing' : 'grab'
                        }}
                        onPointerDown={(e) => handlePointerDown(e, m.id)}
                    >
                        <div className="tooltip" style={{ opacity: dragMolId ? 0 : '', visibility: dragMolId ? 'hidden' : '' }}>{m.name}</div>
                    </div>
                );
            })}

            <div className="bonds-layer">
                {reactantBonds.map(bond => (
                    <div key={bond.id} className={`bond bond-${bond.type}`} style={{
                        left: `${bond.cx}%`, top: `${bond.cy}%`, width: `${bond.length}px`,
                        transform: `translate(calc(-50% + ${bond.mx}px), calc(-50% + ${bond.my}px)) rotate(${bond.angle}deg)`,
                        opacity: phase === 'reactants' ? 1 : 0,
                        transition: dragMolId === bond.molId ? 'none' : 'opacity 0.4s ease, left 1.2s cubic-bezier(0.42, 0, 0.17, 1), top 1.2s cubic-bezier(0.42, 0, 0.17, 1)'
                    }} />
                ))}
                {productBonds.map(bond => (
                    <div key={bond.id} className={`bond bond-${bond.type}`} style={{
                        left: `${bond.cx}%`, top: `${bond.cy}%`, width: `${bond.length}px`,
                        transform: `translate(calc(-50% + ${bond.mx}px), calc(-50% + ${bond.my}px)) rotate(${bond.angle}deg)`,
                        opacity: phase === 'products' ? 1 : 0,
                        transition: dragMolId === bond.molId ? 'none' : 'opacity 0.4s ease, left 1.2s cubic-bezier(0.42, 0, 0.17, 1), top 1.2s cubic-bezier(0.42, 0, 0.17, 1)'
                    }} />
                ))}
            </div>

            <div className="atoms-layer">
                {atoms.map(atom => {
                    const displaySize = atomSizes[atom.element] || atomSizes.default;
                    const displayColor = atomColors[atom.element] || atomColors.default;
                    const isDraggable = (phase === 'products' || phase === 'reactants');

                    return (
                        <div
                            key={atom.globalId}
                            className={`atom-node ${(isDraggable && dragMolId !== atom.molId) ? 'interactive' : ''} ${dragMolId === atom.molId ? 'dragging' : ''}`}
                            onPointerDown={(e) => isDraggable && handlePointerDown(e, atom.molId)}
                            style={{
                                width: `${displaySize}px`,
                                height: `${displaySize}px`,
                                backgroundColor: displayColor,
                                left: `calc(${atom.cx}% + ${atom.ox}px)`,
                                top: `calc(${atom.cy}% + ${atom.oy}px)`,
                                boxShadow: `0 0 12px ${displayColor}, inset -2px -2px 6px rgba(0,0,0,0.5)`,
                                transition: dragMolId === atom.molId ? 'none' : 'all 1.2s cubic-bezier(0.42, 0, 0.17, 1)'
                            }}
                        >
                            <span className="atom-label">{atom.element}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
