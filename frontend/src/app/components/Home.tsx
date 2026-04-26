import { Search, BookOpen, Calendar, User, MapPin, MonitorPlay, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const featuredBooks = [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      description: "A classic American novel about the Jazz Age",
      image: "https://images.unsplash.com/photo-1706271948813-4d2c904af4d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwYm9vayUyMGNvdmVyfGVufDF8fHx8MTc3NDQ5MzU4OHww&ixlib=rb-4.1.0&q=80&w=1080",
      type: "Popular"
    },
    {
      id: 2,
      title: "Modern Fiction Collection",
      author: "Various Authors",
      description: "Discover our latest arrivals in contemporary literature",
      image: "https://images.unsplash.com/photo-1755545730104-3cb4545282b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBub3ZlbCUyMGhhcmRjb3ZlcnxlbnwxfHx8fDE3NzQ1NjgxNDV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      type: "New Arrival"
    },
    {
      id: 3,
      title: "Book Club Meeting",
      author: "Community Event",
      description: "Join us for our monthly book club discussion",
      image: "https://images.unsplash.com/photo-1761475049757-83131d939525?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBnYXRoZXJpbmclMjByZWFkaW5nfGVufDF8fHx8MTc3NDU2ODE0OHww&ixlib=rb-4.1.0&q=80&w=1080",
      type: "Event"
    },
    {
      id: 4,
      title: "Library Collection",
      author: "Staff Picks",
      description: "Curated recommendations from our librarians",
      image: "https://images.unsplash.com/photo-1660479123634-2c700dfbbbdb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWJyYXJ5JTIwYm9va3MlMjBzdGFja3xlbnwxfHx8fDE3NzQ1NjgxNDR8MA&ixlib=rb-4.1.0&q=80&w=1080",
      type: "Featured"
    }
  ];

  const quickAccessItems = [
    {
      icon: BookOpen,
      title: "View My Loans",
      description: "Check your borrowed items",
      link: "/my-account"
    },
    {
      icon: Calendar,
      title: "Upcoming Events",
      description: "Browse library programs",
      link: "/events"
    },
    {
      icon: MapPin,
      title: "Find a Branch",
      description: "Locate nearby libraries",
      link: "#"
    },
    {
      icon: MonitorPlay,
      title: "Digital Resources",
      description: "Access online materials",
      link: "#"
    }
  ];

  return (
    <div className="w-full">
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Your Public Library
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Discover books, events, and resources for your community
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search books, authors, or subjects…"
              className="pl-12 h-14 text-lg shadow-lg border-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Content</h2>
          <Link to="/catalog" className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBooks.map((book) => (
            <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="text-xs font-semibold text-blue-600 mb-2">{book.type}</div>
                <CardTitle className="text-lg">{book.title}</CardTitle>
                <CardDescription>{book.author}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-2">{book.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Access Panel */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Quick Access</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickAccessItems.map((item, index) => (
              <Link
                key={index}
                to={item.link}
                className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow border border-gray-200 group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
                  <item.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="bg-blue-600 text-white border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-white mb-4">
              Get Your Library Card Today
            </CardTitle>
            <CardDescription className="text-blue-100 text-lg">
              Access thousands of books, digital resources, and community events
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link to="/login">
              <Button size="lg" variant="secondary" className="font-semibold">
                Sign Up Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}