var ID3 = window.ID3;

function AudioData (audioFile, callback)
{
    this.fileName = "";
    this.duration = 0;
    this.coverImage = undefined;
    this.dataBuffer = undefined;

    var scope = this;

    parseBuffer(audioFile);

    function parseBuffer(file){
        ID3.loadTags("filename.mp3", function(){
            var tags = window.ID3.getAllTags("filename.mp3");
            scope.fileName = tags.title;
            scope.coverImage = tags.picture;
            if(callback !== undefined)
                callback(scope);
        },{
            dataReader: ID3.FileAPIReader(file)
        });

    }

}

export {AudioData};
