const MyPeer = (socket) => {
    const videoGrid = document.getElementById('video-grid')
    const myPeer = new Peer(undefined, {
        host: 'localhost',
        port: '3001',
        path: '/peer'
    })

    const myVideo = document.createElement('video')
    // myVideo.muted = true
     const peers = {}

     
     navigator.mediaDevices.getUserMedia({
         video: true,
         audio: true
    }).then(stream => {
        addVideoStream(myVideo, stream)

        // 내가 전화가 왔을 때
        myPeer.on('call', call => {
            console.log("전화를 받았습니다.");
            call.answer(stream) // 전화를 받겠습니다. call.on('stream') 이벤트 실행
            const video = document.createElement('video')

            // 상대에게 스트림 이벤트를 받았을 때
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream)
            })
        })

        socket.on('peer-connected', uid => {
            console.log("peer connected : " + uid)
            connectToNewUser(uid, stream)
        })
    })

    socket.on('peer-disconnected', uid => {
        if (peers[uid]) peers[uid].close()
    })

    myPeer.on('open', id => {
        socket.emit('peer-login', true);
    })

    function connectToNewUser(userId, stream) {
        const call = myPeer.call(userId, stream)
        const video = document.createElement('video')

        call.on('stream', userVideoStream => {
            console.log("스트림에 연결됨")
          addVideoStream(video, userVideoStream)
        })
        call.on('close', () => {
          video.remove()
        })
      
        peers[userId] = call
        console.log("connectToNewUser 연결 아이디 : " + userId);
        console.log(call);
      }
      
      function addVideoStream(video, stream) {
          console.log("video added");
        video.srcObject = stream
        video.addEventListener('loadedmetadata', () => {
          video.play()
        })
        videoGrid.append(video)


        //var audio = $('<audio autoplay />').appendTo('body');
        //audio[0].src = (URL || webkitURL || mozURL).createObjectURL(stream);
      }
}

export default MyPeer