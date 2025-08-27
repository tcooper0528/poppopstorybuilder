import React from 'react'
import StorybookBuilder from './components/StorybookBuilder_PagesPromptsPDFUploads.jsx'

export default function App(){
  return (
    <div className="wrap">
      <h1>PopPop Builder — Storybook Pages + Prompts + Picture-PDF</h1>
      <p className="muted">Private production tool for Story Time with Tim. Fill in the details, generate page texts and Pixar-style prompts, upload one image per page, and export a picture-book PDF.</p>
      <StorybookBuilder />
    </div>
  )
}
