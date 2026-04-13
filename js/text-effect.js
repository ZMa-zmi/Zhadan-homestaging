/**
 * TextEffect — vanilla JS port of the motion-primitives TextEffect React component.
 *
 * Presets: 'blur' | 'shake' | 'scale' | 'fade' | 'slide'
 * Per:     'word' | 'char' | 'line'
 *
 * Usage:
 *   new TextEffect(element, { preset: 'blur', per: 'word', delay: 0.3 })
 *   effect.play()   — animate in
 *   effect.exit()   — animate out
 *   effect.trigger(true|false) — play or exit
 */

(function (global) {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Default stagger times (seconds)                                      */
  /* ------------------------------------------------------------------ */
  const DEFAULT_STAGGER = { char: 0.03, word: 0.05, line: 0.1 };

  /* ------------------------------------------------------------------ */
  /* Preset definitions — maps to CSS keyframe names + inline styles     */
  /* Each preset has:                                                     */
  /*   hidden: CSS props applied before animation                        */
  /*   visible: CSS props + transition when animating in                 */
  /*   exit: CSS props when animating out                                */
  /* ------------------------------------------------------------------ */
  const PRESETS = {
    blur: {
      hidden:  { opacity: '0', filter: 'blur(12px)' },
      visible: { opacity: '1', filter: 'blur(0px)' },
      exit:    { opacity: '0', filter: 'blur(12px)' },
    },
    shake: {
      hidden:  { opacity: '1', transform: 'translateX(0)' },
      visible: { opacity: '1', transform: 'translateX(0)', _shake: true },
      exit:    { opacity: '1', transform: 'translateX(0)' },
    },
    scale: {
      hidden:  { opacity: '0', transform: 'scale(0)' },
      visible: { opacity: '1', transform: 'scale(1)' },
      exit:    { opacity: '0', transform: 'scale(0)' },
    },
    fade: {
      hidden:  { opacity: '0' },
      visible: { opacity: '1' },
      exit:    { opacity: '0' },
    },
    slide: {
      hidden:  { opacity: '0', transform: 'translateY(20px)' },
      visible: { opacity: '1', transform: 'translateY(0)' },
      exit:    { opacity: '0', transform: 'translateY(20px)' },
    },
  };

  /* Duration for each animation step (ms) */
  const DURATION = 400;
  const SHAKE_KEYFRAMES = [
    { transform: 'translateX(0px)' },
    { transform: 'translateX(-5px)' },
    { transform: 'translateX(5px)' },
    { transform: 'translateX(-5px)' },
    { transform: 'translateX(5px)' },
    { transform: 'translateX(0px)' },
  ];

  /* ------------------------------------------------------------------ */
  /* Helpers                                                              */
  /* ------------------------------------------------------------------ */

  function applyStyles(el, styles) {
    for (const [prop, val] of Object.entries(styles)) {
      if (prop === '_shake') continue;
      el.style[prop] = val;
    }
  }

  function setTransition(el, duration, delay) {
    el.style.transition =
      `opacity ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, ` +
      `filter ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, ` +
      `transform ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`;
  }

  function clearTransition(el) {
    el.style.transition = 'none';
  }

  /* ------------------------------------------------------------------ */
  /* TextEffect class                                                     */
  /* ------------------------------------------------------------------ */

  class TextEffect {
    /**
     * @param {HTMLElement} element   - The element whose text to animate.
     * @param {Object}      options
     *   @param {'blur'|'shake'|'scale'|'fade'|'slide'} [options.preset='fade']
     *   @param {'word'|'char'|'line'}                  [options.per='word']
     *   @param {number}                                [options.delay=0]     - seconds, initial delay before stagger starts
     *   @param {number}                                [options.stagger]     - seconds per segment; defaults to DEFAULT_STAGGER[per]
     *   @param {boolean}                               [options.trigger]     - if false, does not auto-play
     *   @param {Function}                              [options.onComplete]  - called after animate-in finishes
     *   @param {boolean}                               [options.preserveSpace] - keep whitespace spans (default true)
     */
    constructor(element, options = {}) {
      if (!element) return;
      this.el = element;

      const {
        preset = 'fade',
        per = 'word',
        delay = 0,
        stagger,
        trigger = true,
        onComplete = null,
        preserveSpace = true,
      } = options;

      this.preset = PRESETS[preset] || PRESETS.fade;
      this.per = per;
      this.delayMs = delay * 1000;
      this.staggerMs = (stagger !== undefined ? stagger : DEFAULT_STAGGER[per]) * 1000;
      this.onComplete = onComplete;
      this.preserveSpace = preserveSpace;
      this._playing = false;
      this._exitTimers = [];
      this._playTimers = [];

      this._originalText = element.textContent;
      this._wrap();

      if (trigger) this.play();
    }

    /* Split text into segments and wrap each in a <span> */
    _wrap() {
      const text = this._originalText;
      let segments;

      if (this.per === 'line') {
        segments = text.split('\n');
      } else if (this.per === 'word') {
        // Split preserving whitespace tokens so layout is unchanged
        segments = text.split(/(\s+)/);
      } else {
        // char — each character separately, preserve spaces
        segments = text.split('');
      }

      this.el.innerHTML = '';

      const spans = [];

      if (this.per === 'char') {
        // For chars, we group by word boundaries so whitespace renders correctly
        segments.forEach((char) => {
          const span = document.createElement('span');
          span.textContent = char;
          span.style.display = 'inline-block';
          span.style.whiteSpace = 'pre';
          if (char.trim() === '') {
            // Whitespace character — don't animate, just render
            span.dataset.space = 'true';
          }
          this.el.appendChild(span);
          spans.push(span);
        });
      } else if (this.per === 'word') {
        segments.forEach((seg) => {
          const span = document.createElement('span');
          span.textContent = seg;
          span.style.display = 'inline-block';
          span.style.whiteSpace = 'pre';
          if (seg.trim() === '') {
            span.dataset.space = 'true';
          }
          this.el.appendChild(span);
          spans.push(span);
        });
      } else {
        // line
        segments.forEach((line, i) => {
          const span = document.createElement('span');
          span.textContent = line;
          span.style.display = 'block';
          this.el.appendChild(span);
          if (i < segments.length - 1) {
            // Add a line break
            this.el.appendChild(document.createTextNode('\n'));
          }
          spans.push(span);
        });
      }

      this._spans = spans;
      // Apply initial hidden state to animatable spans
      this._animatableSpans().forEach((sp) => {
        clearTransition(sp);
        applyStyles(sp, this.preset.hidden);
      });
    }

    /* Filter out whitespace-only spans that we don't animate */
    _animatableSpans() {
      return this._spans.filter((sp) => !sp.dataset.space);
    }

    /* Animate in */
    play() {
      if (this._playing) return;
      this._playing = true;
      this._clearTimers(this._exitTimers);

      const spans = this._animatableSpans();
      const preset = this.preset;
      const totalSpans = spans.length;

      spans.forEach((sp, i) => {
        const spanDelay = this.delayMs + i * this.staggerMs;

        const t = setTimeout(() => {
          setTransition(sp, DURATION, 0);

          if (preset.visible._shake) {
            // Use Web Animations API for shake
            applyStyles(sp, { opacity: '1' });
            if (typeof sp.animate === 'function') {
              sp.animate(SHAKE_KEYFRAMES, { duration: 500, easing: 'ease-in-out' });
            }
          } else {
            applyStyles(sp, preset.visible);
          }

          // Fire onComplete after last span finishes
          if (i === totalSpans - 1 && this.onComplete) {
            setTimeout(() => this.onComplete(), DURATION);
          }
        }, spanDelay);

        this._playTimers.push(t);
      });
    }

    /* Animate out (reverse stagger) */
    exit() {
      this._playing = false;
      this._clearTimers(this._playTimers);

      const spans = this._animatableSpans();
      const total = spans.length;

      // Reverse stagger for exit
      spans.forEach((sp, i) => {
        const spanDelay = i * this.staggerMs; // forward exit (can reverse if desired)
        const t = setTimeout(() => {
          setTransition(sp, DURATION, 0);
          applyStyles(sp, this.preset.exit);
        }, spanDelay);
        this._exitTimers.push(t);
      });
    }

    /* Toggle based on boolean */
    trigger(value) {
      if (value) this.play();
      else this.exit();
    }

    /* Reset to hidden state (no animation) */
    reset() {
      this._clearTimers(this._playTimers);
      this._clearTimers(this._exitTimers);
      this._playing = false;
      this._animatableSpans().forEach((sp) => {
        clearTransition(sp);
        applyStyles(sp, this.preset.hidden);
      });
    }

    _clearTimers(arr) {
      arr.forEach(clearTimeout);
      arr.length = 0;
    }
  }

  /* Expose globally */
  global.TextEffect = TextEffect;

})(window);
