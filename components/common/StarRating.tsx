
import React from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  onRatingChange?: (newRating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, maxRating = 5, onRatingChange }) => {
  const isInteractive = !!onRatingChange;

  const handleRating = (newRating: number) => {
    if (onRatingChange) {
      onRatingChange(newRating);
    }
  };

  return (
    <div className={`flex items-center ${isInteractive ? 'cursor-pointer' : ''}`}>
      {[...Array(maxRating)].map((_, i) => {
        const starValue = i + 1;
        return (
          <Star
            key={`star-${i}`}
            filled={starValue <= rating}
            onClick={isInteractive ? () => handleRating(starValue) : undefined}
          />
        );
      })}
    </div>
  );
};

interface StarProps {
  filled?: boolean;
  onClick?: () => void;
}

const Star: React.FC<StarProps> = ({ filled = false, onClick }) => {
  const color = "text-secondary";
  const starPath = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`w-6 h-6 p-0.5 ${onClick ? 'transform hover:scale-125 transition-transform' : ''}`}
    >
      <svg className={`${color} w-full h-full`} fill="currentColor" viewBox="0 0 20 20">
        <path
          d={starPath}
          fillOpacity={filled ? 1 : 0.2}
        />
      </svg>
    </button>
  );
};
