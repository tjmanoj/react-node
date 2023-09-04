import React from 'react';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: '16px', // Add padding for better spacing on small screens
  boxSizing: 'border-box', // Ensure padding is included in element's size
};

const loginButtonStyle = {
  marginTop: '16px', // You can adjust the spacing as needed
};

const Home = () => {

    const navigate = useNavigate();
    const loginClick=()=>{
        navigate('/logster');
    }
  return (
    <div style={containerStyle}>
      <h1 style={{textAlign:'center'}}>Welcome to the<br/> Home Page</h1>
      <Button
        variant="contained"
        color="primary"
        style={loginButtonStyle}
        onClick={loginClick}
      >
        Login
      </Button>
    </div>
  );
}

export default Home;
