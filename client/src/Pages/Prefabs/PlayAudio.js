import {AudioLoader, PositionalAudio} from 'three'

const PlayAudio = (dest, params)=>{
    const my_audio = params['audio_file'];
    const volume = params['volume'];
    const loop = params['loop'];
    my_audio.setVolume(volume);
    my_audio.setLoop(loop);
    my_audio.position.copy(dest.position);
    my_audio.play();
}

export {PlayAudio}