import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, BookOpen, Heart, Share2, List, MapPin, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { BooksAPI } from '../../api/books';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { api } from '../../api';

export default function BookDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loans, holds, setHolds } = useAuth();
  const [book, setBook] = useState<any>(null);
  const [similarBooks, setSimilarBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBook() {
      if (!id) return;

      try {
        const bookResponse = await BooksAPI.getOne(id);
        const currentBook = bookResponse?.data ?? bookResponse;

        if (!currentBook) {
          setBook(null);
          return;
        }

        setBook(currentBook);

        const allBooksResponse = await BooksAPI.getAll();
        const allBooks = allBooksResponse?.data ?? allBooksResponse;

        setSimilarBooks(
          allBooks
            .filter(
              (b: any) =>
                b.id !== currentBook.id &&
                (b.category === currentBook.category ||
                  b.subjects.some((subject: string) =>
                    currentBook.subjects.includes(subject)
                  ))
            )
            .slice(0, 4)
        );
      } catch (err) {
        console.error('Failed to load book details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBook();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        Loading book details…
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Book Not Found</h2>
            <p className="text-gray-600 mb-4">The book you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/catalog')}>Back to Catalog</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check user's relationship with this book
  const currentLoan = loans.find(loan => loan.bookTitle === book.title);
  const currentHold = holds.find(hold => hold.bookTitle === book.title);
  const hasPreviouslyBorrowed = false; // In a real app, this would check history

  // Calculate total copies
  const totalCopies = book.branches.reduce((sum: any, branch: { total: any; }) => sum + branch.total, 0);
  const availableCopies = book.branches.reduce((sum: any, branch: { available: any; }) => sum + branch.available, 0);

  // Simulate different statuses for branches
  const getBranchStatus = (branch: typeof book.branches[0]) => {
    if (branch.available > 0) return 'Available';
    // Randomly assign "In Transit" or "Checked Out" for unavailable items
    return Math.random() > 0.7 ? 'In Transit' : 'Checked Out';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'In Transit':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Checked Out':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Generate call numbers (in a real app, these would come from the database)
  const getCallNumber = (category: string, author: string) => {
    const categoryCode = category.substring(0, 3).toUpperCase();
    const authorCode = author.split(' ').pop()?.substring(0, 3).toUpperCase() || 'XXX';
    return `${categoryCode} ${authorCode}`;
  };

  const callNumber = getCallNumber(book.category, book.author);

  const handleBorrow = () => {
    if (!user) {
      toast.error('Please log in to borrow books');
      return;
    }
    if (availableCopies === 0) {
      toast.error('This book is currently unavailable');
      return;
    }
    toast.success(`"${book.title}" has been added to your loans`);
  };

  const handlePlaceHold = async (branchName?: string) => {
    if (!user) {
      toast.error("Please log in to place holds");
      return;
    }

    try {
      const res = await api.post("/api/holds", {
        patronId: user.id,
        bookId: book.id,
      });

      // Update global holds in AuthContext
      if (res.data?.holds) {
        // This updates the holds everywhere (including MyAccount)
        setHolds(res.data.holds);
      }

      const message = branchName
        ? `Hold placed for "${book.title}" at ${branchName}`
        : `Hold placed for "${book.title}"`;

      toast.success(message);
    } catch (err) {
      console.error(err);
      toast.error("Failed to place hold");
    }
  };


  const handleAddToList = () => {
    if (!user) {
      toast.error('Please log in to save books to your reading list');
      return;
    }
    toast.success(`"${book.title}" added to your reading list`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: `Check out "${book.title}" by ${book.author}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/catalog" className="hover:text-blue-600">Catalog</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{book.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/catalog')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Catalog
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Book Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Book Cover */}
                  <div className="w-48 flex-shrink-0">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full rounded-lg shadow-md"
                    />
                  </div>

                  {/* Book Info */}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                    <p className="text-xl text-gray-700 mb-4">{book.author}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-600">Published:</span>
                        <span className="ml-2 font-medium">{book.year}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Format:</span>
                        <span className="ml-2 font-medium">{book.format}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">ISBN:</span>
                        <span className="ml-2 font-medium">{book.isbn}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Category:</span>
                        <span className="ml-2 font-medium">{book.category}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Call Number:</span>
                        <span className="ml-2 font-medium">{callNumber}</span>
                      </div>
                    </div>

                    {/* Subject Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {book.subjects.map((subject: string) => (
                        <Badge key={subject} variant="secondary">
                          {subject}
                        </Badge>
                      ))}
                    </div>

                    {/* User's Relationship with Book */}
                    {user && (currentLoan || currentHold || hasPreviouslyBorrowed) && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-2">
                          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div className="text-sm">
                            {currentLoan && (
                              <p className="text-blue-900">
                                <span className="font-semibold">You currently have this book checked out.</span>
                                <br />
                                Due date: {new Date(currentLoan.dueDate).toLocaleDateString()}
                              </p>
                            )}
                            {currentHold && (
                              <p className="text-blue-900">
                                <span className="font-semibold">You have an active hold on this book.</span>
                                <br />
                                {currentHold.status === 'ready' 
                                  ? 'Ready for pickup!' 
                                  : `Position #${currentHold.position} in queue`}
                              </p>
                            )}
                            {hasPreviouslyBorrowed && !currentLoan && !currentHold && (
                              <p className="text-blue-900">
                                You've borrowed this book before.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {availableCopies > 0 && !currentLoan ? (
                        <Button onClick={handleBorrow} size="lg">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Borrow Now
                        </Button>
                      ) : !currentLoan && (
                        <Button onClick={() => handlePlaceHold()} size="lg" variant="outline">
                          Place Hold
                        </Button>
                      )}
                      <Button onClick={handleAddToList} variant="outline" size="lg">
                        <List className="w-4 h-4 mr-2" />
                        Add to Reading List
                      </Button>
                      <Button onClick={handleShare} variant="outline" size="lg">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Description */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                  <p className="text-gray-700 leading-relaxed">{book.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Availability Table */}
            <Card>
              <CardHeader>
                <CardTitle>Availability Across Branches</CardTitle>
                <CardDescription>
                  {availableCopies} of {totalCopies} {totalCopies === 1 ? 'copy' : 'copies'} available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Branch</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Copies</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Call Number</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {book.branches.map((branch: { name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; available: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; total: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }, index: Key | null | undefined) => {
                        const status = getBranchStatus(branch);
                        return (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-900">{branch.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge 
                                variant="outline" 
                                className={`${getStatusColor(status)} border`}
                              >
                                {status}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-gray-700">
                                {branch.available} / {branch.total}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-mono text-sm text-gray-600">{callNumber}</span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              {!currentLoan && (
                                <Button
                                  size="sm"
                                  variant={status === 'Available' ? 'default' : 'outline'}
                                  onClick={() => handlePlaceHold(typeof branch.name === 'string' ? branch.name : undefined)}
                                >
                                  {status === 'Available' ? 'Borrow' : 'Place Hold'}
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={handleAddToList}>
                  <Heart className="w-4 h-4 mr-2" />
                  Save to Favorites
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share This Book
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Info className="w-4 h-4 mr-2" />
                  Report an Issue
                </Button>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Genre:</span>
                  <span className="ml-2 font-medium text-gray-900">{book.category}</span>
                </div>
                <div>
                  <span className="text-gray-600">Format:</span>
                  <span className="ml-2 font-medium text-gray-900">{book.format}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Copies:</span>
                  <span className="ml-2 font-medium text-gray-900">{totalCopies}</span>
                </div>
                <div>
                  <span className="text-gray-600">Language:</span>
                  <span className="ml-2 font-medium text-gray-900">English</span>
                </div>
              </CardContent>
            </Card>

            {/* Similar Titles */}
            {similarBooks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Similar Titles</CardTitle>
                  <CardDescription>Books you might also enjoy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {similarBooks.map(similar => (
                    <div
                      key={similar.id}
                      className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      onClick={() => navigate(`/catalog/${similar.id}`)}
                    >
                      <img
                        src={similar.coverImage}
                        alt={similar.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                          {similar.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-1">{similar.author}</p>
                        <Badge variant="secondary" className="text-xs">
                          {similar.format}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
