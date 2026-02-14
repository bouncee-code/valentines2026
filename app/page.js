'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

const HEART_COUNT = 42;

export default function HomePage() {
  const areaRef = useRef(null);
  const noRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [accepted, setAccepted] = useState(false);
  const [heartBurst, setHeartBurst] = useState(0);

  const hearts = useMemo(
    () =>
      Array.from({ length: HEART_COUNT }, (_, i) => ({
        id: `${heartBurst}-${i}`,
        left: 8 + Math.random() * 84,
        delay: Math.random() * 0.55,
        duration: 1.6 + Math.random() * 1.4,
        size: 18 + Math.random() * 26,
        sway: (Math.random() - 0.5) * 80
      })),
    [heartBurst]
  );

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const dodgeNo = useCallback((pointer) => {
    const area = areaRef.current;
    const noBtn = noRef.current;
    if (!area || !noBtn || accepted) {
      return;
    }

    const areaRect = area.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();
    const margin = 12;

    const currentX = noRect.left - areaRect.left;
    const currentY = noRect.top - areaRect.top;

    const centerX = currentX + noRect.width / 2;
    const centerY = currentY + noRect.height / 2;

    const dx = centerX - pointer.x;
    const dy = centerY - pointer.y;
    const dist = Math.hypot(dx, dy) || 1;
    const runDistance = 95;

    let nextX = currentX + (dx / dist) * runDistance;
    let nextY = currentY + (dy / dist) * runDistance;

    const maxX = areaRect.width - noRect.width - margin;
    const maxY = areaRect.height - noRect.height - margin;

    nextX = clamp(nextX, margin, maxX);
    nextY = clamp(nextY, margin, maxY);

    setNoPos({ x: nextX, y: nextY });
  }, [accepted]);

  const handlePointerMove = useCallback(
    (event) => {
      const area = areaRef.current;
      const noBtn = noRef.current;
      if (!area || !noBtn || accepted) {
        return;
      }

      const areaRect = area.getBoundingClientRect();
      const noRect = noBtn.getBoundingClientRect();
      const pointer = {
        x: event.clientX - areaRect.left,
        y: event.clientY - areaRect.top
      };
      pointerRef.current = pointer;

      const centerX = noRect.left - areaRect.left + noRect.width / 2;
      const centerY = noRect.top - areaRect.top + noRect.height / 2;
      const proximity = Math.hypot(centerX - pointer.x, centerY - pointer.y);

      if (proximity < 105) {
        dodgeNo(pointer);
      }
    },
    [accepted, dodgeNo]
  );

  const onYes = () => {
    setAccepted(true);
    setHeartBurst((count) => count + 1);
  };

  const triggerNoEscape = (event) => {
    event.preventDefault();
    dodgeNo(pointerRef.current);
  };

  return (
    <main className="page">
      <section
        className={`card ${accepted ? 'accepted' : ''}`}
        ref={areaRef}
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
      >
        <p className="kicker">💘 Hey cutie 💘</p>
        <h1>Will you be my Valentine? 🥰</h1>
        <p className="subtitle">You + me + snacks + movie magic = perfect date night 🍿✨</p>

        <div className={`buttons ${accepted ? 'done' : ''}`}>
          <button className="btn yes" onClick={onYes} type="button">
            Yes 💖
          </button>
          {!accepted && (
            <button
              className="btn no"
              onMouseEnter={triggerNoEscape}
              onClick={triggerNoEscape}
              onTouchStart={triggerNoEscape}
              ref={noRef}
              style={{ transform: `translate(${noPos.x}px, ${noPos.y}px)` }}
              type="button"
            >
              No 🙈
            </button>
          )}
        </div>

        <p className={`message ${accepted ? 'show' : ''}`}>
          Best decision ever. I love you Be ready for a movie on February 14.
        </p>

        <div className={`heart-layer ${accepted ? 'show' : ''}`} aria-hidden="true">
          {accepted &&
            hearts.map((heart) => (
              <span
                className="heart"
                key={heart.id}
                style={{
                  left: `${heart.left}%`,
                  animationDelay: `${heart.delay}s`,
                  animationDuration: `${heart.duration}s`,
                  fontSize: `${heart.size}px`,
                  '--sway': `${heart.sway}px`
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
