'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const CLAMP_MARGIN = 8;
const HEARTS_COUNT = 32;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function HomePage() {
  const noButtonRef = useRef(null);
  const yesButtonRef = useRef(null);
  const areaRef = useRef(null);

  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [positionReady, setPositionReady] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [heartsBurst, setHeartsBurst] = useState([]);

  const moveNoButton = useCallback((cursorX, cursorY) => {
    const noEl = noButtonRef.current;
    const areaEl = areaRef.current;
    if (!noEl || !areaEl) return;

    const areaRect = areaEl.getBoundingClientRect();
    const noRect = noEl.getBoundingClientRect();

    const centerX = noRect.left + noRect.width / 2;
    const centerY = noRect.top + noRect.height / 2;

    let dx = centerX - cursorX;
    let dy = centerY - cursorY;

    const magnitude = Math.hypot(dx, dy) || 1;
    dx /= magnitude;
    dy /= magnitude;

    const scootDistance = Math.min(130, areaRect.width * 0.28);

    const maxX = areaRect.width - noRect.width - CLAMP_MARGIN;
    const maxY = areaRect.height - noRect.height - CLAMP_MARGIN;

    const currentX = noRect.left - areaRect.left;
    const currentY = noRect.top - areaRect.top;

    let nextX = clamp(currentX + dx * scootDistance, CLAMP_MARGIN, maxX);
    let nextY = clamp(currentY + dy * scootDistance, CLAMP_MARGIN, maxY);

    if (Math.abs(nextX - currentX) < 4 && Math.abs(nextY - currentY) < 4) {
      nextX = clamp(Math.random() * maxX, CLAMP_MARGIN, maxX);
      nextY = clamp(Math.random() * maxY, CLAMP_MARGIN, maxY);
    }

    setNoPosition({ x: nextX, y: nextY });
  }, []);

  const maybeScootNo = useCallback(
    (event) => {
      if (accepted) return;
      const noEl = noButtonRef.current;
      if (!noEl) return;

      const rect = noEl.getBoundingClientRect();
      const cx = event.clientX;
      const cy = event.clientY;

      const distance = Math.hypot(cx - (rect.left + rect.width / 2), cy - (rect.top + rect.height / 2));
      const nearThreshold = Math.max(70, rect.width * 0.9);

      if (distance <= nearThreshold) {
        moveNoButton(cx, cy);
      }
    },
    [accepted, moveNoButton]
  );

  useEffect(() => {
    const noEl = noButtonRef.current;
    const areaEl = areaRef.current;
    const yesEl = yesButtonRef.current;
    if (!noEl || !areaEl || !yesEl || positionReady) return;

    const areaRect = areaEl.getBoundingClientRect();
    const yesRect = yesEl.getBoundingClientRect();

    const noX = clamp(yesRect.right - areaRect.left + 16, CLAMP_MARGIN, areaRect.width - noEl.offsetWidth - CLAMP_MARGIN);
    const noY = clamp(yesRect.top - areaRect.top, CLAMP_MARGIN, areaRect.height - noEl.offsetHeight - CLAMP_MARGIN);

    setNoPosition({ x: noX, y: noY });
    setPositionReady(true);
  }, [positionReady]);

  useEffect(() => {
    if (!positionReady) return;

    const handleMove = (event) => maybeScootNo(event);
    window.addEventListener('pointermove', handleMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handleMove);
    };
  }, [maybeScootNo, positionReady]);

  useEffect(() => {
    const handleResize = () => {
      const areaEl = areaRef.current;
      const noEl = noButtonRef.current;
      if (!areaEl || !noEl) return;
      const areaRect = areaEl.getBoundingClientRect();
      const maxX = areaRect.width - noEl.offsetWidth - CLAMP_MARGIN;
      const maxY = areaRect.height - noEl.offsetHeight - CLAMP_MARGIN;
      setNoPosition((prev) => ({
        x: clamp(prev.x, CLAMP_MARGIN, maxX),
        y: clamp(prev.y, CLAMP_MARGIN, maxY)
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const generateHearts = useCallback(() => {
    const hearts = Array.from({ length: HEARTS_COUNT }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 1.8 + Math.random() * 1.8,
      size: 16 + Math.random() * 26,
      drift: (Math.random() - 0.5) * 120
    }));

    setHeartsBurst(hearts);
    window.setTimeout(() => setHeartsBurst([]), 3600);
  }, []);

  const romanticSubtext = useMemo(
    () =>
      accepted
        ? 'Yaaay! 💖✨ You made my heart do happy cartwheels!'
        : 'Will you be my Valentine? 🌹🥰',
    [accepted]
  );

  const onYesClick = () => {
    if (accepted) return;
    setAccepted(true);
    generateHearts();
  };

  return (
    <main className="page">
      <section className="card" ref={areaRef}>
        <p className="eyebrow">💕 Hey cutie pie! 💕</p>
        <h1>Valentine vibes only 💘</h1>
        <p className="subtext">{romanticSubtext}</p>

        <div className="buttonZone">
          <button ref={yesButtonRef} className={`btn yes ${accepted ? 'celebrate' : ''}`} onClick={onYesClick}>
            Yes 💞
          </button>
          <button
            ref={noButtonRef}
            className="btn no"
            style={{ transform: `translate(${noPosition.x}px, ${noPosition.y}px)` }}
            onMouseEnter={(event) => maybeScootNo(event)}
            onPointerDown={(event) => {
              event.preventDefault();
              maybeScootNo(event);
            }}
            aria-label="No"
            type="button"
          >
            No 🙈
          </button>
        </div>

        <div className={`message ${accepted ? 'show' : ''}`}>
          Best decision ever. I love you Be ready for a movie on February 14.
        </div>

        <div className="floatingHearts" aria-hidden="true">
          {heartsBurst.map((heart) => (
            <span
              key={heart.id}
              className="heart"
              style={{
                left: `${heart.left}%`,
                animationDelay: `${heart.delay}s`,
                animationDuration: `${heart.duration}s`,
                fontSize: `${heart.size}px`,
                '--drift': `${heart.drift}px`
              }}
            >
              💖
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
