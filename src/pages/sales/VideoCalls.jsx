import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Video, Plus, Calendar, Phone, PhoneOff, Clock } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Table from "../../components/Table";
import Modal from "../../components/Modal";
import salesCallApi from "../../api/salesCall";
import leadApi from "../../api/lead";
import { getCallUrl } from "../../utils/callSlug";

export default function VideoCalls() {
  const navigate = useNavigate();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leads, setLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Create call form
  const [formData, setFormData] = useState({
    leadId: "",
    callType: "ONE_TO_ONE",
    scheduledDate: "",
    meetingLink: "",
    privateNotes: "",
  });

  useEffect(() => {
    loadCalls();
    loadLeads();
  }, []);

  const loadCalls = async () => {
    try {
      setLoading(true);
      const response = await salesCallApi.getMyCalls();
      setCalls(response.data?.calls || []);
    } catch (error) {
      toast.error("Failed to load calls");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeads = async () => {
    try {
      const response = await leadApi.getAllLeads({ limit: 100 });
      setLeads(response.data?.leads || []);
    } catch (error) {
      console.error("Failed to load leads:", error);
    }
  };

  const handleCreateCall = async () => {
    if (!formData.leadId) {
      toast.error("Please select a lead");
      return;
    }

    try {
      const response = await salesCallApi.createCall(formData);
      toast.success("Sales call created");
      setShowCreateModal(false);
      setFormData({
        leadId: "",
        callType: "ONE_TO_ONE",
        scheduledDate: "",
        meetingLink: "",
        privateNotes: "",
      });
      loadCalls();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create call");
    }
  };

  const handleJoinCall = (callId, call = null) => {
    const url = getCallUrl(callId, call);
    navigate(url);
  };

  const getStatusBadge = (status) => {
    const badges = {
      SCHEDULED: "bg-yellow-100 text-yellow-800",
      ONGOING: "bg-green-100 text-green-800",
      COMPLETED: "bg-blue-100 text-blue-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          badges[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  const filteredCalls = calls.filter((call) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      call.leadId?.toString().includes(query) ||
      call.status?.toLowerCase().includes(query)
    );
  });

  const columns = [
    {
      key: "leadId",
      label: "Lead ID",
      render: (value) => (
        <span className="font-medium">{value?.toString().slice(0, 8) || "N/A"}</span>
      ),
    },
    {
      key: "callType",
      label: "Type",
      render: (value) => (
        <span className="text-sm text-gray-600">
          {value === "ONE_TO_ONE" ? "1-to-1" : "1-to-Many"}
        </span>
      ),
    },
    {
      key: "scheduledDate",
      label: "Scheduled",
      render: (value) => (
        <span className="text-sm">
          {value ? new Date(value).toLocaleString() : "Not scheduled"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => getStatusBadge(value),
    },
    {
      key: "duration",
      label: "Duration",
      render: (value) => (
        <span className="text-sm">{value ? `${value} min` : "-"}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {row.status === "SCHEDULED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleJoinCall(row._id || row.id, row)}
            >
              Start
            </Button>
          )}
          {row.status === "ONGOING" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleJoinCall(row._id || row.id, row)}
            >
              Join
            </Button>
          )}
          {row.status === "COMPLETED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = getCallUrl(row._id || row.id, row);
                navigate(`${url}/insights`);
              }}
            >
              View Insights
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Video Calls"
        description="Manage and join sales video calls with leads"
      />

      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search calls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Call
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading calls...</p>
        </div>
      ) : filteredCalls.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No sales calls found</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Call
          </Button>
        </div>
      ) : (
        <Table data={filteredCalls} columns={columns} />
      )}

      {/* Create Call Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Sales Call"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Lead</label>
            <select
              value={formData.leadId}
              onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a lead</option>
              {leads.map((lead) => (
                <option key={lead._id || lead.id} value={lead._id || lead.id}>
                  {lead.name || lead.email} ({lead.pipelineStage || "New"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Call Type</label>
            <select
              value={formData.callType}
              onChange={(e) => setFormData({ ...formData, callType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ONE_TO_ONE">1-to-1</option>
              <option value="ONE_TO_MANY">1-to-Many</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Scheduled Date</label>
            <input
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Meeting Link (Optional)</label>
            <input
              type="text"
              value={formData.meetingLink}
              onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Private Notes (Optional)</label>
            <textarea
              value={formData.privateNotes}
              onChange={(e) => setFormData({ ...formData, privateNotes: e.target.value })}
              placeholder="Add any notes about this call..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCall}>Create Call</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

