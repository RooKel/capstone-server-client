
const PlayAudio = (dest, params)=>{
    const my_audio = params['audio_file'];
    const volume = params['volume'];
    const loop = params['loop'];
    my_audio.autoplay = params['awake'];
    my_audio.setVolume(volume);
    my_audio.setLoop(loop);
    my_audio.play();
}

export {PlayAudio}