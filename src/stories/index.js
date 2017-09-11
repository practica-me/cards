import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { Button, Welcome } from '@storybook/react/demo';

import ScriptViewer from '../components/script-viewer.js'

import script from '../data/short_replies.json';
import transcript from '../data/short_replies_aligned.json';
import destructivelyAlignScript from '../data/script-aligner.js';

destructivelyAlignScript(script, transcript);


storiesOf('Welcome', module).add('to Storybook', () => <Welcome showApp={linkTo('Button')} />);

storiesOf('Button', module)
  .add('with text', () => <Button onClick={action('clicked')}>Hello Button</Button>)
  .add('with some emoji', () => <Button onClick={action('clicked')}>😀 😎 👍 💯</Button>);

storiesOf('ScriptViewer', module)
  .add('text mode', () => <ScriptViewer script={script} mode={'text'}/>)
  .add('audio mode', () => <ScriptViewer script={script} mode={'audio'}/>);
