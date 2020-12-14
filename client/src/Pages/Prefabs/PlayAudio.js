import {AudioLoader} from 'three'

const PlayAudio = (dest, params)=>{
    const audio_id = params.audioID;
    const volume = params.volume;
    const loop = params.loop;
    const audio_files =params.audio_files;
    console.log(audio_files);
}

export {PlayAudio}