import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';
import {useAudio, useLocalStorage} from 'react-use';
import _ from 'lodash';

const GoalSound = () => {
    const [mute] = useLocalStorage('mute', 'false');
    const goals = useSelector(state => state.pools.goals);
    let goalHandler;
    const [audio, state, goalSoundControllers, audioRef] = useAudio({
        src: '../../../../sounds/goal3.mp3'
    });
    useEffect(() => {
            if (!_.isEmpty(goals) && audioRef && audioRef.current && mute !== 'true') {
                if (goalHandler){
                    clearTimeout(goalHandler);
                }
                audioRef.current.currentTime = 5;
                goalSoundControllers.play();
                goalHandler = setTimeout(() => {
                    goalSoundControllers.pause();
                }, 20000);
            }
        },
        [goals, audioRef]
    );
    return (<div>
        {audio}
    </div>);

}

export default GoalSound;
