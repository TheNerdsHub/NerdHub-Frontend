import React from 'react';
import './Footer.css'; // Optional if you want to style it separately

function Footer() {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} NerdHub. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
