import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { Button, Welcome } from '@storybook/react/demo';

import ScriptViewer from '../components/script-viewer.js'
import SCRIPT_MODES from '../consts.js';

import script from '../data/short_replies_annotated.json';

storiesOf('Welcome', module).add('to Storybook', () => <Welcome showApp={linkTo('Button')} />);

storiesOf('Button', module)
  .add('with text', () => <Button onClick={action('clicked')}>Hello Button</Button>)
  .add('with some emoji', () => <Button onClick={action('clicked')}>😀 😎 👍 💯</Button>);

storiesOf('ScriptViewer', module)
  .add('title mode', () => <ScriptViewer script={script} mode={SCRIPT_MODES.TITLE_AUDIO}/>)
  .add('text mode', () => <ScriptViewer script={script} mode={SCRIPT_MODES.TEXT}/>)
  .add('audio mode', () => <ScriptViewer script={script} mode={SCRIPT_MODES.AUDIO}/>)
  .add('both', () => <ScriptViewer script={script} mode={SCRIPT_MODES.AUDIO_AND_TEXT}/>);
