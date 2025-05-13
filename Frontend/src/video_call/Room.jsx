import './Room.css';
import { useState,useEffect,useRef } from 'react';
import Peer from 'peerjs'
import shareScreenIcon from '../assets/screen-share.png';
import stopScreenShareIcon from '../assets/stop-screen-share.png';
import startRecordingIcon from '../assets/start-recording.png';
import stopRecordingIcon from '../assets/stop-recording.png'
import ToggleInput from '../components/toggleInput';

function Room({socket, roomId, userId, role} ){
  const [peerId, setPeerId] = useState('');
  const remoteVideoRef = useRef(null);
  const currentUserVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const [shareScreen, setShareScreen] = useState(false);
  const activeCalls = useRef([]);
  const recorded_video = [];
  const [recordingPlayer, setRecordingPlayer] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [enlargedVideo, setEnlargedVideo] = useState("myvideo");

  useEffect(() => {

    const peer = new Peer(userId, {
      host: "localhost",
      port: 9000,
      path: "/myapp",
      // secure:true
    });

    peer.on('open', (id) => {
      setPeerId(id)
    });

    peer.on('call', async (call) => {

      //var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if (!shareScreen) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
          currentUserVideoRef.current.srcObject = mediaStream;
          activeCalls.current.push(call);
          call.answer(mediaStream);
          call.on('stream', function (remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
          });
        });
      }
      else {
        const mediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        currentUserVideoRef.current.srcObject = mediaStream;
        activeCalls.current.push(call);
        call.answer(mediaStream);
        call.on('stream', function (remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream;
        });
      }


    })

    peerInstance.current = peer;

  }, []);

  const call = async (remotePeerIds) => {

    if (!shareScreen) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
        currentUserVideoRef.current.srcObject = mediaStream;
        remotePeerIds.forEach(remotePeerId => {
          const call = peerInstance.current.call(remotePeerId, mediaStream)
          call.on('stream', (remoteStream) => {
            remoteVideoRef.current.srcObject = remoteStream
            activeCalls.current.push(call);
            // remoteVideoRef.current.play();
          });
        });
      }).catch((err) => {
        console.log(err);
      })
    }
    else {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      currentUserVideoRef.current.srcObject = mediaStream;
      remotePeerIds.forEach(remotePeerId => {
        const call = peerInstance.current.call(remotePeerId, mediaStream)
        call.on('stream', (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream
          activeCalls.current.push(call);
        });
      });
    }
  }

  useEffect(() => {

    const userJoinedHandler = ({ newuser, usersInRoom }) => {
      console.log("got the event");
    };

    socket.on('user-joined-room', userJoinedHandler);

    return () => {
      socket.off('user-joined-room', userJoinedHandler);
    };

  }, [socket, userId]);

  const closeAllCalls = () => {
    activeCalls.current.forEach(call => call.close());
  }

  const peopleInRoomHandler = ({ peopleInRoom }) => {
    const peopleAlreadyInTheRoom = peopleInRoom.filter((users) => users !== userId);
    call(peopleAlreadyInTheRoom);
  }

  useEffect(() => {

    closeAllCalls();
    socket.emit('get-people-in-room', roomId);

    socket.on('people-in-room', peopleInRoomHandler);

    return () => {
      socket.off('people-in-room', peopleInRoomHandler);
    };

  }, [shareScreen]);


  const media_recorder = useRef(null);


  const startRecordingMediaHandler = () => {
    const userMediaStream = currentUserVideoRef.current?.srcObject;
    if (userMediaStream) {
      media_recorder.current = new MediaRecorder(userMediaStream, { mimeType: 'video/webm' });
      media_recorder.current.addEventListener('dataavailable', (e) => {
        recorded_video.push(e.data);
      });
      media_recorder.current.addEventListener('stop', (e) => {
        const video_local = URL.createObjectURL(new Blob(recorded_video, { type: 'video/webm' }));
        setRecordingPlayer(video_local);
      });
      media_recorder.current.start();
    }
    else {
      alert('user media stream not available yet');
    }
  };

  const stopRecordingMediaHandler = () => {
    if (media_recorder.current) {
      media_recorder.current.stop();
    }
  }

  // this is the best day in my life
  return (
    <div className="classRoom_setup">
      <div className="sidebar">
        <ToggleInput purpose={"Control"} inputState={showControls} setInputState={setShowControls} />
      </div>

      <div className='my_video_container' >
        {enlargedVideo === "myvideo" ? (
          <video
            ref={currentUserVideoRef}
            muted
            autoPlay
            className='my_video'
            onClick={() => setEnlargedVideo("myvideo")}
          />
        ) : (
          <video
            ref={remoteVideoRef}
            autoPlay
            className='my_video'
            onClick={() =>{ setEnlargedVideo("remotevideo")}}
          />
        )}
        <div className='remote_video_container' >
          {enlargedVideo === "myvideo" ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              className='remote_video'
              onClick={() =>{ setEnlargedVideo("remotevideo");console.log("toggled from remote video");}}
            />
          ) : (
            <video
              ref={currentUserVideoRef}
              muted
              autoPlay
              className='remote_video'
              onClick={() =>{ setEnlargedVideo("myvideo");console.log("toggled from main video");}}
            />
          )}
        </div>
        {
          showControls &&
          <div className="controls">
            <button onClick={() => setShareScreen(true)}><img src={shareScreenIcon}></img></button>
            <button onClick={() => setShareScreen(false)}><img src={stopScreenShareIcon}></img></button>
            <button onClick={startRecordingMediaHandler}><img src={startRecordingIcon} /></button>
            <button onClick={stopRecordingMediaHandler}><img src={stopRecordingIcon} /></button>
          </div>}
      </div>

      {/* <input type="text" value={remotePeerIdValue} onChange={e => setRemotePeerIdValue(e.target.value)} />
      <button onClick={() => call(remotePeerIdValue)}>Call</button> */}

      {recordingPlayer && <video src={recordingPlayer} autoPlay controls></video>}
    </div>
  );
}

export default Room;