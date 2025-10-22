"use client";
import React from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslation } from "react-lite-translation";

// helper: find the first array anywhere in an object (depth-limited)
function findFirstArray(obj, maxDepth = 5, depth = 0) {
  if (!obj || depth > maxDepth) return null;
  if (Array.isArray(obj)) return obj;
  if (typeof obj !== "object") return null;
  for (const key of Object.keys(obj)) {
    try {
      const found = findFirstArray(obj[key], maxDepth, depth + 1);
      if (found) return found;
    } catch {
      // ignore
    }
  }
  return null;
}

function normalizeCourse(c) {
  const copy = { ...c };
  copy.id = c.id ?? c._id ?? String(Math.random()).slice(2);
  copy.userID = {
    ...(typeof c.userID === "object" ? c.userID : {}),
    id: c.userID?.id ?? c.userID?._id ?? c.userID ?? null,
  };
  return copy;
}

export default function Page({ searchParams: _searchParams }) {
  // use next/navigation hooks to read & change query (client component)
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const {t} = useTranslation()

  const categoryParam = searchParams?.get("category") ?? "";
  const moduleParam = searchParams?.get("module") ?? "";
  const sortParam = searchParams?.get("sort") ?? "id_desc";
  const searchParam = searchParams?.get("search") ?? "";

  const [courses, setCourses] = React.useState([]);
  const [filtered, setFiltered] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState(() => searchParam);
  const [availableModules, setAvailableModules] = React.useState([]);

  // keep input synced when URL changes externally
  React.useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  const categories = ["", "1as", "2as", "3as", "other"];

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    // fetch courses
    Promise.all([
      fetch("/api/course").then((r) => r.json()).catch((e) => ({ _err: e })),
      fetch("/api/user").then((r) => r.ok ? r.json() : null).catch(() => null),
    ])
      .then(([coursePayload, userPayload]) => {
        if (!mounted) return;

        // normalize user (userPayload may be { user: {...} } or plain)
        const u = userPayload ? (userPayload.user ?? userPayload) : null;
        if (u && u._id && !u.id) u.id = u._id;
        setCurrentUser(u ?? null);

        if (coursePayload && coursePayload._err) {
          setError(coursePayload._err);
          setCourses([]);
          return;
        }

        // find first array anywhere: defensive, avoids relying on payload.data
        let arr = findFirstArray(coursePayload);
        if (!arr && Array.isArray(coursePayload)) arr = coursePayload;
        // fallback to common keys
        if (!arr && coursePayload?.data && Array.isArray(coursePayload.data)) arr = coursePayload.data;
        if (!arr && coursePayload?.courses && Array.isArray(coursePayload.courses)) arr = coursePayload.courses;

        if (!arr) {
          // nothing found
          setCourses([]);
          setError("No courses array found in API response");
          return;
        }

        const norm = arr.map(normalizeCourse);
        setCourses(norm);

        // Extract unique modules
        const modules = [...new Set(norm.map(c => c.module).filter(Boolean))];
        setAvailableModules(modules);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message ?? String(err));
        setCourses([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // apply filters and sorting whenever inputs or courses change
  React.useEffect(() => {
    let out = [...courses];

    // Category filter
    if (categoryParam) {
      out = out.filter((c) => String(c.category) === String(categoryParam));
    }

    // Module filter
    if (moduleParam) {
      out = out.filter((c) => String(c.module) === String(moduleParam));
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      out = out.filter((c) => 
        String(c.title).toLowerCase().includes(query) ||
        String(c.description).toLowerCase().includes(query) ||
        String(c.userID?.fullName).toLowerCase().includes(query) ||
        String(c.module).toLowerCase().includes(query) ||
        String(c.category).toLowerCase().includes(query)
      );
    }

    // Sorting
    const sort = sortParam;
    out.sort((a, b) => {
      switch (sort) {
        case "title_asc":
          return String(a.title).localeCompare(String(b.title));
        case "title_desc":
          return String(b.title).localeCompare(String(a.title));
        case "id_asc":
          return String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
        case "id_desc":
        default:
          return String(b.id).localeCompare(String(a.id), undefined, { numeric: true });
      }
    });

    setFiltered(out);
  }, [courses, categoryParam, moduleParam, sortParam, searchQuery]);

  const buildHref = (newParams = {}) => {
    const params2 = new URLSearchParams();
    const cat = newParams.category ?? categoryParam;
    const mod = newParams.module ?? moduleParam;
    const s = newParams.sort ?? sortParam;
    const search = newParams.search ?? searchQuery;

    if (cat) params2.set("category", cat);
    if (mod) params2.set("module", mod);
    if (s) params2.set("sort", s);
    if (search && String(search).trim()) params2.set("search", String(search).trim());

    const qs = params2.toString();
    return qs ? `${pathname}?${qs}` : pathname || "/";
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    router.push(buildHref({ search: searchQuery }));
  };

  const fmtDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso ?? "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark font-inter">
      {/* Header */}
      <div className="bg-bg-secondary/80 dark:bg-bg-dark-secondary/80 backdrop-blur-lg border-b border-border dark:border-border-dark sticky top-0 z-10">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-text dark:text-text-dark font-montserrat mb-3 bg-gradient-to-r from-special to-special-hover bg-clip-text text-transparent">
            {t('courses.titles')}
          </h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
          <div className="relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("courses.search.palceholder")}
              className="w-full placeholder:px-20 px-20 py-4 text-lg bg-bg-secondary dark:bg-bg-dark-secondary border-2 border-border dark:border-border-dark rounded-2xl focus:border-special focus:outline-none focus:ring-4 focus:ring-special/20 transition-all duration-300 text-text dark:text-text-dark placeholder:text-text-secondary dark:placeholder:text-text-dark-secondary font-medium"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-special hover:bg-special-hover text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            >
              {t('courses.search.title')}
            </button>
          </div>
        </form>
      </div>

      {/* Filters & Sort Dropdown */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-bg-secondary/50 dark:bg-bg-dark-secondary/50 backdrop-blur-sm rounded-2xl p-6 border border-border dark:border-border-dark">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="font-bold text-text dark:text-text-dark text-xl font-montserrat">{t('courses.filters.title')}:</span>

            {/* Category Dropdown */}
            <div className="relative">
              <label className="block text-sm font-semibold text-text dark:text-text-dark mb-2 font-montserrat">{t('courses.filters.c')}</label>
              <select 
                value={categoryParam}
                onChange={(e) => router.push(buildHref({ category: e.target.value }))}
                className="appearance-none bg-bg dark:bg-bg-dark text-text dark:text-text-dark border-2 border-border dark:border-border-dark rounded-xl px-4 py-3 pr-10 font-semibold font-montserrat min-w-40 focus:border-special focus:outline-none focus:ring-4 focus:ring-special/20 transition-all duration-300 cursor-pointer hover:border-special/70"
              >
                <option value="">All Categories</option>
                {categories.filter(cat => cat !== "").map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 top-8 flex items-center px-3 pointer-events-none">
                <svg className="w-5 h-5 text-text-secondary dark:text-text-dark-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Module Dropdown */}
            <div className="relative">
              <label className="block text-sm font-semibold text-text dark:text-text-dark mb-2 font-montserrat">{t('courses.filters.m')}</label>
              <select 
                value={moduleParam}
                onChange={(e) => router.push(buildHref({ module: e.target.value }))}
                className="appearance-none bg-bg dark:bg-bg-dark text-text dark:text-text-dark border-2 border-border dark:border-border-dark rounded-xl px-4 py-3 pr-10 font-semibold font-montserrat min-w-40 focus:border-special focus:outline-none focus:ring-4 focus:ring-special/20 transition-all duration-300 cursor-pointer hover:border-special/70"
              >
                <option value="">All Modules</option>
                {availableModules.map((module) => (
                  <option key={module} value={module}>{module}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 top-8 flex items-center px-3 pointer-events-none">
                <svg className="w-5 h-5 text-text-secondary dark:text-text-dark-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <label className="block text-sm font-semibold text-text dark:text-text-dark mb-2 font-montserrat">{t('courses.filters.s')}</label>
              <select 
                value={sortParam}
                onChange={(e) => router.push(buildHref({ sort: e.target.value }))}
                className="appearance-none bg-bg dark:bg-bg-dark text-text dark:text-text-dark border-2 border-border dark:border-border-dark rounded-xl px-4 py-3 pr-10 font-semibold font-montserrat min-w-44 focus:border-special focus:outline-none focus:ring-4 focus:ring-special/20 transition-all duration-300 cursor-pointer hover:border-special/70"
              >
                <option value="id_desc">{t('courses.filters.NF')}</option>
                <option value="id_asc">{t('courses.filters.OF')}</option>
                <option value="title_asc">A→Z</option>
                <option value="title_desc">Z→A</option>
              </select>
              <div className="absolute inset-y-0 right-0 top-8 flex items-center px-3 pointer-events-none">
                <svg className="w-5 h-5 text-text-secondary dark:text-text-dark-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(categoryParam || moduleParam || sortParam !== "id_desc") && (
              <div className="flex flex-col justify-end h-full">
                <button
                  onClick={() => router.push(buildHref({ category: "", module: "", sort: "id_desc", search: "" }))}
                  className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 font-semibold py-3 px-4 rounded-xl transition-all duration-300 font-montserrat mt-7"
                >
                  {t('courses.filters.clear')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Courses grid */}
      <div className="container mx-auto px-4 py-6">
        

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((course) => (
            <article key={course.id} className="group bg-bg-secondary dark:bg-bg-dark-secondary rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 hover:scale-105 border-2 border-border dark:border-border-dark hover:border-special">
              <div className="relative overflow-hidden">
                <img 
                  src={course.thumbnail || `https://picsum.photos/400/250?random=${course.id}`} 
                  alt={course.title} 
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-2 rounded-full border border-white/20">
                  {course.module ?? course.category}
                </div>
                <div className="absolute top-4 right-4 bg-special text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg">
                  {course.category}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="text-xl font-bold text-text dark:text-text-dark font-montserrat group-hover:text-special transition-colors leading-tight">
                    {course.title}
                  </h3>
                  <div className="text-xs text-text-secondary dark:text-text-dark-secondary bg-bg dark:bg-bg-dark px-2 py-1 rounded-lg">
                    {fmtDate(course.createdAt)}
                  </div>
                </div>

                <p className="text-text-secondary dark:text-text-dark-secondary text-sm line-clamp-3 mb-6 leading-relaxed">
                  {course.description}
                </p>

                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    by
                    <div>
                      <div className="text-sm font-bold text-text dark:text-text-dark font-montserrat">
                        {course.userID?.fullName ?? "Unknown Teacher"}
                      </div>
                    </div>
                  </div>
                </div>

                <Link 
                  href={`/Courses/${course.id}`} 
                  className="block bg-special hover:bg-special-hover text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl text-center font-montserrat"
                >
                  Start Learning
                </Link>

                {currentUser && (String(currentUser.id) === String(course.userID?.id) || String(currentUser.id) === String(course.userID?._id)) && (
                  <div className="mt-4 flex gap-2">
                    <Link 
                      href={`/courses/${course.id}/edit`} 
                      className="flex-1 px-4 py-2 bg-bg dark:bg-bg-dark border-2 border-border dark:border-border-dark rounded-xl text-sm font-semibold text-text dark:text-text-dark hover:border-special transition-colors text-center"
                    >
                      Edit
                    </Link>
                    <button className="flex-1 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800 rounded-xl text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {filtered.length > 0 && (
          <div className="text-center mt-16">
            <button className="bg-bg-secondary dark:bg-bg-dark-secondary border-3 border-special text-special hover:bg-special hover:text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-montserrat text-lg">
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
