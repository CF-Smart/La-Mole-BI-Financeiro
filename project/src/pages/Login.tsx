import React from 'react';
import { dataService } from '../services/dataService';

const Login: React.FC<{ onLogged?: () => void }> = ({ onLogged }) => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = dataService.login(username.trim(), password.trim());
    if (!res.success) {
      setError(res.message || 'Falha no login');
      return;
    }
    setError(null);
    onLogged && onLogged();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 w-full max-w-sm p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Acessar</h1>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Usuário</label>
            <input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Senha</label>
            <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <div className="text-xs text-red-600">{error}</div>}
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default Login;



