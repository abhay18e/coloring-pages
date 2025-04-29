import React from 'react';
import { LucideProps } from 'lucide-react'; // Import LucideProps type

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ComponentType<LucideProps>; // Use LucideProps for icon type
  label: string; // For accessibility and tooltips
  isActive?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  label,
  isActive = false,
  className,
  ...props
}) => {
  return (
    <button
      title={label}
      aria-label={label}
      className={`p-2 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 ${
        isActive
          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      } ${className}`} // Allow merging external classes
      {...props}
    >
      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
    </button>
  );
};

export default IconButton;