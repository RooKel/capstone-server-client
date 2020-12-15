import * as THREE from "../../build/three.module.js";

var ID3 = window.ID3;

function AudioData (_audioID, _fileName, _audioFile, _callback)
{
    if(!_audioID) this.audioID = THREE.MathUtils.generateUUID();
    else this.audioID = _audioID;
    this.fileName = _fileName;
    this.artist = "";
    this.coverImage = undefined;
    this.dataBuffer = undefined;

    var scope = this;

    parseBuffer(_audioFile);

    function parseBuffer(file){
        ID3.loadTags(_fileName, function(){
            var tags = ID3.getAllTags(_fileName);
            scope.fileName = tags.title;
            scope.artist = tags.artist;

            var image = tags.picture;
            if(image !== undefined)
            {
                var base64String = "";
                for (var i = 0; i < image.data.length; i++) {
                    base64String += String.fromCharCode(image.data[i]);
                }
                scope.coverImage = "data:" + image.format + ";base64," + window.btoa(base64String);
            }
            scope.dataBuffer = file;
            if(_callback !== undefined)
                _callback(scope);
        },{
            tags: ["artist", "title", "album", "year", "comment", "track", "genre", "lyrics", "picture"],
            dataReader: ID3.FileAPIReader(file)
        });

    }

}
export {AudioData};
