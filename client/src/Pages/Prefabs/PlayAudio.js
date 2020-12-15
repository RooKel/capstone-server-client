
const PlayAudio = (dest, params)=>{
    const my_audio = params['audio_file'];
    const volume = params['volume'];
    const loop = params['loop'];
    console.log(params);
    my_audio.autoplay = params['awake'];
    my_audio.setVolume(volume);
    my_audio.setLoop(loop);
    if(dest){
        if(my_audio.isPlaying)
            my_audio.stop();
        else
            my_audio.play();
    }
}

export {PlayAudio}