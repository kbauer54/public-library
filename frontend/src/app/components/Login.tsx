import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginStaff, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<'patron' | 'staff'>('patron');

  // Patron login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Staff login form state
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerCardNumber, setRegisterCardNumber] = useState('');
  const [registerPin, setRegisterPin] = useState('');

  const handlePatronLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(loginEmail, loginPassword);
      if (success) {
        toast.success('Welcome back!');
        navigate('/my-account');
      } else {
        toast.error('Invalid email or PIN. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await loginStaff(staffEmail, staffPassword);
      if (success) {
        // required for protected route
        localStorage.setItem('staffAuthenticated', 'true');

        toast.success('Staff login successful!');
        navigate('/staff/dashboard');
      } else {
        toast.error('Invalid email or password. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!registerName || !registerEmail || !registerCardNumber || !registerPin) {
      toast.error('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const success = await register(registerName, registerEmail, registerCardNumber, registerPin);
      if (success) {
        toast.success('Account created successfully!');
        navigate('/my-account');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            {isRegistering ? 'Create an Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-center">
            {isRegistering
              ? 'Register for a new library card'
              : loginType === 'patron'
              ? 'Sign in to your library account'
              : 'Staff portal access'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isRegistering && (
            <Tabs value={loginType} onValueChange={(value) => setLoginType(value as 'patron' | 'staff')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="patron">Patron Login</TabsTrigger>
                <TabsTrigger value="staff">Staff Login</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {!isRegistering ? (
            loginType === 'patron' ? (
              // Patron Login Form
              <form onSubmit={handlePatronLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            ) : (
              // Staff Login Form
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-email">Email Address</Label>
                  <Input
                    id="staff-email"
                    type="email"
                    placeholder="Enter your staff email"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-password">Password</Label>
                  <Input
                    id="staff-password"
                    type="password"
                    placeholder="Enter your password"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In as Staff'}
                </Button>
              </form>
            )
          ) : (
            // Register Form
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-card-number">Create Card Number</Label>
                <Input
                  id="new-card-number"
                  placeholder="Choose a card number"
                  value={registerCardNumber}
                  onChange={(e) => setRegisterCardNumber(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-pin">Create PIN</Label>
                <Input
                  id="new-pin"
                  type="password"
                  placeholder="Create a 4-digit PIN"
                  value={registerPin}
                  onChange={(e) => setRegisterPin(e.target.value)}
                  required
                  maxLength={4}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsRegistering(!isRegistering)}
            type="button"
          >
            {isRegistering ? 'Already have an account? Sign In' : 'Register for a Library Card'}
          </Button>

          {!isRegistering && (
            <p className="text-sm text-center text-gray-600">
              <a href="#" className="text-blue-600 hover:underline">
                {loginType === 'patron' ? 'Forgot your PIN?' : 'Forgot your password?'}
              </a>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}