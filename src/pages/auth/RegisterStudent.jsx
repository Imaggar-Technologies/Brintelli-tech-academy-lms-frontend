import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RegisterStudent = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/auth/signup", { replace: true });
  }, [navigate]);
  return null;
};

export default RegisterStudent;

