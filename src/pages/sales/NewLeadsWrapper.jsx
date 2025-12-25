import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../store/slices/authSlice";
import NewLeads from "./NewLeads";
import MyNewLeads from "./MyNewLeads";

/**
 * New Leads Wrapper
 * 
 * Conditionally renders the appropriate component based on user role:
 * - Sales Agent: MyNewLeads (simplified view for their assigned leads)
 * - Sales Lead: NewLeads (full view with assignment capabilities)
 */
const NewLeadsWrapper = () => {
  const currentUser = useSelector(selectCurrentUser);
  const isSalesAgent = currentUser?.role === 'sales_agent';

  if (isSalesAgent) {
    return <MyNewLeads />;
  }

  return <NewLeads />;
};

export default NewLeadsWrapper;

