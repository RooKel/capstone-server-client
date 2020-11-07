function FileTransferManager(editor, socket_url)
{
    var Signal = signals.Signal;

    this.signals = {
        file_download: new Signal()
    }
    this.socket = io.connect(socket_url);
}

FileTransferManager.prototype={

    requestFileDownload: function (request_type, category, uid){
        /*  Request Data Structure
        *   --request_type      : 'thumbnail', 'gltf' 두가지 종류로 분기
        *   --category          : 'world', 'avatar' 중 어떤 카테고리를 요청할지 결정
        * */
        let request_tuple ={
            request_type: request_type,
            category: category,
            uid: uid
        }
        this.socket.emit('rq-file-download', request_tuple);
    },
    requestFileUpload: function (dataStream){
        /*  DataStream Structure
        *   --data_name         : 업로드하는 파일이름
        *   --data_creator      : 작성자 이름
        *   --data_type         : 데이터가 'world', 'avatar' 둘 중 어느 것인지 결정
        *   --data_thumbnail    : base64 형식의 png raw data
        *   --raw_gltf          : gltf 파일이다.
        * */
        this.socket.emit('file-upload', dataStream);
    },
    addFileDownloadListener: function (callback){
        this.signals.file_download.add(callback);
    },
    listenFileDownload: function (){
        this.socket.on('file-download',(response)=>{
            console.log("File-Downloaded");
            this.signals.file_download.dispatch(response);
        });
    },
};

export {FileTransferManager};
