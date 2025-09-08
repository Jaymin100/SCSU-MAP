import { useEffect, useMemo, useState } from "react";

type Building = {
  id: number;
  name: string;
  building_code?: string;
};

type Meeting = {
  id: string;
  days: string[];
  startTime: string;
  endTime: string;
};

type Course = {
  id: string;
  title: string;
  buildingId?: number;
  buildingCode?: string;
  meetings: Meeting[];
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri","Sat","Sun"] as const;

export default function Schedule() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("schedule:courses");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const migrated: Course[] = parsed.map((c: any) => {
          if (Array.isArray(c.meetings)) return c as Course;
          const meeting: Meeting = {
            id: crypto.randomUUID(),
            days: Array.isArray(c.days) ? c.days : [],
            startTime: typeof c.startTime === 'string' ? c.startTime : "",
            endTime: typeof c.endTime === 'string' ? c.endTime : "",
          };
          const { days, startTime, endTime, ...rest } = c;
          return { ...rest, meetings: [meeting] } as Course;
        });
        setCourses(migrated);
      } catch {}
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("schedule:courses", JSON.stringify(courses));
  }, [courses]);

  // Fetch buildings for dropdown
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("http://localhost:3001/api/buildings", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) throw new Error("Failed to load buildings");
        const data = await response.json();
        setBuildings(data.buildings);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load buildings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const buildingIdToCode = useMemo(() => {
    const map = new Map<number, string>();
    buildings.forEach((b) => {
      if (b.building_code) map.set(b.id, b.building_code);
    });
    return map;
  }, [buildings]);

  const addCourse = () => {
    const newCourse: Course = {
      id: crypto.randomUUID(),
      title: "",
      buildingId: undefined,
      buildingCode: undefined,
      meetings: [
        { id: crypto.randomUUID(), days: [], startTime: "", endTime: "" }
      ],
    };
    setCourses((prev) => [newCourse, ...prev]);
  };

  const updateCourse = (id: string, changes: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...changes } : c))
    );
  };

  const removeCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const addMeeting = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId
          ? {
              ...c,
              meetings: [
                ...c.meetings,
                { id: crypto.randomUUID(), days: [], startTime: "", endTime: "" },
              ],
            }
          : c
      )
    );
  };

  const removeMeeting = (courseId: string, meetingId: string) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId
          ? { ...c, meetings: c.meetings.filter((m) => m.id !== meetingId) }
          : c
      )
    );
  };

  const updateMeeting = (
    courseId: string,
    meetingId: string,
    changes: Partial<Meeting>
  ) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          meetings: c.meetings.map((m) =>
            m.id === meetingId ? { ...m, ...changes } : m
          ),
        };
      })
    );
  };

  const toggleMeetingDay = (courseId: string, meetingId: string, day: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          meetings: c.meetings.map((m) => {
            if (m.id !== meetingId) return m;
            const nextDays = m.days.includes(day)
              ? m.days.filter((d) => d !== day)
              : [...m.days, day];
            return { ...m, days: nextDays };
          }),
        };
      })
    );
  };

  const saveSchedule = async () => {
    setSaving(true);
    try {
      // Placeholder: local-only for now. Hook your backend here if needed.
      await new Promise((r) => setTimeout(r, 400));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-purple-900/20 to-neutral-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-purple-900/20 to-neutral-950 relative overflow-hidden">
      <header className="relative z-10 bg-black/10 backdrop-blur-md border-b border-white/20 p-4 md:p-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 group">
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              CampusNav
            </span>
            <span className="text-sm text-gray-400 hidden md:block">Schedule</span>
          </div>
          <a
            href="/dashboard"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 font-semibold"
          >
            Dashboard
          </a>
        </div>
      </header>

      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-2 md:mb-4">
              Create Your Schedule
            </h1>
            <p className="text-base md:text-lg text-gray-300">
              Add classes, pick days and times, and link them to buildings.
            </p>
          </div>

          <div className="bg-black/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-6 shadow-2xl mb-6">
            <div className="flex items-center justify-between">
              <button
                onClick={addCourse}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 font-semibold"
              >
                + Add Class
              </button>
              <button
                onClick={saveSchedule}
                disabled={saving}
                className="bg-gradient-to-r from-green-600 to-emerald-600 disabled:opacity-60 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 font-semibold"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {courses.length === 0 && (
              <div className="text-gray-400 text-center">No classes yet. Click "+ Add Class" to get started.</div>
            )}

            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-black/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-6 shadow-2xl"
              >
                <div className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4">
                  <div className="md:col-span-4">
                    <label className="block text-xs text-gray-400 mb-1">Class Title</label>
                    <input
                      type="text"
                      value={course.title}
                      onChange={(e) => updateCourse(course.id, { title: e.target.value })}
                      placeholder="e.g., MATH 221 - Calc I"
                      className="w-full bg-black/20 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs text-gray-400 mb-1">Building</label>
                    <select
                      value={course.buildingId ?? ""}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : undefined;
                        updateCourse(course.id, {
                          buildingId: val,
                          buildingCode: val ? buildingIdToCode.get(val) : undefined,
                        });
                      }}
                      className="w-full bg-black/20 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    >
                      <option value="">Select building</option>
                      {buildings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.building_code ? `${b.building_code} — ${b.name}` : b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {course.meetings.map((m, idx) => (
                    <div key={m.id} className="md:col-span-12 bg-black/5 border border-white/10 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-gray-400">Meeting {idx + 1}</div>
                        <button
                          onClick={() => removeMeeting(course.id, m.id)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-4">
                          <label className="block text-xs text-gray-400 mb-1">Days</label>
                          <div className="grid grid-cols-5 gap-1">
                            {DAYS.map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => toggleMeetingDay(course.id, m.id, d)}
                                className={`px-2 py-2 rounded-lg text-sm transition ${
                                  m.days.includes(d)
                                    ? "bg-purple-600 text-white"
                                    : "bg-black/20 text-gray-300 hover:bg-black/40"
                                }`}
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="md:col-span-4">
                          <label className="block text-xs text-gray-400 mb-1">Start Time</label>
                          <input
                            type="time"
                            value={m.startTime}
                            onChange={(e) => updateMeeting(course.id, m.id, { startTime: e.target.value })}
                            className="w-full bg-black/20 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                          />
                        </div>
                        <div className="md:col-span-4">
                          <label className="block text-xs text-gray-400 mb-1">End Time</label>
                          <input
                            type="time"
                            value={m.endTime}
                            onChange={(e) => updateMeeting(course.id, m.id, { endTime: e.target.value })}
                            className="w-full bg-black/20 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="md:col-span-12">
                    <button
                      onClick={() => addMeeting(course.id)}
                      className="text-xs text-purple-300 hover:text-purple-200"
                    >
                      + Add another meeting
                    </button>
                  </div>

                  <div className="md:col-span-12 flex justify-end">
                    <button
                      onClick={() => removeCourse(course.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


