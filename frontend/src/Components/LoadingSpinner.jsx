import React from 'react';
import styled, { keyframes } from 'styled-components';

const LoadingSpinner = ({ fullPage = false }) => {
  return (
    <StyledWrapper $fullPage={fullPage}>
      <div className="spinner">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
    </StyledWrapper>
  );
};

const bounce = keyframes`
  0%, 80%, 100% { 
    transform: scale(0);
    opacity: 0.3;
  } 
  40% { 
    transform: scale(1);
    opacity: 1;
  }
`;

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  ${({ $fullPage }) => $fullPage && `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    z-index: 1000;
  `}

  .spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    height: 40px;
  }

  .dot {
    width: 12px;
    height: 12px;
    background-color: #000;
    border-radius: 50%;
    display: inline-block;
    animation: ${bounce} 1.4s infinite ease-in-out both;
  }

  .dot:nth-child(1) {
    animation-delay: -0.32s;
  }

  .dot:nth-child(2) {
    animation-delay: -0.16s;
  }

  .box2 {
    width: 48px;
    height: 48px;
    margin-top: 0px;
    margin-left: 0px;
    animation: abox2 4s 1s forwards ease-in-out infinite;
  }

  .box3 {
    width: 48px;
    height: 48px;
    margin-top: 0px;
    margin-left: 64px;
    animation: abox3 4s 1s forwards ease-in-out infinite;
  }

  @keyframes abox1 {
    0% { width: 112px; height: 48px; margin-top: 64px; margin-left: 0px; }
    12.5% { width: 48px; height: 48px; margin-top: 64px; margin-left: 0px; }
    25% { width: 48px; height: 48px; margin-top: 64px; margin-left: 0px; }
    37.5% { width: 48px; height: 48px; margin-top: 64px; margin-left: 0px; }
    50% { width: 48px; height: 48px; margin-top: 64px; margin-left: 0px; }
    62.5% { width: 48px; height: 48px; margin-top: 64px; margin-left: 0px; }
    75% { width: 48px; height: 112px; margin-top: 0px; margin-left: 0px; }
    87.5% { width: 48px; height: 48px; margin-top: 0px; margin-left: 0px; }
    100% { width: 48px; height: 48px; margin-top: 0px; margin-left: 0px; }
  }

  @keyframes abox2 {
    0% { width: 48px; height: 48px; margin-top: 0px; margin-left: 0px; }
    12.5% { width: 48px; height: 48px; margin-top: 0px; margin-left: 0px; }
    25% { width: 48px; height: 48px; margin-top: 0px; margin-left: 0px; }
    37.5% { width: 48px; height: 48px; margin-top: 0px; margin-left: 0px; }
    50% { width: 112px; height: 48px; margin-top: 0px; margin-left: 0px; }
    62.5% { width: 48px; height: 48px; margin-top: 0px; margin-left: 64px; }
    75% { width: 48px; height: 48px; margin-top: 0px; margin-left: 64px; }
    87.5% { width: 48px; height: 48px; margin-top: 0px; margin-left: 64px; }
    100% { width: 48px; height: 48px; margin-top: 0px; margin-left: 64px; }
  }

  @keyframes abox3 {
    0% { width: 48px; height: 48px; margin-top: 0px; margin-left: 64px; }
    12.5% { width: 48px; height: 48px; margin-top: 0px; margin-left: 64px; }
    25% { width: 48px; height: 112px; margin-top: 0px; margin-left: 64px; }
    37.5% { width: 48px; height: 48px; margin-top: 64px; margin-left: 64px; }
    50% { width: 48px; height: 48px; margin-top: 64px; margin-left: 64px; }
    62.5% { width: 48px; height: 48px; margin-top: 64px; margin-left: 64px; }
    75% { width: 48px; height: 48px; margin-top: 64px; margin-left: 64px; }
    87.5% { width: 48px; height: 48px; margin-top: 64px; margin-left: 64px; }
    100% { width: 112px; height: 48px; margin-top: 64px; margin-left: 0px; }
  }
`;

export default LoadingSpinner;
