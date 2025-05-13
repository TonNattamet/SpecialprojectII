import React from "react";

const Card_input = ({ children, className = "" }) => {
    return (
        <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
            {children}
        </div>
    );
};

const input_CardContent = ({ children }) => {
    return <div className="p-1">{children}</div>;
};

export { Card_input, input_CardContent };
