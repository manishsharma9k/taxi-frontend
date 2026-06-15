import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { usePageContent } from '../hooks/usePageContent';

const DynamicPage = () => {
  const location = useLocation();
  const { pageContent, loadingPageContent, pageContentError } = usePageContent(location.pathname);

  return (
    <div className="container" style={{ paddingTop: '8rem', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ padding: '3rem', maxWidth: '900px', margin: '0 auto' }}>
        {loadingPageContent ? (
          <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Loading page...</div>
        ) : pageContent ? (
          <>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
              {pageContent.title}
            </h1>
            <div style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '1.05rem' }} dangerouslySetInnerHTML={{ __html: pageContent.content }} />
          </>
        ) : pageContentError ? (
          <div style={{ color: 'var(--danger)', fontSize: '1rem' }}>{pageContentError}</div>
        ) : (
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>Page not found</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>This page is not yet created. Please check the URL or add it from the admin panel.</p>
            <Link to="/" className="btn btn-primary">Go back home</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicPage;
