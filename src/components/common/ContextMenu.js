import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import 'styles/ContextMenu.css';

const ContextMenu = forwardRef(({ visible, x, y, options, onClose }, ref) => {
  if (!visible) return null;

  return (
    <div
      ref={ref}
      className="context-menu"
      style={{
        position: 'fixed',
        top: `${y}px`,
        left: `${x}px`,
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <ul>
        {options.map((option, index) =>
          option.isDivider ? (
            <li key={index} className="context-menu-divider"></li>
          ) : (
            <li key={index} onClick={option.onClick}>
              {option.label}
            </li>
          )
        )}
      </ul>
    </div>
  );
});

ContextMenu.propTypes = {
  visible: PropTypes.bool.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ContextMenu;