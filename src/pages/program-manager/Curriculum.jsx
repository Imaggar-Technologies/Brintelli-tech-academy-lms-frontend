import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ChevronRight, BookOpen, Layers3, FileText, ChevronLeft } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import programAPI from '../../api/program';

const Curriculum = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await programAPI.getAllPrograms();
      if (response.success) {
        setPrograms(response.data.programs || []);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProgram = async (program) => {
    setSelectedProgram(program);
    try {
      const response = await programAPI.getModulesByProgram(program.id || program._id);
      if (response.success) {
        setModules(response.data.modules || []);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error('Failed to load modules');
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(programs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPrograms = programs.slice(startIndex, endIndex);

  return (
    <>
      <PageHeader
        title="Curriculum Builder"
        description="View and manage curriculum structure for all programs"
        actions={
          <Button
            variant="ghost"
            onClick={() => navigate('/program-manager/programs')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Programs
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Programs List */}
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          <h3 className="text-lg font-semibold text-text mb-4">All Programs</h3>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
              <p className="text-textMuted">Loading...</p>
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-textMuted">No programs found. Create a program first!</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {paginatedPrograms.map((program) => (
                  <div
                    key={program.id || program._id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedProgram?.id === program.id || selectedProgram?._id === program._id
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-brintelli-border hover:border-brand-300'
                    }`}
                    onClick={() => handleSelectProgram(program)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-text">{program.name}</h4>
                        <p className="text-sm text-textMuted">{program.code}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-textMuted" />
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-brintelli-border">
                  <div className="text-sm text-textMuted">
                    Showing {startIndex + 1} to {Math.min(endIndex, programs.length)} of {programs.length} programs
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="text-sm text-text">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Selected Program Modules */}
        <div className="rounded-2xl border border-brintelli-border bg-brintelli-card shadow-soft p-6">
          {selectedProgram ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-text">{selectedProgram.name}</h3>
                  <p className="text-sm text-textMuted">{selectedProgram.code}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/program-manager/modules/${selectedProgram.id || selectedProgram._id}`)}
                >
                  Manage Modules
                </Button>
              </div>
              <div className="space-y-3">
                {modules.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-textMuted">No modules found for this program.</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => navigate(`/program-manager/modules/${selectedProgram.id || selectedProgram._id}`)}
                    >
                      Create First Module
                    </Button>
                  </div>
                ) : (
                  modules.map((module) => (
                    <div
                      key={module.id || module._id}
                      className="border border-brintelli-border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Layers3 className="h-5 w-5 text-brand-500" />
                          <h4 className="font-semibold text-text">{module.name}</h4>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/program-manager/modules/${selectedProgram.id || selectedProgram._id}/assignments/${module.id || module._id}`)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Assignments
                        </Button>
                      </div>
                      <p className="text-sm text-textMuted mb-2">{module.description || 'No description'}</p>
                      <div className="flex items-center gap-4 text-xs text-textMuted">
                        <span>Order: {module.order}</span>
                        {module.duration && <span>Duration: {module.duration} hours</span>}
                        <span className={`px-2 py-1 rounded ${
                          module.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          module.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {module.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-textMuted mx-auto mb-4" />
              <p className="text-textMuted">Select a program to view its curriculum</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Curriculum;

