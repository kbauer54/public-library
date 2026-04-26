import { useState, useMemo, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Search, BookMarked, Laptop, Baby, GraduationCap, BriefcaseIcon, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

type Event = {
  id: number;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  category: 'Workshop' | 'Reading' | 'Kids' | 'Teen' | 'Adult' | 'Tech';
  ageGroup: string;
  capacity: number;
  registered: number;
  isFeatured?: boolean;
  isFree?: boolean;
  requiresRegistration?: boolean;
};

export default function Events() {
  const { user } = useAuth();

  // NEW: events from Railway API
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [ageGroupFilter, setAgeGroupFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const categories = ['all', 'Workshop', 'Reading', 'Kids', 'Teen', 'Adult', 'Tech'];
  const ageGroups = ['all', 'All Ages', 'Children (0-12)', 'Teens (13-17)', 'Adults (18+)', 'Seniors (65+)'];

  // ⭐ NEW: Fetch events from Railway backend
  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events`);
        if (!res.ok) throw new Error("Failed to fetch events");

        const json = await res.json();
        setEvents(json.data);
      } catch (err) {
        setError("Unable to load events");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  // Category icon
  const getCategoryIcon = (category: Event['category']) => {
    const iconClass = 'w-5 h-5';
    switch (category) {
      case 'Workshop': return <BriefcaseIcon className={iconClass} />;
      case 'Reading': return <BookMarked className={iconClass} />;
      case 'Kids': return <Baby className={iconClass} />;
      case 'Teen': return <GraduationCap className={iconClass} />;
      case 'Tech': return <Laptop className={iconClass} />;
      default: return <Calendar className={iconClass} />;
    }
  };

  const getCategoryColor = (category: Event['category']) => {
    const colors = {
      Workshop: 'bg-blue-100 text-blue-700 border-blue-200',
      Reading: 'bg-purple-100 text-purple-700 border-purple-200',
      Kids: 'bg-green-100 text-green-700 border-green-200',
      Teen: 'bg-orange-100 text-orange-700 border-orange-200',
      Adult: 'bg-pink-100 text-pink-700 border-pink-200',
      Tech: 'bg-cyan-100 text-cyan-700 border-cyan-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // real events
  const filteredEvents = useMemo(() => {
    const now = new Date();

    return events
      .filter(event => {
        const eventDate = new Date(event.date);

        const matchesSearch =
          searchQuery === '' ||
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesBranch = branchFilter === 'all' || event.location === branchFilter;
        const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
        const matchesAgeGroup = ageGroupFilter === 'all' || event.ageGroup === ageGroupFilter;

        let matchesDate = true;
        if (dateFilter === 'thisWeek') {
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          matchesDate = eventDate >= now && eventDate <= weekFromNow;
        } else if (dateFilter === 'thisMonth') {
          matchesDate =
            eventDate.getMonth() === now.getMonth() &&
            eventDate.getFullYear() === now.getFullYear();
        } else if (dateFilter === 'nextMonth') {
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          matchesDate =
            eventDate.getMonth() === nextMonth.getMonth() &&
            eventDate.getFullYear() === nextMonth.getFullYear();
        }

        return (
          matchesSearch &&
          matchesBranch &&
          matchesCategory &&
          matchesAgeGroup &&
          matchesDate
        );
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, searchQuery, branchFilter, categoryFilter, ageGroupFilter, dateFilter]);

  //  Group events by date
  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: Event[] } = {};
    filteredEvents.forEach(event => {
      const date = new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(event);
    });
    return groups;
  }, [filteredEvents]);

  // Featured events from API
  const featuredEvents = useMemo(
    () => events.filter(event => event.isFeatured).slice(0, 3),
    [events]
  );

  const handleRegister = (event: Event) => {
    if (!user) {
      toast.error('Please log in to register for events');
      return;
    }
    if (event.registered >= event.capacity) {
      toast.error('This event is fully booked');
      return;
    }
    toast.success(`Successfully registered for "${event.title}"`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading + error UI
  if (loading) return <p className="p-6">Loading events…</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Upcoming Events</h1>
          <p className="text-lg text-gray-600">
            Discover library programs, workshops, and community activities
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filter Bar */}
            <Card>
              <CardContent className="p-6">
                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Search events by keyword..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1.5 block">Branch</label>
                    <Select value={branchFilter} onValueChange={setBranchFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {Array.from(new Set(events.map(e => e.location))).map(branch => (
                          <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1.5 block">Category</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {cat === 'all' ? 'All Categories' : cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1.5 block">Age Group</label>
                    <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ageGroups.map(age => (
                          <SelectItem key={age} value={age}>
                            {age === 'all' ? 'All Ages' : age}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1.5 block">Date</label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Upcoming</SelectItem>
                        <SelectItem value="thisWeek">This Week</SelectItem>
                        <SelectItem value="thisMonth">This Month</SelectItem>
                        <SelectItem value="nextMonth">Next Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Count */}
            <div>
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredEvents.length}</span> of{' '}
                <span className="font-semibold">{events.length}</span> events
              </p>
            </div>

            {/* Events List */}
            {filteredEvents.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedEvents).map(([date, events]) => (
                  <div key={date}>
                    {/* Date Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-px flex-1 bg-gray-300" />
                      <h2 className="text-lg font-semibold text-gray-900">{date}</h2>
                      <div className="h-px flex-1 bg-gray-300" />
                    </div>

                    {/* Events for this date */}
                    <div className="space-y-4">
                      {events.map(event => {
                        const spotsLeft = event.capacity - event.registered;
                        const isAlmostFull = spotsLeft <= 5 && spotsLeft > 0;
                        const isFull = spotsLeft <= 0;

                        return (
                          <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row">
                              {/* Date Badge (Mobile/Tablet) */}
                              <div className="sm:w-24 flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 sm:p-0 sm:flex sm:flex-col sm:items-center sm:justify-center">
                                <div className="flex sm:flex-col items-baseline sm:items-center gap-2 sm:gap-0">
                                  <span className="text-3xl sm:text-4xl font-bold">
                                    {new Date(event.date).getDate()}
                                  </span>
                                  <span className="text-sm sm:text-base uppercase">
                                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                                  </span>
                                </div>
                              </div>

                              {/* Event Details */}
                              <CardContent className="flex-1 p-6">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant="outline" className={`${getCategoryColor(event.category)} border`}>
                                        <span className="flex items-center gap-1.5">
                                          {getCategoryIcon(event.category)}
                                          <span>{event.category}</span>
                                        </span>
                                      </Badge>
                                      {event.isFeatured && (
                                        <Badge variant="outline" className="border-yellow-400 bg-yellow-50 text-yellow-700">
                                          <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                                          Featured
                                        </Badge>
                                      )}
                                    </div>

                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                                    {/* Event Meta */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                      <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span>{event.time}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span>{event.location}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span>{event.registered} / {event.capacity} registered</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">
                                          {event.ageGroup}
                                        </Badge>
                                      </div>
                                    </div>

                                    {/* Event Status Tags */}
                                    <div className="flex flex-wrap gap-2 mt-3">
                                      {event.isFree && (
                                        <Badge variant="outline" className="text-xs border-green-500 text-green-700 bg-green-50">
                                          Free Event
                                        </Badge>
                                      )}
                                      {event.requiresRegistration && (
                                        <Badge variant="outline" className="text-xs border-blue-500 text-blue-700 bg-blue-50">
                                          Registration Required
                                        </Badge>
                                      )}
                                      {isAlmostFull && (
                                        <Badge variant="outline" className="text-xs border-orange-500 text-orange-700 bg-orange-50">
                                          Almost Full
                                        </Badge>
                                      )}
                                      {isFull && (
                                        <Badge variant="outline" className="text-xs border-red-500 text-red-700 bg-red-50">
                                          Fully Booked
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {/* Action Button */}
                                  <div className="flex-shrink-0">
                                    <Button
                                      onClick={() => handleRegister(event)}
                                      disabled={isFull}
                                      className="whitespace-nowrap"
                                    >
                                      {isFull ? 'Event Full' : 'Register'}
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Featured Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  Featured Events
                </CardTitle>
                <CardDescription>Don't miss these popular programs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {featuredEvents.map(event => (
                  <div
                    key={event.id}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Badge variant="outline" className={`${getCategoryColor(event.category)} border text-xs mb-2`}>
                      {event.category}
                    </Badge>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Registration</h4>
                  <p className="text-gray-600">
                    Most events require advance registration. Walk-ins are welcome when space permits.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Cancellations</h4>
                  <p className="text-gray-600">
                    Events may be cancelled due to low enrollment or inclement weather. Check your email for updates.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Contact Us</h4>
                  <p className="text-gray-600">
                    Questions? Call (555) 123-4567 or email events@publiclibrary.org
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
