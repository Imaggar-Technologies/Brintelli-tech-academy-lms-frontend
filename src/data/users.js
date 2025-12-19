// Sales Team Users
export const salesUsers = {
  "sales-agent": {
    id: "sales-agent",
    name: "John Doe",
    email: "john.doe@brintelli.com",
    phone: "+91 98765 43210",
    role: "sales",
    roleLabel: "Sales Agent",
    title: "Senior Sales Counselor",
    department: "Sales",
    avatar: "JD",
    permissions: ["sales-leads", "sales-pipeline", "sales-demos", "sales-followups"],
    stats: {
      leadsAssigned: 45,
      dealsWon: 12,
      revenueGenerated: "₹1.2M",
      winRate: "28%",
    },
  },
  "head-of-sales": {
    id: "head-of-sales",
    name: "Sarah Williams",
    email: "sarah.williams@brintelli.com",
    phone: "+91 98765 43211",
    role: "sales",
    roleLabel: "Head of Sales",
    title: "Head of Sales & Enrollment",
    department: "Sales",
    avatar: "SW",
    permissions: ["*"], // Full access to all sales features
    stats: {
      leadsAssigned: 120,
      dealsWon: 45,
      revenueGenerated: "₹4.8M",
      winRate: "38%",
    },
  },
};

// Default user (can be changed based on login)
export const getDefaultUser = (userId = "sales-agent") => {
  return salesUsers[userId] || salesUsers["sales-agent"];
};

// Get user by role
export const getUserByRole = (role) => {
  if (role === "head-of-sales" || role === "sales-manager") {
    return salesUsers["head-of-sales"];
  }
  return salesUsers["sales-agent"];
};

// All users list
export const allUsers = {
  ...salesUsers,
  // Add other role users here if needed
};

export default salesUsers;

