import React from 'react';
import { useLocation } from 'react-router-dom';
import { usePageContent } from '../hooks/usePageContent';

const StaticPage = ({ title, content }) => {
  const location = useLocation();
  const { pageContent } = usePageContent(location.pathname);
  const displayTitle = pageContent?.title || title;
  const displayContent = pageContent?.content ? <div dangerouslySetInnerHTML={{ __html: pageContent.content }} /> : content;

  return (
    <div className="container" style={{ paddingTop: '8rem', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem', color: 'var(--text-main)' }}>{displayTitle}</h1>
        <div style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '1.1rem' }}>
          {displayContent}
        </div>
      </div>
    </div>
  );
};

export default StaticPage;
