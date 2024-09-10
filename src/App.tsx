import React from 'react';
import './App.css';
import { AppBar, Typography } from '@mui/material';
import EquipmentView from './components/EquipmentView';

function App() {  
  return (
    <div className="App">      
      <header className="CESMII SMIP Demo App">        
      </header>
      <AppBar position="static">
          <Typography variant="h1" component="h1">
            CESMII SMIP Demo App 
          </Typography>
        </AppBar>
        <EquipmentView />
    </div>
  );
}

export default App;
