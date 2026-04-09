import React from 'react';
import Image from 'next/image';

const FuckIt = () => {
  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      <Image
        src="/fk.webp"
        alt="fuck it"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
        <h1 className="text-6xl md:text-9xl font-extrabold text-white uppercase tracking-tighter text-center drop-shadow-2xl">
          fuck it
        </h1>
      </div>
    </div>
  );
};

export default FuckIt;
