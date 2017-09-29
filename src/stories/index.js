import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { Button, Welcome } from '@storybook/react/demo';

import ScriptViewer from '../components/script-viewer/script-viewer.js'
import MODES from '../components/script-viewer/consts.js';
import units from '../data/units_and_lessons.json';
import script from '../../public/scripts/short_replies_annotated.json';

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

storiesOf('Content Pages', module)
  .add('story page', () => <StoryPage {...content} />)
  .add('story w/ subheader first', () => <StoryPage {...content} subheaderFirst={true} />)
  .add('form page', () => <FormPage {...content} fields={fields} />);

storiesOf('ScriptViewer', module)
  .add('intro screen', () => <ScriptViewer script={script} mode={MODES.TitleMode} />)
  .add('title mode', () => <ScriptViewer script={script} mode={MODES.TitleMode} skipTitle={true} />)
  .add('audio mode', () => <ScriptViewer script={script} mode={MODES.Listening} skipTitle={true} />)
  .add('listening review mode', () => <ScriptViewer script={script} mode={MODES.Reviewing} skipTitle={true} />)
  .add('recording', () => <ScriptViewer script={script} mode={MODES.Recording} skipTitle={true} />);
