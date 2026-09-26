// routes/NotLoggedIn.js
import React from "react";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";

// Simple bounce animation for the icon
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
  40% {transform: translateY(-20px);}
  60% {transform: translateY(-10px);}
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #ff5f6d, #ffc371);
  color: #fff;
  text-align: center;
  padding: 20px;
`;

const Icon = styled.div`
  font-size: 6rem;
  margin-bottom: 20px;
  animation: ${bounce} 2s infinite;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.4);
`;

const Message = styled.p`
  font-size: 1.2rem;
  margin-bottom: 30px;
`;

const HomeLink = styled(Link)`
  padding: 12px 25px;
  background-color: #ffffff;
  color: #ff5f6d;
  font-weight: bold;
  border-radius: 30px;
  text-decoration: none;
  font-size: 1.1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    background-color: #ffe3b3;
    color: #ff3b3b;
    transform: scale(1.05);
  }
`;

const NotLoggedIn = () => {
  return (
    <Container>
      <Icon>🚫</Icon>
      <Title>Access Denied</Title>
      <Message>You must be logged in to view this page.</Message>
      <HomeLink to="/">Go Back Home / Login</HomeLink>
    </Container>
  );
};

export default NotLoggedIn;
