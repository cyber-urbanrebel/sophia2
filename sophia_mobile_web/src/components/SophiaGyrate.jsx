import React from 'react';

export default function SophiaGyrate({
  className = '',
  size = 420,
  decorative = true,
}) {
  return (
    <img
      src="/assets/sophia-gyrate.svg"
      className={`sophia-gyrate ${className}`.trim()}
      width={size}
      height={size}
      alt=""
      aria-hidden={decorative ? 'true' : undefined}
      draggable="false"
    />
  );
}
