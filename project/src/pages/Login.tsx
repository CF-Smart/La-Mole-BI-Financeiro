import React from 'react';
import { dataService } from '../services/dataService';
import Logo from '../components/La Mole.jpg';

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
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="h-20 w-20 bg-white rounded-2xl ring-2 ring-blue-300 shadow flex items-center justify-center">
            <img src={Logo} alt="La Mole" className="h-16 w-16 object-contain" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">La Mole</h1>
          <p className="text-sm text-blue-200">Financial BI</p>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-2xl shadow-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Entrar</h2>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm text-blue-200 mb-1">Usuário</label>
              <input
                className="w-full px-3 py-2 rounded-lg bg-white/90 text-gray-900 placeholder-gray-500 outline-none ring-2 ring-transparent focus:ring-blue-400 border border-transparent"
                placeholder="cfsmart ou lamole"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-blue-200 mb-1">Senha</label>
              <input
                type="password"
                className="w-full px-3 py-2 rounded-lg bg-white/90 text-gray-900 placeholder-gray-500 outline-none ring-2 ring-transparent focus:ring-blue-400 border border-transparent"
                placeholder="sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-xs text-red-300 bg-red-900/30 border border-red-500/30 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
            >
              Acessar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;



