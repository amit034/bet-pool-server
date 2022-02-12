import {useVideo, useLocalStorage} from "react-use";
import backgroundVideo from "../../video/intro.mp4";
import React, {useEffect} from "react";
import {Button, Checkbox} from "semantic-ui-react";
const Intro = ({setSkipIntro}) => {
    const [mute, setMute] = useLocalStorage('mute', 'false');
    const [showIntro, setShowIntro] =  useLocalStorage('showIntro', 'true');
    const muteSite = () => {
        setMute('true')
    };
    const unMuteSite = () => {
        setMute('false')
    };
    const onShowThisAgain = () => {
        setShowIntro((!(showIntro === 'true')).toString());
        skipIntro();
    }
    const skipIntro = () => {
        setSkipIntro(true);
    }
    const [video, videoState, controls, ref] = useVideo(
        <video autoPlay playsInline muted={mute === 'true'} id='video'>
            <source src={backgroundVideo} type='video/mp4'/>
        </video>
    );
    useEffect(() => {
        if (ref && ref.current) {
            ref.current.addEventListener('ended', () => {
                skipIntro();
            });
        }
    }, [video]);
    return (
        <div className='splash-screen'>
            <Button className='mute-btn' icon={mute === 'true' ? 'mute' : 'unmute'}  onClick={mute ? unMuteSite : muteSite} />
            <div style={{ height: '100%' }} >
                {video}
            </div>
            <Button className='skip-intro' onClick={skipIntro}>Skip Intro</Button>
            <Checkbox className='show-intro' checked={showIntro === 'false'} onChange={onShowThisAgain} label='Dont show this again' />
        </div>
    );
};

export default Intro;