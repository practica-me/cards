import React from 'react';

import { storiesOf } from '@storybook/react';

import '../App.css';

import ScriptViewer from '../components/script-viewer/script-viewer.js'
import MODES from '../components/script-viewer/consts.js';
import units from '../data/units_and_lessons.json';
import script from '../../public/scripts/short_replies.json';

import StoryPage from '../components/script-viewer/story-page.js';
import FormPage from '../components/script-viewer/form-page.js';

var content = {
  'header': 'Practica',
  'subheader': 'Welcome! To start, can we ask you two questions?',
  'body': 'Short Replies are simple phrases that you can use to make your conversations longer.',
  'buttonText': 'Continue',
  onAction: () => {}
};
var fields = [
  {question: "What is your name?"},
  {question: "What language do you speak best?"}
];
var srAudio = "/audio/short_replies.mp3";

storiesOf('Content Pages', module)
  .add('story page', () => <StoryPage {...content} />)
  .add('story w/ subheader first', () => <StoryPage {...content} subheaderFirst={true} />)
  .add('form page', () => <FormPage {...content} fields={fields} />);

var ModedScript = (m, sT) =>
  <ScriptViewer script={script} audioUrl={srAudio} mode={m} skipTitle={sT} />;
storiesOf('ScriptViewer', module)
  .add('intro screen', () => ModedScript(MODES.TitleMode, false))
  .add('title mode', () => ModedScript(MODES.TitleMode, true))
  .add('audio mode', () => ModedScript(MODES.Listening, true))
  .add('review mode', () => ModedScript(MODES.Reviewing, true))
  .add('record mode', () => ModedScript(MODES.Recording, true))
