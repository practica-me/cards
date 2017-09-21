import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { Button, Welcome } from '@storybook/react/demo';

import ScriptViewer from '../components/script-viewer/script-viewer.js'
import MODES from '../components/script-viewer/consts.js';

import script from '../data/short_replies_annotated.json';

storiesOf('Welcome', module).add('to Storybook', () => <Welcome showApp={linkTo('Button')} />);

storiesOf('Button', module)
  .add('with text', () => <Button onClick={action('clicked')}>Hello Button</Button>)
  .add('with some emoji', () => <Button onClick={action('clicked')}>😀 😎 👍 💯</Button>);

storiesOf('ScriptViewer', module)
  .add('intro screen', () => <ScriptViewer script={script} mode={MODES.TitleMode} />)
  .add('title mode', () => <ScriptViewer script={script} mode={MODES.TitleMode} skipTitle={true} />)
  .add('audio mode', () => <ScriptViewer script={script} mode={MODES.Listening} skipTitle={true} />)
  .add('listening review mode', () => <ScriptViewer script={script} mode={MODES.Reviewing} skipTitle={true} />)
  .add('recording', () => <ScriptViewer script={script} mode={MODES.Recording} skipTitle={true} />);
