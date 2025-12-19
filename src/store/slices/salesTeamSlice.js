import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userAPI } from "../../api/user";

// Async thunk to fetch sales team
export const fetchSalesTeam = createAsyncThunk(
  "salesTeam/fetchSalesTeam",
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching sales team...');
      const response = await userAPI.getSalesTeam();
      console.log('Sales Team API Response:', response); // Debug log
      
      // Check if response is valid
      if (!response) {
        console.error('No response from API');
        return rejectWithValue('No response from server');
      }

      if (response.success && response.data) {
        // Handle both response.data.team and response.data (if team is at root)
        const teamArray = response.data.team || response.data || [];
        
        if (Array.isArray(teamArray) && teamArray.length > 0) {
          // Transform backend data to match frontend format
          const team = teamArray.map(member => ({
            id: member.id || member._id?.toString() || '',
            email: member.email || '',
            name: member.name || member.fullName || '',
            fullName: member.fullName || member.name || '',
            role: member.role || '',
            isActive: member.isActive !== undefined ? member.isActive : true,
            // Hierarchy fields
            managerId: member.managerId || null,
            managerName: member.managerName || null,
            teamId: member.teamId || null,
            teamName: member.teamName || null,
            directReports: member.directReports || [],
          }));
          console.log('Transformed Team:', team); // Debug log
          return team;
        } else {
          console.warn('Team array is empty or not an array:', teamArray);
          return [];
        }
      }
      
      console.warn('Unexpected response structure:', response);
      return rejectWithValue('Invalid response structure');
    } catch (error) {
      console.error('Error fetching sales team:', error);
      const errorMessage = error.message || error.toString() || "Failed to fetch sales team";
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState = {
  team: [],
  hierarchy: {
    admins: [],
    leads: [],
    agents: [],
  },
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const salesTeamSlice = createSlice({
  name: "salesTeam",
  initialState,
  reducers: {
    clearSalesTeam: (state) => {
      state.team = [];
      state.error = null;
      state.lastUpdated = null;
    },
    updateTeamMember: (state, action) => {
      const { email, updates } = action.payload;
      const memberIndex = state.team.findIndex(m => m.email === email);
      if (memberIndex !== -1) {
        state.team[memberIndex] = { ...state.team[memberIndex], ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sales team
      .addCase(fetchSalesTeam.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSalesTeam.fulfilled, (state, action) => {
        state.isLoading = false;
        state.team = action.payload;
        state.error = null;
        state.lastUpdated = new Date().toISOString();
        
        // Build hierarchy from team data
        state.hierarchy = {
          admins: action.payload.filter(m => m.role === 'sales_admin'),
          leads: action.payload.filter(m => m.role === 'sales_lead'),
          agents: action.payload.filter(m => m.role === 'sales_agent'),
        };
      })
      .addCase(fetchSalesTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch sales team";
      });
  },
});

export const { clearSalesTeam, updateTeamMember } = salesTeamSlice.actions;

// Selectors
export const selectSalesTeam = (state) => state.salesTeam.team;
export const selectSalesTeamHierarchy = (state) => state.salesTeam.hierarchy;
export const selectSalesTeamLoading = (state) => state.salesTeam.isLoading;
export const selectSalesTeamError = (state) => state.salesTeam.error;
export const selectSalesTeamLastUpdated = (state) => state.salesTeam.lastUpdated;

// Helper selectors
export const selectTeamByManager = (state, managerId) => {
  return state.salesTeam.team.filter(member => member.managerId === managerId);
};

export const selectUserManager = (state, userId) => {
  const user = state.salesTeam.team.find(m => m.id === userId);
  if (!user || !user.managerId) return null;
  return state.salesTeam.team.find(m => m.id === user.managerId);
};

export default salesTeamSlice.reducer;

