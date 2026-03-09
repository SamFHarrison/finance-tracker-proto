"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

const DIGIT_STRIP = Array.from({ length: 20 }, (_, index) => index % 10);
const HALF_DIGIT_COUNT = DIGIT_STRIP.length / 2;
const DEFAULT_DURATION_MS = 700;

type AnimatedNumberProps = {
  content: number;
  className?: string;
  durationMs?: number;
  formatter?: (value: number) => string;
};

type NumberSlot =
  | {
      kind: "digit";
      key: string;
      digit: number;
    }
  | {
      kind: "char";
      key: string;
      char: string;
    };

type RollingDigitProps = {
  direction: 1 | -1;
  durationMs: number;
  targetDigit: number;
};

/**
 * Renders an odometer-style animated number where each numeric character rolls
 * independently when the `content` value changes.
 *
 * Non-digit characters returned by `formatter` are rendered as static glyphs, so
 * callers can include currency symbols, separators, decimals, or prefixes
 * without affecting the rolling behavior of the numeric columns.
 *
 * The component compares the previous numeric value to the next one to choose
 * whether digits should roll upward or downward. If the user prefers reduced
 * motion, the value snaps to the next state without animation.
 *
 * @param props - Component configuration.
 * @param props.content - Source numeric value that drives the displayed output
 * and triggers the animation whenever it changes.
 * @param props.className - Optional classes applied to the outer wrapper so the
 * odometer can inherit surrounding typography or layout styles.
 * @param props.durationMs - Optional animation duration in milliseconds for a
 * single digit transition. Defaults to `700`.
 * @param props.formatter - Optional function that converts `content` into the
 * final display string. Digits in the returned string animate; all other
 * characters remain static.
 * @returns An inline odometer element suitable for use inside headings, labels,
 * cards, and other text-heavy UI.
 */
export function AnimatedNumber({
  content,
  className,
  durationMs = DEFAULT_DURATION_MS,
  formatter = defaultFormatter,
}: AnimatedNumberProps) {
  const previousContentRef = useRef(content);
  const prefersReducedMotion = usePrefersReducedMotion();
  const displayValue = formatter(content);
  const direction = shouldRollDown(previousContentRef.current, content)
    ? -1
    : 1;
  const slots = buildSlots(displayValue);

  useEffect(() => {
    previousContentRef.current = content;
  }, [content]);

  return (
    <span
      className={cn(
        "inline-flex items-baseline tabular-nums leading-none",
        className,
      )}
    >
      <span className="sr-only">{displayValue}</span>
      {slots.map((slot) => {
        if (slot.kind === "char") {
          return (
            <span aria-hidden="true" className="leading-none" key={slot.key}>
              {slot.char}
            </span>
          );
        }

        return (
          <RollingDigit
            direction={direction}
            durationMs={prefersReducedMotion ? 0 : durationMs}
            key={slot.key}
            targetDigit={slot.digit}
          />
        );
      })}
    </span>
  );
}

export default AnimatedNumber;

/**
 * Renders a single rolling digit column using a duplicated `0-9` strip so the
 * column can wrap in either direction without a visible jump.
 *
 * The component stores its current translated position in both React state and a
 * ref. The ref lets a new animation start from the exact in-flight position when
 * `targetDigit` changes before the previous animation finishes, which avoids the
 * race conditions common with overlapping `requestAnimationFrame` loops.
 *
 * @param props - Rolling digit configuration.
 * @param props.direction - `1` to roll upward through increasing values,
 * `-1` to roll downward through decreasing values.
 * @param props.durationMs - Transition duration in milliseconds. A value of `0`
 * disables motion and snaps to the target digit.
 * @param props.targetDigit - Final digit to show after the animation completes.
 * @returns A single clipped digit column sized to one character cell.
 */
