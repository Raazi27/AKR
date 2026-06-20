import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

const PillNav = ({
    logo,
    logoAlt,
    items = [],
    activeHref = '/',
    className = '',
    ease = 'power2.easeOut',
    baseColor = '#000000',
    pillColor = '#ffffff',
    hoveredPillTextColor = '#ffffff',
    pillTextColor = '#000000',
    theme = 'light',
    initialLoadAnimation = false,
    rightContent = null
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const navRef = useRef(null);
    const pillRef = useRef(null);
    const itemsRef = useRef([]);

    const effectiveBaseColor = baseColor || (theme === 'dark' ? '#ffffff' : '#000000');
    const effectivePillColor = pillColor || (theme === 'dark' ? '#ffffff' : '#000000');
    const effectiveHoverText = hoveredPillTextColor || (theme === 'dark' ? '#000000' : '#ffffff');

    useEffect(() => {
        const index = items.findIndex(item => item.href === activeHref);
        if (index !== -1) setActiveIndex(index);
    }, [activeHref, items]);

    useLayoutEffect(() => {
        const currentItem = itemsRef.current[activeIndex];
        if (currentItem && pillRef.current) {
            gsap.set(pillRef.current, {
                width: currentItem.offsetWidth,
                x: currentItem.offsetLeft,
                opacity: 1
            });
        }
    }, [activeIndex, items, ease]);

    const handleMouseEnter = (index, e) => {
        const target = e.currentTarget;
        gsap.to(pillRef.current, {
            width: target.offsetWidth,
            x: target.offsetLeft,
            opacity: 1,
            duration: 0.4,
            ease: ease
        });

        gsap.to(target, { color: effectiveHoverText, duration: 0.2 });

        itemsRef.current.forEach((el, i) => {
            if (i !== index) gsap.to(el, { color: effectiveBaseColor, duration: 0.2 });
        });
    };

    const handleMouseLeave = () => {
        const currentItem = itemsRef.current[activeIndex];
        if (currentItem) {
            gsap.to(pillRef.current, {
                width: currentItem.offsetWidth,
                x: currentItem.offsetLeft,
                opacity: 1,
                duration: 0.4,
                ease: ease
            });

            itemsRef.current.forEach((el, i) => {
                gsap.to(el, {
                    color: i === activeIndex ? effectiveHoverText : effectiveBaseColor,
                    duration: 0.2
                });
            });
        } else {
            gsap.to(pillRef.current, { opacity: 0, duration: 0.4 });
            itemsRef.current.forEach((el) => {
                gsap.to(el, { color: effectiveBaseColor, duration: 0.2 });
            });
        }
    };

    const handleClick = (e, item, index) => {
        if (item.href.startsWith('#')) {
            e.preventDefault();
            const id = item.href.substring(1);
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            setActiveIndex(index);
        }
        else if (!item.href.startsWith('http')) {
            setActiveIndex(index);
        }
    };

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between py-4 px-6 backdrop-blur-md bg-white/70 border-b border-white/20 transition-all duration-300 ${className}`}
            ref={navRef}
        >
            <div
                className="flex items-center gap-2 mr-8 cursor-pointer shrink-0"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
                {logo && <img src={logo} alt={logoAlt} className="h-8 w-auto" />}
                <span className="font-bold text-xl tracking-tight" style={{ color: effectiveBaseColor }}>Al-Kabah</span>
            </div>

            <div
                className="hidden md:flex relative items-center bg-transparent rounded-full mx-auto"
                onMouseLeave={handleMouseLeave}
            >
                <div
                    ref={pillRef}
                    className="absolute top-0 bottom-0 rounded-full z-0 pointer-events-none opacity-0"
                    style={{ backgroundColor: effectivePillColor, height: '100%' }}
                />

                {items.map((item, index) => (
                    <Link
                        key={index}
                        to={item.href}
                        ref={el => itemsRef.current[index] = el}
                        className="relative z-10 px-5 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap"
                        style={{
                            color: index === activeIndex ? effectiveHoverText : effectiveBaseColor,
                            textDecoration: 'none'
                        }}
                        onMouseEnter={(e) => handleMouseEnter(index, e)}
                        onClick={(e) => handleClick(e, item, index)}
                    >
                        {item.label}
                    </Link>
                ))}
            </div>

            <div className="flex items-center gap-4 shrink-0">
                {rightContent}
            </div>
        </nav>
    );
};

export default PillNav;
