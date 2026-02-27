/**
 * Smart Health Care — Framer Motion Presets
 *
 * Reusable animation variants and wrapper components for consistent
 * micro-interactions throughout the application.
 */

import { motion, type Variants, type HTMLMotionProps } from 'framer-motion'
import React from 'react'

/* ── Animation Variants ── */

/** Fade in from transparent */
export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
}

/** Slide up from below with fade */
export const slideUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/** Slide down from above with fade */
export const slideDown: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/** Slide in from the left */
export const slideLeft: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/** Slide in from the right */
export const slideRight: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

/** Scale up from smaller size */
export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
}

/** Stagger children animation */
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
}

/** Individual stagger child (use with staggerContainer) */
export const staggerItem: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

/* ── Wrapper Components ── */

/** Animates children with fade-in on mount */
export const MotionFadeIn = React.forwardRef<
    HTMLDivElement,
    HTMLMotionProps<'div'>
>(({ children, ...props }, ref) => (
    <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        {...props}
    >
        {children}
    </motion.div>
))
MotionFadeIn.displayName = 'MotionFadeIn'

/** Animates children with slide-up entrance */
export const MotionSlideUp = React.forwardRef<
    HTMLDivElement,
    HTMLMotionProps<'div'>
>(({ children, ...props }, ref) => (
    <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={slideUp}
        {...props}
    >
        {children}
    </motion.div>
))
MotionSlideUp.displayName = 'MotionSlideUp'

/** Animates children with scale-in entrance */
export const MotionScaleIn = React.forwardRef<
    HTMLDivElement,
    HTMLMotionProps<'div'>
>(({ children, ...props }, ref) => (
    <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={scaleIn}
        {...props}
    >
        {children}
    </motion.div>
))
MotionScaleIn.displayName = 'MotionScaleIn'

/** Stagger-animated list wrapper */
export const MotionStaggerList = React.forwardRef<
    HTMLDivElement,
    HTMLMotionProps<'div'>
>(({ children, ...props }, ref) => (
    <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        {...props}
    >
        {children}
    </motion.div>
))
MotionStaggerList.displayName = 'MotionStaggerList'

/** Export motion for direct usage */
export { motion, type Variants }
