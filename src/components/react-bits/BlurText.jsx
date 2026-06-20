import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const BlurText = ({ text, className = "", delay = 50, animateBy = 'words', direction = 'top', threshold = 0.1, rootMargin = '0px', animationFrom, animationTo, onAnimationComplete }) => {
    const elements = animateBy === 'words' ? text.split(' ') : text.split('');
    const [inView, setInView] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.unobserve(ref.current);
                }
            },
            { threshold, rootMargin }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [threshold, rootMargin]);

    const defaultFrom = direction === 'top'
        ? { filter: 'blur(10px)', opacity: 0, transform: 'translate3d(0,-50px,0)' }
        : { filter: 'blur(10px)', opacity: 0, transform: 'translate3d(0,50px,0)' };

    const defaultTo = [
        {
            filter: 'blur(5px)',
            opacity: 0.5,
            transform: direction === 'top' ? 'translate3d(0,5px,0)' : 'translate3d(0,-5px,0)',
        },
        { filter: 'blur(0px)', opacity: 1, transform: 'translate3d(0,0,0)' },
    ];

    return (
        <p ref={ref} className={`flex flex-wrap ${className}`}>
            {elements.map((word, index) => (
                <motion.span
                    key={index}
                    initial={animationFrom || defaultFrom}
                    animate={inView ? (animationTo || defaultTo) : (animationFrom || defaultFrom)}
                    transition={{
                        duration: 1,
                        delay: index * (delay / 1000),
                        ease: [0.25, 1, 0.5, 1],
                    }}
                    className="inline-block mr-2"
                    onAnimationComplete={onAnimationComplete}
                >
                    {word}&nbsp;
                </motion.span>
            ))}
        </p>
    );
};

export default BlurText;
