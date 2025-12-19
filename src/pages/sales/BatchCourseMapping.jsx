import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { GraduationCap, BookOpen, Search, Filter, Calendar, Users, Target } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import { selectCurrentUser } from "../../store/slices/authSlice";

/**
 * BATCH & COURSE MAPPING PAGE
 * 
 * WORKFLOW: View batches created by PM, set targets based on batches
 * 
 * RBAC: Only Sales Head/Admin (requires sales:head:view)
 * 
 * ABAC: All batches and courses (read-only, PM creates batches)
 * 
 * BUSINESS LOGIC:
 * - View all batches created by Program Manager
 * - See course mappings for each batch
 * - Use batch information to set sales targets
 * - Read-only view (PM manages batches)
 */

const BatchCourseMapping = () => {
  const currentUser = useSelector(selectCurrentUser);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch batches
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        // TODO: Implement API call to fetch batches
        // const response = await batchesAPI.getAllBatches();
        
        // Placeholder data
        const mockBatches = [
          {
            id: 1,
            name: "Full Stack Development - Batch 1",
            course: "Full Stack Development",
            startDate: "2024-01-15",
            endDate: "2024-07-15",
            capacity: 50,
            enrolled: 32,
            status: "active",
          },
          {
            id: 2,
            name: "Data Science - Batch 2",
            course: "Data Science & Analytics",
            startDate: "2024-02-01",
            endDate: "2024-08-01",
            capacity: 40,
            enrolled: 28,
            status: "active",
          },
          {
            id: 3,
            name: "Cloud Computing - Batch 1",
            course: "AWS Cloud Computing",
            startDate: "2024-03-01",
            endDate: "2024-09-01",
            capacity: 30,
            enrolled: 18,
            status: "active",
          },
        ];
        
        setBatches(mockBatches);
      } catch (error) {
        console.error('Error fetching batches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  const filteredBatches = batches.filter(batch => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      batch.name?.toLowerCase().includes(search) ||
      batch.course?.toLowerCase().includes(search)
    );
  });

  return (
    <>
      <PageHeader
        title="Batch & Course Mapping"
        description="View batches created by Program Manager and their course mappings. Use this information to set sales targets."
        actions={
          <Button variant="secondary" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        }
      />

      {/* Search */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brintelli-border bg-brintelli-card p-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted" />
          <input
            type="text"
            placeholder="Search by batch name or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-10 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Batches Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
            <p className="text-textMuted">Loading batches...</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBatches.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-brintelli-border bg-brintelli-card p-12 text-center">
              <GraduationCap className="h-12 w-12 text-textMuted mx-auto mb-4" />
              <p className="text-textMuted">No batches found</p>
            </div>
          ) : (
            filteredBatches.map((batch) => {
              const enrollmentProgress = (batch.enrolled / batch.capacity) * 100;
              
              return (
                <div
                  key={batch.id}
                  className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-text mb-2">{batch.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-textMuted mb-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{batch.course}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      batch.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {batch.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-textMuted">Duration</span>
                      <span className="text-text font-semibold">
                        {new Date(batch.startDate).toLocaleDateString()} - {new Date(batch.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-textMuted">Capacity</span>
                      <span className="text-text font-semibold">{batch.capacity} students</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-textMuted">Enrolled</span>
                      <span className="text-text font-semibold">{batch.enrolled} students</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-text">Enrollment Progress</span>
                      <span className="text-xs text-textMuted">{enrollmentProgress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-brintelli-border rounded-full h-2">
                      <div
                        className="bg-brand h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(enrollmentProgress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-brintelli-border">
                    <Button variant="secondary" size="sm" className="w-full gap-2">
                      <Target className="h-4 w-4" />
                      Set Target for This Batch
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </>
  );
};

export default BatchCourseMapping;

