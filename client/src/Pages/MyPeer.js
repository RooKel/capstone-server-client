const MyPeer = (socket) => {
    const videoGrid = document.getElementById('video-grid')
    const myPeer = new Peer(undefined, {
        host: 'localhost',
        port: '3001',
        path: '/peer'
    })

    const myVideo = document.createElement('video');
    myVideo.muted = true;
    const peers = {};

    myPeer.on('open', (id) => {
        socket.emit('peer-login', id);
    });

    socket.on('peer-connected', pid => {
        connectToNewUser(pid);
    });

    myPeer.on('connection', (conn)=>{
       console.log("incoming peer connection!");
       conn.on('data',(data)=>{
          console.log("MY Received Data : " + data);
       });
       conn.on('open', ()=>{
           conn.send('My Send Hello!');
       })
    });

    // 내가 전화가 왔을 때
    myPeer.on('call', (call)=>{
        navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true
        }).then(stream=>{
            call.answer(stream);

            let video = document.createElement('video');
            videoGrid.append(video);

            call.on('stream', (remoteStream)=>{
                console.log("test");
                addVideoStream(video, remoteStream)
            });

        }).catch((err)=>{
            console.log("Failed to get local stream", err);
        });
    });


    socket.on('peer-disconnected', uid => {
        if (peers[uid]) peers[uid].close()
    })
    function connectToNewUser(userId) {
        let conn = myPeer.connect(userId);
        conn.on('data', (data)=>{
            console.log("Receive Data : " + data);
        })
        conn.on('open', ()=>{
            conn.send('hi!');
        })
        navigator.mediaDevices.getUserMedia({video:false, audio:true})
            .then((stream)=>{
                let call = myPeer.call(userId, stream);
                let video = document.createElement('video');
                videoGrid.append(video);
                call.on('stream', (userVideoStream)=>{
                    console.log("스트림에 연결됨")
                    addVideoStream(video, userVideoStream)
                })
                peers[userId] = call;
            })
            .catch((err)=>{
               console.log('Failed to get local stream', err);
            });
      }

      function addVideoStream(video, stream) {
          console.log("video added");
        video.srcObject = stream
        video.addEventListener('loadedmetadata', () => {
          video.play()
        })
        videoGrid.append(video)
      }
}

export default MyPeer
