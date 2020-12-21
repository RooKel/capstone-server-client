
const PlayAudio = (dest, params)=>{
    //console.log('attempt to play');
    const my_audio = params['audio_file'];
    const volume = params['volume'];
    const loop = params['loop'];
    if(params['awake']) my_audio.autoplay = params['awake'];
    my_audio.setVolume(volume);
    my_audio.setLoop(loop);
    if(params['ready'])
        my_audio.play();
    else
        my_audio.autoplay = true;
}

export {PlayAudio}