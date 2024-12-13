import React, { ReactNode } from "react";

interface ButtonProps {
  onClick: () => void;
  children: ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, children }) => {
  return (
    <button onClick={onClick} className="bg-blue-500 text-white border-none rounded-md px-2 py-1 text-base cursor-pointer transition-colors duration-200 hover:bg-blue-700 active:bg-blue-900">
        {children}
    </button>
  );
};

export default Button;
