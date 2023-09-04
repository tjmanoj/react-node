import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './pages/Layout';
import Logster from './pages/Logster'
import Dashboard from './components/Dashboard';
import Home from './pages/Home';
import TextEditor from './components/TextEditor/TextEditor'

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path='logster' element={<Logster />}></Route>
            <Route path='dashboard' element={<Dashboard />}></Route>
            <Route path='document' element={<TextEditor />}>
              <Route path=":id" element={<TextEditor />} />
            </Route>
            {/* <Route path="*" element={<NoPage />} /> */}
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;