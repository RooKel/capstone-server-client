import {JSZip} from 'jszip'
import {PackageData} from "./PackageData.js";
import {LoaderUtils} from "./LoaderUtils.js";
import * as THREE from 'three';
import {AudioData} from "./AudioData.js";

function PackageUtil ()
{

}

PackageUtil.convBinaryToPackage = function (blobPackageData, onComplete) {
    let zip = JSZip(blobPackageData);
    let result = new PackageData();
    let tmpFiles = {
        raw_gltf:undefined,
        raw_audio_files:[],
        raw_audio_meta_info:undefined
    };
    let debugText = "Package Extractor : Extract\n";
    zip.filter(function (path, file) {
        debugText += "--File : " + file.name + "\n";
        var extension = file.name.split('.').pop().toLowerCase();
        switch (extension) {
            case 'gltf':
                tmpFiles.raw_gltf = file;
                break;
            case 'mp3':
                tmpFiles.raw_audio_files.push(file);
                break;
            case 'json':
                tmpFiles.raw_audio_meta_info = JSON.parse(file.asText());
                break;
        }
    });
    result.audioFiles = tmpFiles.raw_audio_files;
    result.audioMetaInfo = tmpFiles.raw_audio_meta_info;
    result.gltf = tmpFiles.raw_gltf;
    onComplete(result);
    return result;
};
PackageUtil.convFilesToAudioData = function (_metaFile, _files, onComplete)
{
    let resultSet = [];
    function resolveAfterParse(metaFile, files){
        return new Promise(resolve => {
            let filesMap = LoaderUtils.createFilesMap(files);
            let manager = new THREE.LoadingManager();
            manager.setURLModifier( function ( url ) {

                let file = filesMap[ url ];

                if ( file ) {

                    console.log( 'Loading', url );

                    return URL.createObjectURL( file );

                }
                return url;
            } );
            for (let i = 0; i < files.length; i++)
            {
                var file = files[i];
                var metaInfo = metaFile.audioMetaInfo.find(element=>element.audioPath === file.name);
                var filename = metaInfo.audioName;
                var audioID = metaInfo.audioID;

                let blob = new Blob([file.asArrayBuffer()], {type:'application/octet-stream'});

                let data = new AudioData(audioID, filename, blob, (_data)=>{
                    resultSet.push(data);
                    resolve('resolved');
                });
            }
        });
    }
    async function asyncCall(metaFile, files){
        await resolveAfterParse(metaFile, files)
    }
    asyncCall(_metaFile, _files).then(r=>{
        console.log(r);
        onComplete(resultSet);
    });
}
export {PackageUtil};