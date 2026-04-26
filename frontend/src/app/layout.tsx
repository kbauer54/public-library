import { Outlet, useNavigate } from 'react-router';
import { Link, useLocation } from 'react-router';
import { 
  LogOut, 
  LogIn, 
  BookOpen, 
  Copy, 
  Users, 
  Calendar,
  LayoutDashboard,
  Power
} from 'lucide-react';
import { Button } from './components/ui/button';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navItems = [
    { path: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/staff/check-out', label: 'Check Out', icon: LogOut },
    { path: '/staff/check-in', label: 'Check In', icon: LogIn },
    { path: '/staff/catalog', label: 'Manage Catalog', icon: BookOpen },
    { path: '/staff/copies', label: 'Manage Copies', icon: Copy },
    { path: '/staff/patrons', label: 'Patron Lookup', icon: Users },
    { path: '/staff/events', label: 'Event Management', icon: Calendar },
  ];

  const handleLogout = () => {
    localStorage.removeItem('staffAuthenticated');
    localStorage.removeItem('staffUser');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Fixed Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col">
        <div className="p-6 border-b border-neutral-200">
          <h1 className="font-semibold text-xl">Staff Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">Library Management</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-neutral-200">
          <div className="text-sm text-neutral-600 mb-3">
            <p className="font-medium">Staff User</p>
            <p className="text-neutral-500">Main Branch</p>
          </div>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleLogout}
          >
            <Power className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}