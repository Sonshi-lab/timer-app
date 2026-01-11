"use client";

import Image from "next/image";

interface Props {
    progress: number; // 0 (Full) -> 1 (New)
    className?: string;
}

export function MoonPhase({ progress, className = "" }: Props) {
    // SVG Overlay approach:
    // Instead of masking the LIT part, we draw the SHADOW part on top.
    // Shadow is black.

    // Path logic for Waning Phase (Full -> New):
    // Shadow starts 0 size at Right edge (p=0).
    // Grows to cover Right Half (p=0.5).
    // Grows to cover Left Half too (p=1).

    // Shadow Shape:
    // 1. Arc for the Right Semicircle (Outer Edge): Fixed.
    //    Move Top(50,0) -> Arc to Bottom(50,100).
    // 2. Terminator Curve: Variable.
    //    Arc back from Bottom(50,100) to Top(50,0).

    // Terminator Logic:
    // X position `tx` moves from 50 (Right) -> 0 (Center) -> -50 (Left).
    // Bulge direction (Sweep) flips at p=0.5.

    const radius = 50;
    const center = 50;

    // tx: 50 -> -50
    const tx = 50 * (1 - 2 * progress);
    const rx = Math.abs(tx);

    // Calculate path d
    // M 50,0 
    // A 50,50 0 0 1 50,100  (Right Semicircle, Clockwise)
    // A rx,50 0 0 SWEEP 50,0

    // Sweep:
    // We go Bottom -> Top.
    // Standard (Sweep 1) bulges Left (covering center).
    // Inverse (Sweep 0) bulges Right (hugging edge).

    // If progress < 0.5 (Gibbous, e.g. 0.1): Shadow is small slice on right. We need bulge Right. => Sweep 0.
    // If progress > 0.5 (Crescent, e.g. 0.9): Shadow is large (covers center). We need bulge Left. => Sweep 1.

    const sweep = progress < 0.5 ? 0 : 1;

    const d = `
        M 50,0 
        A 50,50 0 0 1 50,100 
        A ${rx},50 0 0 ${sweep} 50,0 
        Z
    `;

    return (
        <div className={`relative ${className} select-none`}>
            {/* The Full Moon Image (Always visible background) */}
            <div className="relative inline-block w-[320px] h-[320px]">
                {/* Standard img tag for maximum compatibility */}
                <img
                    src="/full_moon.png"
                    alt="Moon Phase"
                    width={320}
                    height={320}
                    className="object-contain w-full h-full"
                />

                {/* Shadow Overlay */}
                {/* No mix-blend-mode, just semi-transparent black for bulletproof rendering */}
                <svg
                    viewBox="0 0 100 100"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ zIndex: 10 }}
                >
                    <path d={d} fill="rgba(0,0,0,0.85)" />
                </svg>

                {/* Border Overlay */}
                <div className="absolute inset-0 rounded-full border border-zinc-800/30 pointer-events-none" style={{ zIndex: 20 }} />
            </div>
        </div>
    );
}
