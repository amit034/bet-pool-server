import {useVideo} from "react-use";
import backgroundVideo from "../../video/intro.mp4";
import React, {useEffect, useState} from "react";
import {Button, Checkbox} from "semantic-ui-react";

const SplashScreen = ({setSkipIntro}) => {
    const mute = localStorage.getItem('mute') === 'true';
    const showIntro = localStorage.getItem('showIntro') === 'true';
    const muteSite = () => {
        localStorage.setItem('mute' , 'true');
    };
    const unMuteSite = () => {
        localStorage.setItem('mute' , 'false');
    };
    const onShowThisAgain = () => {
        localStorage.setItem('showIntro' , (!showIntro).toString());
        //skipIntro();
    }
    const skipIntro = () => {
        setSkipIntro(true);
    }
    const [video, videoState, controls, ref] = useVideo(
        <video autoPlay muted={mute} id='video'>
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
            <Button className='mute-btn' icon={mute ? 'mute' : 'unmute'}  onClick={mute? unMuteSite : muteSite} />
            <div style={{ height: '100%' }} >
                {video}
            </div>
            <Button className='skip-intro' onClick={skipIntro}>Skip Intro</Button>
            <Checkbox className='show-intro' checked={!showIntro} onChange={onShowThisAgain} label='Dont show this again' />
        </div>
    );
};

export default SplashScreen;