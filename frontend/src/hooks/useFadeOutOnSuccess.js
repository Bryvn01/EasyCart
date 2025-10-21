import { useRef, useState } from 'react';

/**
 * useFadeOutOnSuccess - A reusable hook for fade-out and hide transitions after a successful action.
 * Returns: [ref, hidden, triggerFadeOut]
 * Usage:
 *   const [btnRef, btnHidden, triggerFadeOut] = useFadeOutOnSuccess();
 *   <button ref={btnRef} style={{ opacity: btnHidden ? 0 : 1, display: btnHidden ? 'none' : undefined }} ... />
 *   // On success: triggerFadeOut(() => { ... });
 */
export function useFadeOutOnSuccess(duration = 400) {
  const ref = useRef(null);
  const [hidden, setHidden] = useState(false);

  function triggerFadeOut(callback) {
    if (ref.current) {
      ref.current.style.opacity = 0;
      setTimeout(() => {
        setHidden(true);
        if (typeof callback === 'function') callback();
      }, duration);
    } else {
      setHidden(true);
      if (typeof callback === 'function') callback();
    }
  }

  return [ref, hidden, triggerFadeOut];
}
