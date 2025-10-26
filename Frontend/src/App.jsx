import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./paginas/AppRouter";

function App() {
  return (
    <AuthProvider>
      <AppRouter/>
    </AuthProvider>
  );
}

export default App;