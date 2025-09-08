import { useState, useEffect } from 'react';
import CampusMap from '~/Components/CampusMap';

interface Building {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  building_code?: string;
}

interface Meeting {
  id: number | string;
  days: string[];
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  room?: string | null;
}

interface Course {
  id: number | string;
  title: string;
  buildingId?: number | null;
  buildingCode?: string | null;
  meetings: Meeting[];
}

export default function Dashboard() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [scheduleCourses, setScheduleCourses] = useState<Course[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState('');

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }
    
    fetchBuildings();
    fetchSchedule();
  }, []);

  const fetchBuildings = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/buildings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch buildings');
      }

      const data = await response.json();
      
      // Check for buildings with missing coordinates
      const invalidBuildings = data.buildings.filter((b: any) => 
        !b.latitude || !b.longitude || 
        typeof b.latitude !== 'number' || 
        typeof b.longitude !== 'number'
      );
      
      if (invalidBuildings.length > 0) {
        console.warn('Buildings with invalid coordinates:', invalidBuildings);
      }
      
      setBuildings(data.buildings);
    } catch (err) {
      console.error('Error fetching buildings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load buildings');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/schedule', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch schedule');
      }
      const data = await response.json();
      if (Array.isArray(data.courses) && data.courses.length > 0) {
        setScheduleCourses(data.courses);
      } else {
        // Fallback to localStorage if server has no schedule yet
        const saved = localStorage.getItem('schedule:courses');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            // migrate if needed
            const migrated: Course[] = parsed.map((c: any) => {
              if (Array.isArray(c.meetings)) return c as Course;
              const meeting: Meeting = {
                id: crypto.randomUUID(),
                days: Array.isArray(c.days) ? c.days : [],
                startTime: typeof c.startTime === 'string' ? c.startTime : '',
                endTime: typeof c.endTime === 'string' ? c.endTime : '',
              };
              const { days, startTime, endTime, ...rest } = c;
              return { ...rest, meetings: [meeting] } as Course;
            });
            setScheduleCourses(migrated);
          } catch {
            setScheduleCourses([]);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setScheduleError(err instanceof Error ? err.message : 'Failed to load schedule');
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleBuildingClick = (building: Building) => {
    setSelectedBuilding(building);
  };

  const findBuildingForCourse = (course: Course): Building | null => {
    if (course.buildingId) {
      const byId = buildings.find(b => b.id === course.buildingId);
      if (byId) return byId;
    }
    if (course.buildingCode) {
      const byCode = buildings.find(b => (b.building_code || '').toLowerCase() === course.buildingCode!.toLowerCase());
      if (byCode) return byCode;
    }
    return null;
  };

  const goToCourseBuilding = (course: Course) => {
    const b = findBuildingForCourse(course);
    if (b) setSelectedBuilding(b);
  };

  const todayKey = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];
  const parseTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const todaysMeetings = scheduleCourses.flatMap(course =>
    (course.meetings || [])
      .filter(m => Array.isArray(m.days) && m.days.includes(todayKey))
      .map(m => ({ course, meeting: m }))
  ).sort((a, b) => parseTime(a.meeting.startTime) - parseTime(b.meeting.startTime));

  // Filter buildings based on search only
  const filteredBuildings = buildings.filter(building => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      building.name.toLowerCase().includes(lowerSearch) ||
      (building.building_code && building.building_code.toLowerCase().includes(lowerSearch))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-purple-900/20 to-neutral-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-purple-900/20 to-neutral-950 flex items-center justify-center">
        <div className="bg-black/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button 
            onClick={fetchBuildings}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-purple-900/20 to-neutral-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/10 backdrop-blur-md border-b border-white/20 p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 group">
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              CampusNav
            </span>
            <span className="text-sm text-gray-400 hidden md:block">Dashboard</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 font-semibold"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-2 md:mb-4">
              SCSU Campus Map
            </h1>
            <p className="text-base md:text-xl text-gray-300">
              Navigate your campus with ease • {buildings.length} buildings available
            </p>
          </div>

       

          {/* Search Section - Mobile Optimized */}
          <div className="bg-black/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-6 shadow-2xl mb-6 md:mb-8">
            <div className="flex flex-col gap-4">
              {/* Search Input */}
              <div className="w-full">
                <input
                  type="text"
                  placeholder="Search buildings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-3 md:py-4 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base md:text-lg"
                />
              </div>
              
              {/* Filter Buttons - Mobile Optimized */}
              
              {/* Search Results List */}
              {searchTerm.trim().length > 0 && (
                <div className="bg-black/20 border border-white/10 rounded-xl p-3 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm md:text-base text-gray-300">
                      {filteredBuildings.length} result{filteredBuildings.length !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-xs md:text-sm text-gray-400 hover:text-gray-200 underline"
                    >
                      Clear
                    </button>
                  </div>
                  {filteredBuildings.length === 0 ? (
                    <div className="text-gray-400 text-sm">No buildings match your search.</div>
                  ) : (
                    <ul className="max-h-56 overflow-auto divide-y divide-white/10">
                      {filteredBuildings.slice(0, 12).map((b) => (
                        <li key={b.id}>
                          <button
                            onClick={() => setSelectedBuilding(b)}
                            className={`w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg flex items-center justify-between ${selectedBuilding?.id === b.id ? 'bg-white/10' : ''}`}
                          >
                            <div>
                              <div className="text-white text-sm md:text-base font-medium">{b.name}</div>
                              {b.building_code && (
                                <div className="text-xs text-gray-400">Code: {b.building_code}</div>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">Select</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Today's Classes */}
          <div className="bg-black/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-6 shadow-2xl mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg md:text-xl font-semibold text-purple-300">Today's Classes</h2>
              {scheduleLoading && <span className="text-xs text-gray-400">Loading…</span>}
              {!scheduleLoading && scheduleError && <span className="text-xs text-red-400">{scheduleError}</span>}
            </div>
            {todaysMeetings.length === 0 ? (
              <div className="text-gray-400 text-sm">No classes scheduled for today.</div>
            ) : (
              <ul className="divide-y divide-white/10">
                {todaysMeetings.map(({ course, meeting }, idx) => {
                  const b = findBuildingForCourse(course);
                  return (
                    <li key={`${course.id}-${meeting.id}`} className="py-2 flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm md:text-base font-medium">{course.title}</div>
                        <div className="text-xs text-gray-400">
                          {meeting.startTime} - {meeting.endTime}
                          {b ? ` • ${b.building_code || b.name}` : course.buildingCode ? ` • ${course.buildingCode}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => goToCourseBuilding(course)}
                          className="text-xs text-blue-300 hover:text-blue-200 underline"
                        >
                          Go
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Interactive Map Section */}
          <div className="bg-black/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-8 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6">
              <h2 className="text-lg md:text-2xl font-semibold text-purple-300 text-center md:text-left">
                🗺️ Interactive Campus Map
              </h2>
            </div>
            
            <div className="mb-6">
              <CampusMap 
                buildings={filteredBuildings} 
                selectedBuilding={selectedBuilding}
                onBuildingClick={handleBuildingClick}
              />
            </div>

            {/* Map Legend */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 text-xs md:text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-purple-600 rounded-full border-2 border-white"></div>
                <span>Building Location</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-600 rounded-full border-2 border-white"></div>
                <span>Click for Details</span>
              </div>
            </div>
          </div>



          
        </div>
      </div>
    </div>
  );
}