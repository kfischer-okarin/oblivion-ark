import React from 'react';
import {
  useCellValues,
  viewMode$,
  iconComponentFor$,
  usePublisher,
  SingleChoiceToggleGroup,
} from '@mdxeditor/editor';

const ViewModeToggle = () => {
  const [viewMode, iconComponentFor] = useCellValues(viewMode$, iconComponentFor$)
  const applyViewMode = usePublisher(viewMode$);

  const toggleViewMode = () => {
    const newMode = viewMode === 'source' ? 'rich-text' : 'source';
    applyViewMode(newMode);
  };

  return (
    <SingleChoiceToggleGroup
      value={viewMode}
      onChange={toggleViewMode}
      items={[
        { title: 'Source', contents: iconComponentFor('markdown'), value: 'source' },
        { title: 'Rich text', contents: iconComponentFor('rich_text'), value: 'rich-text' },
      ]}
    />
  );
};

export default ViewModeToggle;