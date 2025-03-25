import React from 'react';
import {
  MDXEditor,
  headingsPlugin,
  diffSourcePlugin,
  toolbarPlugin,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import ViewModeToggle from './ViewModeToggle';

const QuickCaptureApp = () => {
  return (
    <MDXEditor
      className="dark-theme"
      markdown=""
      placeholder="Type your notes here..."
      contentEditableClassName="mdxeditor"
      autoFocus
      plugins={[
        headingsPlugin(),
        diffSourcePlugin({ viewMode: 'source' }),
        toolbarPlugin({
          toolbarContents: () => (<>
            <ViewModeToggle />
          </>)
        }),
      ]}
    />
  );
};

export default QuickCaptureApp;