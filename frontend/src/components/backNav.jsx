import { useNavigate, useLocation } from 'react-router-dom';

export default function useGoBack(fallbackPath = '/') {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate(fallbackPath, { replace: true });
    }
  };

  return goBack;
}
