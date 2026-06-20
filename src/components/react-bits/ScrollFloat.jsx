import { useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollFloat = ({
    children,
    animationDuration = 1,
    ease = 'back.inOut(2)',
    scrollStart = 'center bottom+=50%',
    scrollEnd = 'bottom bottom-=40%',
    stagger = 0.03,
    containerClassName = '',
    textClassName = '',
    animationY = 20
}) => {
    const el = useRef();

    const splitText = useMemo(() => {
        const text = typeof children === 'string' ? children : '';
        return text.split('').map((char, index) => ({ char, index }));
    }, [children]);

    useEffect(() => {
        const charElements = el.current.querySelectorAll('.char');

        gsap.fromTo(
            charElements,
            {
                willChange: 'transform, opacity',
                transformOrigin: '50% 50%',
                y: animationY,
                scale: 0.8,
                opacity: 0
            },
            {
                ease: ease,
                duration: animationDuration,
                stagger: stagger,
                y: 0,
                scale: 1,
                opacity: 1,
                scrollTrigger: {
                    trigger: el.current,
                    start: scrollStart,
                    end: scrollEnd,
                    scrub: false,
                    toggleActions: 'play none none reverse'
                }
            }
        );
    }, [ease, animationDuration, stagger, scrollStart, scrollEnd, animationY]);

    return (
        <h2 ref={el} className={`overflow-hidden ${containerClassName}`}>
            <span className="sr-only">{children}</span>
            <span className={`${textClassName} flex flex-wrap`}>
                {splitText.map(({ char, index }) => (
                    <span key={index} className="char inline-block whitespace-pre">
                        {char}
                    </span>
                ))}
            </span>
        </h2>
    );
};

export default ScrollFloat;
