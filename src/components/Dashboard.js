import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material';
import { useNavigate,useParams } from 'react-router-dom';
import Fab from '../components/FAB'
import { FcAbout, FcBusinessman, FcCamera, FcFullTrash } from "react-icons/fc";
import {v4 as uuidV4} from 'uuid'


const Dashboard = () => {
  const [token, setToken] = useState('');
  const [open, setOpen] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const navigate=useNavigate();
  const dynamicUuid = uuidV4();

  const handleCreateDocument = () => {
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
  };

  const handleCreateDocumentConfirm = () => {
    console.log(dynamicUuid,",",documentName)
    navigate(`/document/${dynamicUuid}?name=${encodeURIComponent(documentName)}`);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("jwtToken");
    setToken(storedToken);
  }, []); // Empty dependency array to run the effect only once


  const actions = [
    { label: "About", icon: <FcAbout />, onClick: console.log },
    { label: "Profile", icon: <FcBusinessman />, onClick: console.log },
    { label: "Picture", icon: <FcCamera />, onClick: console.log },
    { label: "Trash", icon: <FcFullTrash />, onClick: console.log },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '2px solid red', height: '100vh' }}>
      <Typography align="center">Hi {token}</Typography>
      <Button onClick={handleCreateDocument}>
        Create a Document
      </Button>
      <Fab actions={actions} />
      <Dialog open={open} onClose={handleDialogClose}>
        <DialogTitle>Create a Document</DialogTitle>
        <DialogContent>
          <DialogContentText>Enter the document name:</DialogContentText>
          <input type="text" value={documentName} onChange={(e) => setDocumentName(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleCreateDocumentConfirm} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Dashboard;
