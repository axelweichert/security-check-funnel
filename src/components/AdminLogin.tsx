import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrentLang } from '@/stores/useLangStore';
import { t } from '@/lib/i18n';
interface AdminLoginProps {
  onLoginSuccess: () => void;
}
const AdminLogin = ({ onLoginSuccess }: AdminLoginProps) => {
  const lang = useCurrentLang();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'wmG7V6BNifmGjv7rEkh2') {
      localStorage.setItem('admin_auth', JSON.stringify({ user: username, pass: password }));
      onLoginSuccess();
    } else {
      setError(t(lang, 'loginError'));
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">{t(lang, 'loginTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">{t(lang, 'loginUser')}</Label>
                <Input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password">{t(lang, 'loginPass')}</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <Button type="submit" className="w-full">{t(lang, 'loginButton')}</Button>
              <Button type="button" variant="link" className="w-full" onClick={() => navigate('/')}>{t(lang, 'backToHome')}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default AdminLogin;