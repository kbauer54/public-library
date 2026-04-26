import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { BookOpen, Clock, Package, User, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export default function MyAccount() {
  const { user, loans, holds, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>Account Access Required</CardTitle>
            <CardDescription>
              Please log in to view your account information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeLoans = loans.filter(loan => loan.status === 'active');
  const overdueLoans = loans.filter(loan => loan.status === 'overdue');
  const readyHolds = holds.filter(hold => hold.status === 'ready');
  const waitingHolds = holds.filter(hold => hold.status === 'waiting');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Account Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Account</h1>
            <p className="text-lg text-gray-600">Welcome back, {user.name}!</p>
          </div>
          <Button variant="outline" onClick={logout}>
            Sign Out
          </Button>
        </div>
      </div>

      {/* Account Info Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Card Number</p>
              <p className="font-semibold">{user.cardNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Member Since</p>
              <p className="font-semibold">{formatDate(user.memberSince)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Loans</CardDescription>
            <CardTitle className="text-3xl">{activeLoans.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Overdue Items</CardDescription>
            <CardTitle className="text-3xl text-red-600">{overdueLoans.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Ready for Pickup</CardDescription>
            <CardTitle className="text-3xl text-green-600">{readyHolds.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Holds</CardDescription>
            <CardTitle className="text-3xl">{waitingHolds.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs for Loans and Holds */}
      <Tabs defaultValue="loans" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="loans">My Loans</TabsTrigger>
          <TabsTrigger value="holds">My Holds</TabsTrigger>
        </TabsList>

        <TabsContent value="loans" className="mt-6">
          {overdueLoans.length > 0 && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Overdue Items
                </CardTitle>
                <CardDescription className="text-red-700">
                  Please return these items as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {overdueLoans.map(loan => {
                  const daysOverdue = Math.abs(getDaysUntilDue(loan.dueDate));
                  return (
                    <div key={loan.id} className="flex items-center justify-between p-4 bg-white rounded-lg">
                      <div className="flex items-center gap-4">
                        <BookOpen className="w-10 h-10 text-red-600" />
                        <div>
                          <h4 className="font-semibold text-gray-900">{loan.bookTitle}</h4>
                          <p className="text-sm text-gray-600">{loan.author}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive">
                          {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue
                        </Badge>
                        <p className="text-xs text-gray-600 mt-1">Due: {formatDate(loan.dueDate)}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {activeLoans.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Current Loans
                </CardTitle>
                <CardDescription>
                  {activeLoans.length} {activeLoans.length === 1 ? 'item' : 'items'} checked out
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeLoans.map(loan => {
                  const daysLeft = getDaysUntilDue(loan.dueDate);
                  const isDueSoon = daysLeft <= 3 && daysLeft > 0;

                  return (
                    <div key={loan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <BookOpen className="w-10 h-10 text-blue-600" />
                        <div>
                          <h4 className="font-semibold text-gray-900">{loan.bookTitle}</h4>
                          <p className="text-sm text-gray-600">{loan.author}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={isDueSoon ? 'outline' : 'secondary'} className={isDueSoon ? 'border-orange-500 text-orange-700' : ''}>
                          Due in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                        </Badge>
                        <p className="text-xs text-gray-600 mt-1">{formatDate(loan.dueDate)}</p>
                        <Button variant="link" size="sm" className="h-auto p-0 mt-1">
                          Renew
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : overdueLoans.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No active loans</h3>
                <p className="text-gray-600 mb-4">Browse the catalog to find your next read</p>
                <Button onClick={() => navigate('/catalog')}>
                  Browse Catalog
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="holds" className="mt-6">
          {readyHolds.length > 0 && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Ready for Pickup
                </CardTitle>
                <CardDescription className="text-green-700">
                  These items are waiting for you at the library
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {readyHolds.map(hold => (
                  <div key={hold.id} className="flex items-center justify-between p-4 bg-white rounded-lg">
                    <div className="flex items-center gap-4">
                      <Package className="w-10 h-10 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{hold.bookTitle}</h4>
                        <p className="text-sm text-gray-600">{hold.author}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-600">Ready</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {waitingHolds.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Waiting for Items
                </CardTitle>
                <CardDescription>
                  {waitingHolds.length} {waitingHolds.length === 1 ? 'item' : 'items'} on hold
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {waitingHolds.map(hold => (
                  <div key={hold.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Clock className="w-10 h-10 text-gray-600" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{hold.bookTitle}</h4>
                        <p className="text-sm text-gray-600">{hold.author}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        Position #{hold.position}
                      </Badge>
                      <Button variant="link" size="sm" className="h-auto p-0 mt-1 block">
                        Cancel Hold
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : readyHolds.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No active holds</h3>
                <p className="text-gray-600 mb-4">Place a hold on popular items</p>
                <Button onClick={() => navigate('/catalog')}>
                  Browse Catalog
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}