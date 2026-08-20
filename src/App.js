import WebDesignRequirementsApp from './components/web-design-requirements-app';
import { AuthProvider } from './contexts/AuthContext';
import AuthGate from './components/auth/AuthGate';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <AuthGate>
          <WebDesignRequirementsApp />
        </AuthGate>
      </AuthProvider>
    </div>
  );
}

export default App;
