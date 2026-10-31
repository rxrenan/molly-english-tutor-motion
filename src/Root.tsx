import {Composition} from 'remotion';
import {Tutora, DURATION} from './Tutora';
import {TutoraV3, DURATION_V3} from './TutoraV3';
import {TutoraV2, DURATION_V2} from './TutoraV2';
import {TutoraV1, DURATION_V1} from './TutoraV1';
export const Root = () => (
  <>
    <Composition id="Tutora" component={Tutora} durationInFrames={DURATION} fps={30} width={1080} height={1920} />
    <Composition id="TutoraV1" component={TutoraV1} durationInFrames={DURATION_V1} fps={30} width={1080} height={1920} />
    <Composition id="TutoraV2" component={TutoraV2} durationInFrames={DURATION_V2} fps={30} width={1080} height={1920} />
    <Composition id="TutoraV3" component={TutoraV3} durationInFrames={DURATION_V3} fps={30} width={1080} height={1920} />
  </>
);
