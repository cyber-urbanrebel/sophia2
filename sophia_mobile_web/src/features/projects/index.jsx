import React from 'react';
import { ProjectProvider } from './projectStore.js';
import ProjectsPage from './ProjectsPage.jsx';

export default function ProjectsFeature() {
  return (
    <ProjectProvider>
      <ProjectsPage />
    </ProjectProvider>
  );
}
