"use client";

import Image from "next/image";

interface Props {
    progress: number; // 0 (Full) -> 1 (New)
    className?: string;
}

export function MoonPhase({ progress, className = "" }: Props) {
    // Ensure progress is clamped 0-1
    const p = Math.max(0, Math.min(1, progress));

    // We want to simulate Waning phase (Full -> Last Quarter -> New)
    // Shadow comes from the Right.

    // Visualizing the "Lit" part.
    // Full (0): All lit.
    // Half (0.5): Left half lit.
    // New (1): None lit.

    // We can use an SVG path for the shadow or the lit part.
    // Let's draw the SHADOW.
    // The shadow starts as a sliver on the right.
    // At 0.5, it covers the right hemisphere.
    // At 1.0, it covers the whole circle.

    // Coordinate system: 0,0 to 100,100. Center 50,50. Radius 50.
    // We need a path that describes the shadow.

    // Easier approach: Draw the LIT part using an elliptic arc.
    // The outer boundary is always the left semicircle (for waning).
    // The inner boundary is an ellipse arc that moves.

    // Wait, for waning:
    // 0.0 -> 0.5: The terminator is an ellipse bowing out to the right.
    // 0.5 -> 1.0: The terminator is an ellipse bowing in to the left.

    // Let's construct a path for the LIT area (the part of the image we want to SHOW).
    // It always includes the left edge arc? No.
    // Full Moon (0): Cycle.
    // Waning Gibbous (0-0.5): Left semicircle + Right Semi-ellipse.
    // Last Quarter (0.5): Left semicircle.
    // Waning Crescent (0.5-1.0): Left Semi-ellipse.
    // New Moon (1): Nothing.

    // Let's calculate the "x" radius of the terminator ellipse.
    // It goes from 50 (Right edge) to -50 (Left edge).
    // Normalized:
    // progress 0 => x = 1 (Relative radius)
    // progress 0.5 => x = 0
    // progress 1 => x = -1

    // However, combining this with the static semicircle is tricky in one path d.
    // Actually, we can just use a `mask`.

    // Mask approach:
    // White = Visible (Lit), Black = Hidden (Shadow).
    // We draw the "Lit" shape in white on a black background.

    const radius = 50;
    const center = 50;

    // Calculate the control point for the quadratic bezier or arc for the terminator.
    // Simpler: Use an Elliptical Arc command (A).
    // A rx ry x-axis-rotation large-arc-flag sweep-flag x y

    // Terminatior X position relative to center.
    // P=0 -> X=50
    // P=0.5 -> X=0
    // P=1 -> X=-50
    // But strictly speaking it's cos(progress * PI)? Or just linear?
    // Linear is fine for a timer.
    // terminatorX = 50 * (1 - 2 * p)  => ranges 50 to -50.

    const terminatorX = center + 50 * Math.cos(p * Math.PI); // Cosine gives a more natural "rotating sphere" look? 
    // Actually, linear 1->-1 is the projection of a rotating terminator. 
    // Let's use linear mapping for "time": (1 - 2*p)
    // But `cos` is mathematically correct for the projection of the terminator line angle.
    // Let's stick to linear for the timer progress to be consistent? 
    // No, visual phase Area does not scale linearly with terminator position. 
    // But let's keep it simple: Linear movement of the terminator line.
    const tX = 50 * (1 - 2 * p); // 50 to -50

    // Path logic seems hard to perfectly create a "Waning" mask in one go.
    // Waning:
    // Always visible: Left Semicircle? No, only until 0.5.
    // After 0.5, the left semicircle starts getting eaten.

    // Update logic:
    // Zone 1 (0 to 0.5): Left half is FULL (Rect 0,0,50,100). Right half is PARTIAL (Ellipse from 50,0 to 50,100 passing through 50+tX, 50).
    // Zone 2 (0.5 to 1): Left half is PARTIAL (Ellipse from 50,0 to 50,100 passing through 50+tX, 50). Right half is EMPTY.

    // Let's build the SVG Mask content.
    let d = "";
    if (p < 0.5) {
        // 0 <= p < 0.5 (Gibbous)
        // Visible: Left Semicircle + Right Semi-Ellipse
        // Left Semicircle: Move 50,0 -> Arc to 50,100 (radius 50)
        // Right Semi-Ellipse: Arc back to 50,0. Radius X = abs(tX), Radius Y = 50.
        const rx = Math.abs(tX);
        d = `M 50,0 A 50,50 0 0 0 50,100 A ${rx},50 0 0 0 50,0 Z`;
    } else {
        // 0.5 <= p <= 1 (Crescent)
        // Visible: Left Semi-Ellipse
        // Move 50,0 -> Arc to 50,100 (Radius X = abs(tX))
        // Close back to 50,0? No, that would be the "hole".
        // We want the sliver on the left.
        // So path is: 50,0 -> Arc(Outer left edge) -> 50,100 -> Arc(Inner terminator) -> 50,0
        const rx = Math.abs(tX);
        d = `M 50,0 A 50,50 0 0 0 50,100 A ${rx},50 0 0 1 50,0 Z`;
        // Note sweep flag change for the inner arc to curve "inwards"
    }

    return (
        <div className={`relative ${className} select-none`}>
            {/* Background: The Moon Image */}
            {/* We mask the image itself or overlay a shadow? */}
            {/* Masking the image allows the background (black) to show through, which is "shadow". */}

            <svg width="0" height="0" className="absolute">
                <defs>
                    <mask id="moon-mask" maskContentUnits="objectBoundingBox">
                        {/* We need normalized coordinates 0-1 for objectBoundingBox */}
                        {/* REMOVED black rect to support Alpha masking (Safari default). Transparent = Hidden, White = Visible. */}

                        {/* Let's try to convert the path to 0-1 coords. center 0.5, radius 0.5 */}
                        {(() => {
                            const cx = 0.5;
                            const cy = 0.5;
                            const r = 0.5;
                            const tx = 0.5 * (1 - 2 * p); // 0.5 to -0.5
                            const abtx = Math.abs(tx);

                            if (p < 0.5) {
                                // Gibbous
                                // M 0.5,0 A 0.5,0.5 0 0 0 0.5,1 A abtx,0.5 0 0 0 0.5,0 Z
                                return <path d={`M 0.5,0 A 0.5,0.5 0 0 0 0.5,1 A ${abtx},0.5 0 0 0 0.5,0 Z`} fill="white" />;
                            } else {
                                // Crescent
                                // M 0.5,0 A 0.5,0.5 0 0 0 0.5,1 A abtx,0.5 0 0 1 0.5,0 Z
                                return <path d={`M 0.5,0 A 0.5,0.5 0 0 0 0.5,1 A ${abtx},0.5 0 0 1 0.5,0 Z`} fill="white" />;
                            }
                        })()}
                    </mask>
                </defs>
            </svg>

            <div className="relative inline-block">
                <Image
                    src="/full_moon.png"
                    alt="Moon Phase"
                    width={320}
                    height={320}
                    className="object-contain"
                    style={{
                        maskImage: "url(#moon-mask)",
                        WebkitMaskImage: "url(#moon-mask)",
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                        // Removed maskMode: "luminance" to fallback to Alpha (works on Safari) 
                    }}
                />
                <div className="absolute inset-0 rounded-full border border-zinc-800/30 pointer-events-none" />
            </div>
        </div>
    );
}
