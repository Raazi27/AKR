import { useRef, useState } from "react";
import { motion } from "framer-motion";

const SpotlightCard = ({ children, className = "", onClick, ...props }) => {
    const divRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        if (props.onMouseMove) props.onMouseMove(e);
    };

    const handleMouseEnter = (e) => {
        setOpacity(1);
        if (props.onMouseEnter) props.onMouseEnter(e);
    };

    const handleMouseLeave = (e) => {
        setOpacity(0);
        if (props.onMouseLeave) props.onMouseLeave(e);
    };

    return (
        <motion.div
            ref={divRef}
            onClick={onClick}
            className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg ${className}`}
            whileHover={{ y: -5, scale: 1.01 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...props}
        >
            <div
                className="pointer-events-none absolute -inset-px transition duration-300 z-0"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(99, 102, 241, 0.15), transparent 40%)`,
                }}
            />
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
};

export default SpotlightCard;
