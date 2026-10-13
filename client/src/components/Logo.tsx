import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  withText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 28, className = '', withText = false }) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform hover:scale-105"
      >
        {/* Soft rounded squircle backdrop */}
        <rect width="128" height="128" rx="30" className="fill-[#27272A] dark:fill-[#323238]" />

        {/* Outer stylized Q ring */}
        <path
          d="M64 24C41.9086 24 24 41.9086 24 64C24 86.0914 41.9086 104 64 104C72.8091 104 80.9935 101.151 87.6445 96.3262L96.2 104.882C97.7621 106.444 100.295 106.444 101.857 104.882C103.419 103.32 103.419 100.787 101.857 99.2246L93.7383 91.1055C99.8249 83.8449 104 74.4533 104 64C104 41.9086 86.0914 24 64 24ZM64 36C79.464 36 92 48.536 92 64C92 71.3934 89.1364 78.1182 84.4453 83.1367L74.8281 73.5195C73.2661 71.9575 70.7339 71.9575 69.1719 73.5195C67.6099 75.0815 67.6099 77.6138 69.1719 79.1758L78.6973 88.7012C74.3828 91.3951 69.3789 92 64 92C48.536 92 36 79.464 36 64C36 48.536 48.536 36 64 36Z"
          fill="#FAF9F5"
        />

        {/* Terracotta Clay Asterism / Keystroke Star Spark */}
        <path
          d="M88.5 74L93.4 85L105.2 86.8L96.6 95.2L98.6 107L88.5 101.6L78.4 107L80.4 95.2L71.8 86.8L83.6 85L88.5 74Z"
          fill="#DA7756"
        />
      </svg>

      {withText && (
        <span className="font-semibold text-base tracking-tight text-[#23201D] dark:text-[#F4F4F5] font-sans">
          qwertybot
        </span>
      )}
    </div>
  );
};
