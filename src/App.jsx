// src/App.jsx
// Componente principal con las rutas de la aplicación

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import CourseList from './components/CourseList';
import Simulator from './components/Simulator';

// Componente para proteger rutas
function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route 
            path="/courses" 
            element={
              <PrivateRoute>
                <CourseList />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/grades/:studentId/:courseId" 
            element={
              <PrivateRoute>
                <Simulator />
              </PrivateRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;