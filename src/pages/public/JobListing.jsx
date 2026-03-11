import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../../store/slices/authSlice';
import { getPublicJobs } from '../../api/jobs';
import apiRequest from '../../api/apiClient';
import JobListingLayout from '../../components/JobListingLayout';
import { toast } from 'react-hot-toast';

const JobListing = () => {
  const [searchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('q') || '';
  const authUser = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(queryFromUrl);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setSearchQuery(queryFromUrl);
  }, [queryFromUrl]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [jobsRes, meRes] = await Promise.all([
          getPublicJobs({ limit: 200 }),
          isAuthenticated ? apiRequest('/api/users/me').catch(() => null) : Promise.resolve(null),
        ]);
        if (jobsRes?.data?.jobs) setJobs(jobsRes.data.jobs);
        else setJobs([]);
        if (meRes?.data?.user) setCurrentUser(meRes.data.user);
        else if (authUser) setCurrentUser({ ...authUser, jobReady: authUser.jobReady });
        else setCurrentUser(null);
      } catch (e) {
        toast.error(e?.message || 'Failed to load jobs');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, authUser?.jobReady]);

  return (
    <div className="max-w-[1600px] mx-auto">
      <JobListingLayout
        jobs={jobs}
        loading={loading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentUser={currentUser}
        isLoggedIn={isAuthenticated}
        applyPathPrefix="/applyjobs/"
        profileResumeLink={isAuthenticated ? '/student/profile' : undefined}
        signInLink="/auth/signin"
      />
    </div>
  );
};

export default JobListing;
