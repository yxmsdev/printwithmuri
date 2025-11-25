import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'dark';
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary'
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const colorStyles = {
    primary: 'border-primary border-t-transparent',
    white: 'border-white border-t-transparent',
    dark: 'border-dark border-t-transparent',
  };

  return (
    <div
      className={`
        ${sizeStyles[size]}
        ${colorStyles[color]}
        rounded-full
        animate-spin
      `}
    />
  );
};

export default Spinner;
