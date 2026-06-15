import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api/admin';

export const usePageContent = (pagePath) => {
  const [pageContent, setPageContent] = useState(null);
  const [loadingPageContent, setLoadingPageContent] = useState(true);
  const [pageContentError, setPageContentError] = useState('');

  useEffect(() => {
    if (!pagePath) return;

    const fetchContent = async () => {
      setLoadingPageContent(true);
      setPageContentError('');
      try {
        const response = await fetch(`${API_BASE}/page-content?path=${encodeURIComponent(pagePath)}`);
        if (!response.ok) {
          if (response.status === 404) {
            setPageContent(null);
            return;
          }
          throw new Error('Unable to load page content');
        }

        const data = await response.json();
        setPageContent(data);
      } catch (error) {
        setPageContentError(error.message || 'Failed to load page content');
      } finally {
        setLoadingPageContent(false);
      }
    };

    fetchContent();
  }, [pagePath]);

  return { pageContent, loadingPageContent, pageContentError };
};
