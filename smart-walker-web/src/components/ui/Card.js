import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

export function Card({ children, className }) {
  return (
    <div
      className={classNames(
        "bg-white shadow-lg rounded-xl overflow-hidden transform transition-all hover:scale-105 hover:shadow-2xl",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className }) {
  return <div className={classNames("p-6", className)}>{children}</div>;
}

export function CardHeader({ title, subtitle, className }) {
  return (
    <div className={classNames("p-6 border-b border-gray-200", className)}>
      <h2 className="text-2xl font-semibold">{title}</h2>
      {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

export function CardFooter({ children, className }) {
  return <div className={classNames("p-4 border-t border-gray-200", className)}>{children}</div>;
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

CardHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  className: PropTypes.string,
};

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
