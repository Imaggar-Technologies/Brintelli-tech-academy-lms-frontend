import { useState, useEffect } from "react";
import { ClipboardList, Mail } from "lucide-react";
import Button from "./Button";
import Modal from "./Modal";
import { leadAPI } from "../api/lead";
import { programAPI } from "../api/program";
import toast from "react-hot-toast";

/**
 * Schedule Assessment Modal Component
 * 
 * Sends an assessment link to the lead via email.
 * The lead will take the test online using the provided link.
 */
const ScheduleAssessmentModal = ({ isOpen, onClose, lead, onSuccess }) => {
  const [programId, setProgramId] = useState("");
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  // Fetch programs
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoadingPrograms(true);
        console.log('Fetching programs for assessment modal...');
        
        // Try fetching all programs first (without status filter)
        let response = await programAPI.getAllPrograms();
        console.log('Programs API response:', response);
        
        if (response && response.success) {
          let programsList = response.data?.programs || response.data || [];
          console.log('Programs list:', programsList);
          
          if (Array.isArray(programsList)) {
            // Filter to show active programs if available, otherwise show all
            const activePrograms = programsList.filter(p => 
              p.status === 'ACTIVE' || 
              p.status === 'active' || 
              !p.status ||
              p.status === undefined
            );
            
            const finalPrograms = activePrograms.length > 0 ? activePrograms : programsList;
            console.log('Final programs to display:', finalPrograms);
            
            if (finalPrograms.length > 0) {
              setPrograms(finalPrograms);
            } else {
              console.warn('No programs available after filtering');
              setPrograms([]);
            }
          } else {
            console.error('Programs list is not an array:', programsList);
            setPrograms([]);
          }
        } else {
          console.error('API response indicates failure:', response);
          const errorMsg = response?.error || response?.message || 'Failed to fetch programs';
          console.error('Error message:', errorMsg);
          toast.error(`Failed to load programs: ${errorMsg}`);
          setPrograms([]);
        }
      } catch (error) {
        console.error('Error fetching programs - Full error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Show user-friendly error message
        const errorMessage = error.message || 'Failed to load programs. Please check your permissions or contact administrator.';
        toast.error(errorMessage);
        setPrograms([]);
      } finally {
        setLoadingPrograms(false);
      }
    };
    
    if (isOpen) {
      fetchPrograms();
    } else {
      // Reset when modal closes
      setProgramId("");
      setPrograms([]);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!lead || !lead.id) {
      toast.error("Invalid lead data");
      return;
    }

    if (!programId) {
      toast.error("Please select a program");
      return;
    }

    setLoading(true);
    try {
      console.log("Sending assessment for lead:", lead.id, { programId });
      
      const response = await leadAPI.sendAssessment(lead.id, {
        programId: programId,
      });

      console.log("Assessment response:", response);

      if (response && response.success) {
        toast.success(response.message || "Assessment link sent successfully");
        
        // Wait a bit for the database to update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (onSuccess) {
          onSuccess();
        }
        onClose();
        // Reset form
        setProgramId("");
      } else {
        throw new Error(response?.message || "Failed to send assessment link");
      }
    } catch (error) {
      console.error("Error sending assessment:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response,
        stack: error.stack,
      });
      const errorMessage = error.message || error.response?.data?.error || "Failed to send assessment link";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Send Assessment Link: ${lead?.name || "Lead"}`}
      size="md"
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 mb-1">Assessment Link Will Be Sent</p>
              <p className="text-sm text-blue-700">
                An assessment link will be generated and sent to <strong>{lead?.email}</strong>. 
                The lead will be able to take the test online using this link.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Select Program <span className="text-red-500">*</span>
          </label>
          {loadingPrograms ? (
            <div className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand"></div>
              <span className="text-textMuted">Loading programs...</span>
            </div>
          ) : programs.length === 0 ? (
            <div className="w-full rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm">
              <p className="text-yellow-800 font-medium">No active programs available</p>
              <p className="text-yellow-700 text-xs mt-1">
                Please create an active program first before sending assessment links.
              </p>
            </div>
          ) : (
            <select
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              className="w-full rounded-xl border border-brintelli-border bg-brintelli-baseAlt px-4 py-2 text-sm focus:border-brand-500 focus:outline-none"
              required
            >
              <option value="">Select a program...</option>
              {programs.map(program => (
                <option key={program.id || program._id} value={program.id || program._id}>
                  {program.name || program.title || `Program ${program.id || program._id}`}
                </option>
              ))}
            </select>
          )}
          <p className="mt-1 text-xs text-textMuted">
            {loadingPrograms 
              ? "Loading available programs..." 
              : programs.length > 0 
                ? "Select the program for which the assessment will be sent."
                : "No programs available. Contact administrator to create programs."}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-brintelli-border">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!programId || loading}>
            {loading ? "Sending..." : "Send Assessment Link"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleAssessmentModal;
