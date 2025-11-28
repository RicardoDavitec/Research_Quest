import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Researchers from './pages/Researchers';
import Subgroups from './pages/Subgroups';
import Roles from './pages/Roles';
import Questions from './pages/Questions';
import './App.css';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/researchers"
          element={
            <PrivateRoute>
              <div className="app-layout">
                <Sidebar />
                <Researchers />
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/subgroups"
          element={
            <PrivateRoute>
              <div className="app-layout">
                <Sidebar />
                <Subgroups />
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/roles"
          element={
            <PrivateRoute>
              <div className="app-layout">
                <Sidebar />
                <Roles />
              </div>
            </PrivateRoute>
          }
        />
        <Route
          path="/questions"
          element={
            <PrivateRoute>
              <div className="app-layout">
                <Sidebar />
                <Questions />
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
