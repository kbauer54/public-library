import { LoansAPI } from "../../api/loans";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Search, Filter, BookOpen, MapPin, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

import { BooksAPI } from "../../api/books";
import { BranchesAPI } from "../../api/branches";

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // API Data
  const [books, setBooks] = useState<any[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const initialSearch = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState<{ min: string; max: string }>({
    min: "",
    max: "",
  });
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Load API Data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const [booksRes, branchesRes] = await Promise.all([
          BooksAPI.getAll(),
          BranchesAPI.getAll(),
        ]);

        setBooks(booksRes.data);
        setBranches(branchesRes.data.map((b: any) => b.name));
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load catalog data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Derived values
  const formats = useMemo(
    () => Array.from(new Set(books.map((b) => b.format))).sort(),
    [books]
  );

  const categories = useMemo(
    () => Array.from(new Set(books.map((b) => b.category))).sort(),
    [books]
  );

  const years = useMemo(() => {
    if (books.length === 0) return { min: 0, max: 0 };
    const allYears = books.map((b) => b.year);
    return { min: Math.min(...allYears), max: Math.max(...allYears) };
  }, [books]);

  // Filtering
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        searchQuery === "" ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.subjects.some((s: string) =>
          s.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesBranch =
        selectedBranches.length === 0 ||
        book.branches.some((b: any) => selectedBranches.includes(b.name));

      const matchesFormat =
        selectedFormats.length === 0 ||
        selectedFormats.includes(book.format);

      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(book.category);

      const matchesYear =
        (yearRange.min === "" || book.year >= parseInt(yearRange.min)) &&
        (yearRange.max === "" || book.year <= parseInt(yearRange.max));

      const matchesAvailability =
        !showOnlyAvailable || book.available === true;

      return (
        matchesSearch &&
        matchesBranch &&
        matchesFormat &&
        matchesCategory &&
        matchesYear &&
        matchesAvailability
      );
    });
  }, [
    books,
    searchQuery,
    selectedBranches,
    selectedFormats,
    selectedCategories,
    yearRange,
    showOnlyAvailable,
  ]);

  // Helpers
  const getTotalCopies = (book: any) =>
    book.branches.reduce((sum: number, b: any) => sum + b.total, 0);

  const getAvailableCopies = (book: any) =>
    book.branches.reduce((sum: number, b: any) => sum + b.available, 0);

  const handleBorrow = async (book: any) => {
    if (!user) return toast.error("Please log in to borrow books");
    if (!book.available) return toast.error("This book is unavailable");

    try {
      await LoansAPI.create(book.id, user.id);
      toast.success(`"${book.title}" added to your loans! Due in 14 days.`);
    } catch (err) {
      toast.error("Failed to borrow book. Please try again.");
    }
  };

  const handlePlaceHold = (book: any) => {
    if (!user) return toast.error("Please log in to place holds");
    toast.success(`Hold placed for "${book.title}"`);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedBranches([]);
    setSelectedFormats([]);
    setSelectedCategories([]);
    setYearRange({ min: "", max: "" });
    setShowOnlyAvailable(false);
    setSearchParams({});
  };

  const hasActiveFilters =
    searchQuery ||
    selectedBranches.length > 0 ||
    selectedFormats.length > 0 ||
    selectedCategories.length > 0 ||
    yearRange.min ||
    yearRange.max ||
    showOnlyAvailable;

  // Loading + Error UI
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading catalog…
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        {error}
      </div>
    );

  // UI
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-80 bg-gray-50 border-r border-gray-200 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-900">Filters</h2>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            )}
          </div>

          {/* Availability */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Availability</h3>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="available"
                checked={showOnlyAvailable}
                onCheckedChange={(checked) =>
                  setShowOnlyAvailable(checked as boolean)
                }
              />
              <Label htmlFor="available" className="text-sm cursor-pointer">
                Show only available items
              </Label>
            </div>
          </div>

          {/* Branch Filter */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Branch</h3>
            <div className="space-y-2">
              {branches.map((branch) => (
                <div key={branch} className="flex items-center space-x-2">
                  <Checkbox
                    id={`branch-${branch}`}
                    checked={selectedBranches.includes(branch)}
                    onCheckedChange={() =>
                      setSelectedBranches((prev) =>
                        prev.includes(branch)
                          ? prev.filter((b) => b !== branch)
                          : [...prev, branch]
                      )
                    }
                  />
                  <Label
                    htmlFor={`branch-${branch}`}
                    className="text-sm cursor-pointer"
                  >
                    {branch}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Format Filter */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Format</h3>
            <div className="space-y-2">
              {formats.map((format) => (
                <div key={format} className="flex items-center space-x-2">
                  <Checkbox
                    id={`format-${format}`}
                    checked={selectedFormats.includes(format)}
                    onCheckedChange={() =>
                      setSelectedFormats((prev) =>
                        prev.includes(format)
                          ? prev.filter((f) => f !== format)
                          : [...prev, format]
                      )
                    }
                  />
                  <Label
                    htmlFor={`format-${format}`}
                    className="text-sm cursor-pointer"
                  >
                    {format}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Genre / Subject</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() =>
                      setSelectedCategories((prev) =>
                        prev.includes(category)
                          ? prev.filter((c) => c !== category)
                          : [...prev, category]
                      )
                    }
                  />
                  <Label
                    htmlFor={`category-${category}`}
                    className="text-sm cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Year Filter */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Publication Year</h3>
            <div className="space-y-3">
              <div>
                <Label
                  htmlFor="year-min"
                  className="text-xs text-gray-600"
                >
                  From
                </Label>
                <Input
                  id="year-min"
                  type="number"
                  placeholder={`${years.min}`}
                  value={yearRange.min}
                  onChange={(e) =>
                    setYearRange((prev) => ({
                      ...prev,
                      min: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="year-max"
                  className="text-xs text-gray-600"
                >
                  To
                </Label>
                <Input
                  id="year-max"
                  type="number"
                  placeholder={`${years.max}`}
                  value={yearRange.max}
                  onChange={(e) =>
                    setYearRange((prev) => ({
                      ...prev,
                      max: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Library Catalog
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Browse our collection of {books.length} items
            </p>

            {/* Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                searchQuery
                  ? setSearchParams({ q: searchQuery })
                  : setSearchParams({});
              }}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by title, author, or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-lg"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchParams({});
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {filteredBooks.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {books.length}
              </span>{" "}
              results
              {hasActiveFilters && " (filtered)"}
            </p>
          </div>

          {/* Results */}
          {filteredBooks.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No books found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filters
              </p>
              {hasActiveFilters && (
                <Button onClick={clearAllFilters}>Clear All Filters</Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBooks.map((book) => {
                const availableCopies = getAvailableCopies(book);

                return (
                  <Card
                    key={book.id}
                    className="overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="flex">
                      <div className="w-32 flex-shrink-0 bg-gray-100">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '';
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.style.background = '#e5e7eb';
                          }}
                        />
                      </div>

                      <CardContent className="flex-1 p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {book.title}
                              </h3>
                              <Badge variant="secondary" className="text-xs">
                                {book.format}
                              </Badge>
                            </div>

                            <p className="text-gray-700 mb-2">
                              {book.author}
                            </p>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {book.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-2 text-sm text-gray-500">
                            <p>
                              {availableCopies} of {getTotalCopies(book)} copies available
                            </p>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {book.branches.map((branch: any) => branch.name).join(", ")}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button onClick={() => handleBorrow(book)} disabled={!book.available}>
                              Borrow
                            </Button>
                            <Button variant="secondary" onClick={() => handlePlaceHold(book)}>
                              Place Hold
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

