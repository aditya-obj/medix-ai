import React from "react";

const PerformanceMeter = ({
  score,
  maxScore,
  totalSegments = 20,
  activeColor = "fill-red-600",
  inactiveColor = "fill-gray-100 dark:fill-gray-200",
  size = {
    width: "350px",
    height: "200",
  },
  textSize = "text-2xl sm:text-4xl",
  unit = "point",
  showUnit = true,
}) => {
  const filledSegments = Math.floor((score / maxScore) * totalSegments);
  const percentage = (score / maxScore) * 100;

  return (
    <div className="relative mb-[1.5rem]">
      <svg
        className="half-circle-pie m-auto rtl:-scale-x-100"
        viewBox="0 0 34 17"
        width={size.width}
        height={size.height}
        role="img"
        aria-label={`Half circle chart showing ${percentage}% performance`}
      >
        {Array.from({ length: totalSegments }).map((_, index) => {
          const isActive = index < filledSegments;
          return (
            <path
              key={index}
              className={`${
                isActive ? activeColor : inactiveColor
              } transition-colors duration-300`}
              d="M -1.35 -0.75 L 1.35 -0.49 C 1.55 -0.465 1.75 -0.291 1.75 -0.091 L 1.75 0.1085 C 1.75 0.3145 1.55 0.465 1.35 0.49 L -1.35 0.75 C -1.571 0.75 -1.75 0.571 -1.75 0.35 L -1.75 -0.35 C -1.75 -0.571 -1.571 -0.75 -1.35 -0.75 Z"
              transform={`translate(17,17) rotate(${
                index * 10
              }) translate(-13.5,0)`}
            />
          );
        })}
      </svg>
      <div className="absolute bottom-0 left-0 w-full text-center transition-colors duration-300">
        <div className="font-medium text-6xl mb-1">
          <span className="text-[#0f0f0f]">{score}</span>
          {showUnit && (
            <span className="text-gray-400 text-base font-normal ml-0.5">
              {" "}
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMeter;