function RollingDigit({
  direction,
  durationMs,
  targetDigit,
}: RollingDigitProps) {
  const animationIdRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const initialPosition = getTargetPosition(targetDigit);
  const currentPositionRef = useRef(initialPosition);
  const [currentPosition, setCurrentPosition] = useState(initialPosition);

  useEffect(() => {
    animationIdRef.current += 1;
    const animationId = animationIdRef.current;
    const startPosition = roundTo(
      getStartPosition(currentPositionRef.current, direction),
      3,
    );
    const offset = getOffset(startPosition, targetDigit, direction);
    const endPosition = roundTo(startPosition + offset, 3);

    if (durationMs <= 0 || offset === 0) {
      currentPositionRef.current = endPosition;
      setCurrentPosition(endPosition);
      return;
    }

    const startTime = performance.now();

    const tick = (timestamp: number) => {
      if (animationIdRef.current !== animationId) {
        return;
      }

      const elapsed = timestamp - startTime;
      const nextPosition = roundTo(
        easeInOutCubic(elapsed, startPosition, offset, durationMs),
        3,
      );

      currentPositionRef.current = nextPosition;
      setCurrentPosition(nextPosition);

      if (elapsed < durationMs) {
        animationFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      currentPositionRef.current = endPosition;
      setCurrentPosition(endPosition);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [direction, durationMs, targetDigit]);

  return (
    <span
      aria-hidden="true"
      className="relative inline-flex h-[1em] overflow-hidden align-baseline"
    >
      <span className="invisible leading-none">0</span>
      <span
        className="absolute inset-0 flex flex-col items-center leading-none will-change-transform"
        style={{
          transform: `translateY(${currentPosition}em)`,
        }}
      >
        {DIGIT_STRIP.map((digit, index) => (
          <span
            className="flex h-[1em] items-center justify-center"
            key={`${digit}-${index}`}
          >
            {digit}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * Splits a formatted number string into renderable slots while preserving stable
 * keys for each numeric place value.
 *
 * Numeric characters are keyed from right to left so a digit keeps the same
 * identity when higher-order digits are added or removed. That helps React
 * preserve the correct column state for values like `99 -> 100`.
 *
 * Non-digit characters are emitted as static slots and keep their original
 * string position in the generated key.
 *
 * @param value - Fully formatted display string.
 * @returns Ordered slots describing which characters should animate as digits
 * and which should render as static text.
 */
function buildSlots(value: string): NumberSlot[] {
  const slots: NumberSlot[] = [];
  let placeFromRight = 0;

  for (let index = value.length - 1; index >= 0; index -= 1) {
    const char = value[index];

    if (isDigit(char)) {
      slots.push({
        digit: Number.parseInt(char, 10),
        key: `digit-${placeFromRight}`,
        kind: "digit",
      });
      placeFromRight += 1;
      continue;
    }

    slots.push({
      char,
      key: `char-${index}-${char}`,
      kind: "char",
    });
  }

  return slots.reverse();
}

/**
 * Tracks the user's `prefers-reduced-motion` setting so the odometer can
 * disable its rolling animation when motion reduction is requested.
 *
 * @returns `true` when the current browser preference is `reduce`, otherwise
 * `false`.
 */
function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Default formatter used when the caller does not provide one.
 *
 * @param value - Raw numeric value supplied to `AnimatedNumber`.
 * @returns The value converted directly to a string.
 */
function defaultFormatter(value: number) {
  return value.toString();
}

/**
 * Determines whether the next animation should roll digits downward.
 *
 * Non-finite numbers are treated as a no-op directionally and default to the
 * upward path, which keeps the animation logic safe for unexpected input.
 *
 * @param previousValue - Last numeric value rendered by the component.
 * @param nextValue - New numeric value about to be rendered.
 * @returns `true` when the next value is smaller than the previous value,
 * otherwise `false`.
 */
function shouldRollDown(previousValue: number, nextValue: number) {
  if (!Number.isFinite(previousValue) || !Number.isFinite(nextValue)) {
    return false;
  }

  return nextValue < previousValue;
}

/**
 * Checks whether a single character is an ASCII decimal digit.
 *
 * @param char - Character to inspect.
 * @returns `true` when the character is between `0` and `9`.
 */
function isDigit(char: string) {
  return /^[0-9]$/.test(char);
}

/**
 * Converts a digit into its resting translateY position within the rolling
 * number strip.
 *
 * Each row in the strip is exactly `1em` tall, so the digit index maps directly
 * to a negative vertical offset.
 *
 * @param targetDigit - Digit that should be visible in the viewport.
 * @returns TranslateY offset, in `em`, needed to align the requested digit.
 */
function getTargetPosition(targetDigit: number) {
  return targetDigit * -1;
}

/**
 * Normalizes the current strip position into the half of the duplicated digit
 * strip that best supports the requested animation direction.
 *
 * Because the strip is rendered twice, the column can be shifted by one half of
 * its length without changing the visible digit. This allows continuous-looking
 * motion without wrapping artifacts at the `9 -> 0` or `0 -> 9` boundaries.
 *
 * @param currentPosition - Current translateY offset, in `em`.
 * @param direction - Desired animation direction.
 * @returns Starting translateY offset, in `em`, for the next animation.
 */
function getStartPosition(currentPosition: number, direction: 1 | -1) {
  if (direction < 0) {
    return currentPosition > -HALF_DIGIT_COUNT
      ? currentPosition - HALF_DIGIT_COUNT
      : currentPosition;
  }

  return currentPosition < -HALF_DIGIT_COUNT
    ? currentPosition + HALF_DIGIT_COUNT
    : currentPosition;
}

/**
 * Calculates the signed distance the strip needs to travel from a normalized
 * start position to the requested target digit.
 *
 * The duplicated strip makes it possible to choose the visually closest target
 * instance while still honoring the requested direction of travel.
 *
 * @param startPosition - Direction-normalized starting translateY offset.
 * @param targetDigit - Digit that should be visible at the end of the motion.
 * @param direction - Requested scroll direction.
 * @returns Delta, in `em`, to add to `startPosition` during the animation.
 */
function getOffset(
  startPosition: number,
  targetDigit: number,
  direction: 1 | -1,
) {
  const targetPosition = getTargetPosition(targetDigit);

  if (direction < 0) {
    return targetPosition - HALF_DIGIT_COUNT >= startPosition
      ? targetPosition - HALF_DIGIT_COUNT - startPosition
      : targetPosition - startPosition;
  }

  return targetPosition > startPosition
    ? targetPosition - HALF_DIGIT_COUNT - startPosition
    : targetPosition - startPosition;
}

/**
 * Cubic ease-in-out interpolation used to animate the strip between two
 * translateY positions.
 *
 * The output mirrors the behavior of common easing utility libraries without
 * introducing an external dependency.
 *
 * @param elapsed - Time elapsed since the animation started, in milliseconds.
 * @param start - Starting numeric value of the animated property.
 * @param change - Total delta to apply over the full duration.
 * @param duration - Total animation duration, in milliseconds.
 * @returns Interpolated value for the current animation frame.
 */
function easeInOutCubic(
  elapsed: number,
  start: number,
  change: number,
  duration: number,
) {
  const progress = Math.min(elapsed / duration, 1);

  if (progress < 0.5) {
    return start + change * 4 * progress * progress * progress;
  }

  return start + change * (1 - Math.pow(-2 * progress + 2, 3) / 2);
}

/**
 * Rounds a numeric value to a fixed number of fractional digits.
 *
 * This keeps the generated translateY values stable and avoids noisy floating
 * point precision artifacts in inline styles across animation frames.
 *
 * @param value - Number to round.
 * @param digits - Number of decimal places to preserve.
 * @returns Rounded numeric result.
 */
function roundTo(value: number, digits: number) {
  const precision = 10 ** digits;
  return Math.round(value * precision) / precision;
}
