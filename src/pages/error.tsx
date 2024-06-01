import { CSSProperties } from 'react';

const ErrorPage = () => {
  const errorPageStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '70vh',
  };

  const headingStyles: CSSProperties = {
    fontSize: '36px',
    marginBottom: '16px',
  };

  const paragraphStyles: CSSProperties = {
    fontSize: '18px',
    marginBottom: '24px',
  };

  const logoStyles: CSSProperties = {
    width: '700px',
  };

  return (
    <div style={errorPageStyles}>
      <img src="logo.png" alt="Logo" style={logoStyles} />
      <h1 style={headingStyles}>Error 404: Page Not Found</h1>
      <p style={paragraphStyles}>The page you are looking for does not exist.</p>
    </div>
  );
};

export default ErrorPage;