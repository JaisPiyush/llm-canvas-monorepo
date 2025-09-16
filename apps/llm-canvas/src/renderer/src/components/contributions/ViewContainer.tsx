import React from 'react';
import { ResolvedViewContainerContribution } from '@llm-canvas/sdk';
import { useViewContainers } from '../../hooks/useViewContainers';
import { View } from './View';

interface ViewContainerProps {
  container: ResolvedViewContainerContribution;
  className?: string;
}

export const ViewContainer: React.FC<ViewContainerProps> = ({ container, className = '' }) => {
  const { data: views, loading, error } = useViewContainers(container.id)

  if (loading) {
    return (
      <div className={`view-container ${className}`}>
        <div className="view-container-header">
          <span className="view-container-title">{container.title}</span>
        </div>
        <div className="view-container-content">
          <div className="loading-spinner">Loading views...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`view-container ${className}`}>
        <div className="view-container-header">
          <span className="view-container-title">{container.title}</span>
        </div>
        <div className="view-container-content">
          <div className="error-message">Error: {error}</div>
        </div>
      </div>
    );
  }

  const sortedViews = views.sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className={`view-container ${className}`} data-container-id={container.id}>
      <div className="view-container-header">
        {container.icon && <span className="view-container-icon">{container.icon}</span>}
        <span className="view-container-title">{container.title}</span>
      </div>
      <div className="view-container-content">
        {sortedViews.map(view => (
          <View key={view.id} view={view} />
        ))}
      </div>
    </div>
  );
};