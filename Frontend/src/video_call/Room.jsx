import './Room.css';
import { useState,useEffect,useRef } from 'react';
import Peer from 'peerjs'
import shareScreenIcon from '../assets/screen-share.png';
import stopScreenShareIcon from '../assets/stop-screen-share.png';
import startRecordingIcon from '../assets/start-recording.png';
import stopRecordingIcon from '../assets/stop-recording.png'
import ToggleInput from '../components/toggleInput';
import axios from "axios";
import WhiteBoard from '../white-board/whiteBoard';

const GetPage = ({ ind ,tool,socket,color,user,roomId}) => {

    return <><WhiteBoard key={ind} tool={tool} socket={socket} user={user} color={color} whiteboardId={ind} roomId={roomId}/></>
}

function Room({socket, roomId, userId, role} ){
  const [peerId, setPeerId] = useState('');
  const remoteVideoRef = useRef(null);
  const currentUserVideoRef = useRef(null);
  const [mystream,setMyStream]=useState(null);
  const [remoteStream,setRemoteStream]=useState(null);
  const peerInstance = useRef(null);
  const [shareScreen, setShareScreen] = useState(false);
  const activeCalls = useRef([]);
  const recorded_video = [];
  const [recordingPlayer, setRecordingPlayer] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [enlargedVideo, setEnlargedVideo] = useState("myvideo");


  const user='student'
  // const classId="class2";
  // this is hardcoded currently
  // implement the logic to get the class id

  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("black");
  //const [showSideBar, setShowSidebar] = useState(false);
  const [showwhiteboard,setShowWhiteBoard]=useState(false);
  const [whiteboard, setWhiteboard] = useState(-1);
  const [totalPages, setTotalPages] = useState(0);

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
          setMyStream(mediaStream);
          currentUserVideoRef.current.srcObject = mediaStream;
          activeCalls.current.push(call);
          call.answer(mediaStream);
          call.on('stream', function (remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
            setRemoteStream(remoteStream);
          });
        });
      }
      else {
        const mediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setMyStream(mediaStream);
        currentUserVideoRef.current.srcObject = mediaStream;
        activeCalls.current.push(call);
        call.answer(mediaStream);
        call.on('stream', function (remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream;
          setRemoteStream(remoteStream);
        });
      }


    })

    peerInstance.current = peer;

  }, []);

  const getTotalPages = async (classId) => {
        const pages = (await axios.get(`https://wbksc495-5000.inc1.devtunnels.ms/${classId}`)).data.totalPages
        // console.log("pages: " +pages)
        setTotalPages(pages);
    }

  const WhiteBoardPages = () => {
        const Bar = []
        for (let i = 0; i < totalPages; i++) {
          Bar.push(
            <button className="btn" key={i} onClick={() => setWhiteboard(i + 1)}>Page {i + 1}</button>
          )
        }
        //console.log(Bar)
        return <div className='whiteboardpages'>
          <h2>Pages</h2>
          {Bar}</div>
        // return <div>This list button is clicked</div>
      }

  const handleAddPage = () => {
      alert(`Before adding a new page make sure all your old pages are saved!`)
      setWhiteboard(totalPages+1);
      setTotalPages((pre)=>pre+1);
  }
      
  const WhiteBoardControls=()=>{
    return (
      <div className="whiteboard-tooling-container">
                    <div className="tools-container">
                        <h3 >Tools</h3>
                        <div className="tool">
                            <label htmlFor="pencil" >Pencil</label>
                            <input type="radio" name="tool" checked={tool == "pencil"} id="pencil" value={"pencil"} onChange={(event) => { setTool(event.target.value) }} />
                        </div>

                        <div className="tool">
                            <label htmlFor="line" >Line</label>
                            <input type="radio" name="tool" checked={tool == "line"} id="line" value={"line"} onChange={(event) => { setTool(event.target.value) }} />
                        </div>

                        <div className="tool">
                            <label htmlFor="rectangle" >Rectangle</label>
                            <input type="radio" name="tool" checked={tool == "rectangle"} id="rectangle" value={"rectangle"} onChange={(event) => { setTool(event.target.value) }} />
                        </div>

                    </div>
                    <div className="color-container">
                      <h3>Color</h3>
                        <div className="color">
                            <input type='color' id='color' className='mt-1' value={color} onChange={(event) => { setColor(event.target.value) }} />
                        </div>
                    </div>
                    <div className="add-page-container">
                        {/* The functionality of this button should completely be changed*/}
                        <button className="btn btn-primary mt-1 pd-1" onClick={() => { handleAddPage() }}>Add Page</button>
                    </div>
                </div>
    )
  }

    
    useEffect(()=>{

      setWhiteboard(showwhiteboard?1:-1);
      if(!showwhiteboard) getTotalPages('class2');

      if(currentUserVideoRef.current&&mystream){
        currentUserVideoRef.current.srcObject=mystream;
      }

      if(remoteVideoRef.current&&remoteStream) {
        remoteVideoRef.current.srcObject=remoteStream;
      }

    },[showwhiteboard,mystream,remoteStream]);

    // useEffect(() => {
    //     if(whiteboard!=-1) {
    //       getTotalPages('class2')
    //     }
    // }, [whiteboard]);


  const call = async (remotePeerIds) => {

    if (!shareScreen) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
        currentUserVideoRef.current.srcObject = mediaStream;
        setMyStream(mediaStream);
        remotePeerIds.forEach(remotePeerId => {
          const call = peerInstance.current.call(remotePeerId, mediaStream)
          call.on('stream', (remoteStream) => {
            remoteVideoRef.current.srcObject = remoteStream;
            setRemoteStream(remoteStream);
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
      setMyStream(mediaStream);
      remotePeerIds.forEach(remotePeerId => {
        const call = peerInstance.current.call(remotePeerId, mediaStream)
        call.on('stream', (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
          setRemoteStream(remoteStream);
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
      {
        showwhiteboard&&
        <video 
            ref={remoteVideoRef}
            autoPlay
            className='remote_video'
            width={"100%"}
            height={"200px"}
            
            // onClick={() =>{ setEnlargedVideo("remotevideo");console.log("toggled from remote video");}}
          />}
        <ToggleInput purpose={"Control"} inputState={showControls} setInputState={setShowControls} />
        <ToggleInput purpose={"WhiteBoard"} inputState={showwhiteboard} setInputState={setShowWhiteBoard} />
        {
          showwhiteboard&&
          <>
          <WhiteBoardPages/>
          <WhiteBoardControls />
          </>
        }
      </div>
 
      {!showwhiteboard&&
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
      </div>}

      {/* <input type="text" value={remotePeerIdValue} onChange={e => setRemotePeerIdValue(e.target.value)} />
      <button onClick={() => call(remotePeerIdValue)}>Call</button> */}

      {
        showwhiteboard&&
        <div className='whiteboard-container'>
          <GetPage ind={whiteboard - 1} socket={socket} color={color} tool={tool} user={user} roomId={roomId}/>
        </div>
      }

      {recordingPlayer && <video src={recordingPlayer} autoPlay controls></video>}
    </div>
  );
}

export default Room;