import { motion } from "framer-motion";

const Marquee = ({ children, className = "", reverse = false, duration = 30 }) => {
    return (
        <div className={`flex overflow-hidden ${className}`}>
            <motion.div
                initial={{ x: reverse ? "-50%" : "0%" }}
                animate={{ x: reverse ? "0%" : "-50%" }}
                transition={{ duration, repeat: Infinity, ease: "linear" }}
                className="flex min-w-full shrink-0 items-center justify-around gap-8"
            >
                {children}
                {children}
            </motion.div>
        </div>
    );
};

export default Marquee;
