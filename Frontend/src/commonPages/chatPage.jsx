import './chatPage.css';
import { useState, useEffect, useRef } from 'react';
import { Navigate, useSearchParams } from "react-router-dom";
import {crudInstance as axios} from '../components/customAxios'
import { io } from 'socket.io-client'
import {v4 as uuid} from "uuid";
// import { jwtDecode } from 'jwt-decode';

import TeachHublLogo from '/WhatsApp Image 2025-02-19 at 20.32.04_9336c379.jpg';
import newChatIcon from "../assets/new-chat-icon.svg";
import searchlogo from '../assets/search.svg';
import profileIcon from '../assets/image.svg';
import sendIcon from '../assets/send.svg';
import emojiIcon from '../assets/emoji.svg';
import { toast, Toaster } from 'sonner';

const jwt=localStorage.getItem("jwt");

function ChatPage() {

    if(!jwt) return <Navigate to="/signIn" />;

    const [urlsearchparams, _] = useSearchParams();
    const userId = urlsearchparams.get('user');

    const [selectedChatId, setSelectedChatId] = useState("");
    const [userChatList, setUserChatList] = useState({});
    const [wantNewChat, setWantsNewChat] = useState(false);
    const [usersConnectedWith, setUsersConnectedWith] = useState([]);
    const [messagesOfSelectedChat,setMessagesOfSelectedChat]=useState([]);
    const [typingMessage,setTypingMessage]=useState("");
    const socketRef = useRef();

    useEffect(() => {
        socketRef.current = io(`http://localhost:4002/chat`, {
            transports: ['websocket']
        });

        // socketRef.current.connect();

        return () => {
            socketRef.current.disconnect();
        }
    }, []);

    const handleIncomingMessageList = (data) => {
        console.log(data);
        setUserChatList(data);
    };

    const handleMessageForSelectedChat=(data)=>{
        const {success,allmessages,Error}=data;
        if(success) {
            setMessagesOfSelectedChat(allmessages);
            console.log("result ",allmessages);
            // alert("Success");
        }
        else alert(Error);

    };


    const handleTypingMessage=(e)=>{
        const textarea=e.target;

        if(textarea.scrollHeight<150) {
            textarea.style.height="auto";
            textarea.style.height=textarea.scrollHeight+"px";
        }
        setTypingMessage(e.target.value);
    };


    useEffect(() => {

        if (!socketRef.current) return;

        socketRef.current.on('provide-user-details', () => {
            socketRef.current.emit('user-details', {
                userId: userId,
                selectedChat: ""
            });
        });

        socketRef.current.on('message-list', handleIncomingMessageList);
        socketRef.current.on('incoming-message',(data)=>{
            setMessagesOfSelectedChat(pre=>[data,...pre]);
        });

        return () => {
            socketRef.current.off('message-list', handleIncomingMessageList);
            socketRef.current.off('incoming-message',(data)=>{
                setMessagesOfSelectedChat(pre=>[data,...pre]);
            })
            // socketRef.emit('disconnect',userId);
        }

    }, []);

    const handleNewChat = async () => {
        setWantsNewChat(true);
        try {
            const response = await axios.get(`/class/connectedChatUsers/${userId}`);
            setUsersConnectedWith(response.data);
        } catch (err) {
            console.log(err);
            // alert("Error fetching userIDs");
            toast.error("Error fetching userIDs");
        }
    };

    // useEffect(()=>{
    //     console.log(userChatList);
    // },[userChatList]);

    const handleSendMessage=()=>{

        if(typingMessage=="") return ;
        const sentTime=new Date();
        const messageDetails={
            messageId:uuid(),
            sentAt:sentTime,
            from:userId,
            to:selectedChatId,
            content:typingMessage
        }

        

        setMessagesOfSelectedChat(pre=>[messageDetails,...pre]);
        
        socketRef.current.emit('send-message',{userId,selectedChatId,content:typingMessage,sentAt:sentTime,messageId:messageDetails.messageId});
        setTypingMessage("");

    };


    useEffect(()=>{

        if(selectedChatId==""||!socketRef.current) return ;

        socketRef.current.emit('update-selected-chat',{userId,selectedChat:selectedChatId});

        socketRef.current.on('message-list-for-selected-chat',handleMessageForSelectedChat);

        socketRef.current.emit('read-all-messages-from-this-sender',{selectedChat:selectedChatId,userId});

        return ()=>{
            socketRef.current.off('message-list-for-selected-chat',handleMessageForSelectedChat);
        }

    },[selectedChatId]);




    return (
        <div className="chat_page">
            <Toaster richColors/>
            <div className="message_list_container">
                <header>
                    <strong>Chats</strong>
                    <button onClick={handleNewChat}><img src={newChatIcon} height={"25px"} width={"25px"} /></button>
                </header>
                <div className="search_bar">
                    <img src={searchlogo} />
                    <input type="text" className="text" placeholder='Search' />
                </div>
                {
                    wantNewChat &&
                    <div className="new_chat_container">
                        <header style={{ marginBottom: "10px" }}>
                            <strong>Select people to chat with</strong>
                            <button onClick={() => setWantsNewChat(false)}>
                                <strong>X</strong>
                            </button>
                        </header>
                        {
                            usersConnectedWith.map((userId) => (
                                <span key={userId}>
                                    {userId}
                                    <button onClick={() => {
                                        setUserChatList(pre => ({
                                            [userId]: {
                                                recentlySentContent: "",
                                                sentAt: new Date(-8640000000000000),
                                                totalUnreadMessages: 0
                                            }, ...pre
                                        }));
                                        setWantsNewChat(false);
                                    }}>Start</button>
                                </span>
                            ))
                        }
                    </div>
                }
                <div className="chat_list">
                    {
                        Object.keys(userChatList).map((key, ind) => (
                            <button className="list" key={ind} onClick={()=>setSelectedChatId(key)}>
                                <img src={profileIcon} />
                                <div className="side_section">
                                    <p className="name_and_sent_at">
                                        <span>{key}</span>
                                        <span>{new Date(userChatList[key].sentAt).getTime() == -8640000000000000 ? "" : new Date(userChatList[key].sentAt).getTime()}</span>
                                    </p>
                                    <p className="content_and_unread_messages">
                                        <span>{userChatList[key].recentlySentContent}</span>
                                        <span>{userChatList[key].totalUnreadMessages}</span>
                                    </p>
                                </div>
                            </button>
                        ))
                    }
                </div>
            </div>
            <hr />
            <div className="chat_box_container">
                {
                    selectedChatId == '' &&
                    <div className="default_screen">
                        <img src={TeachHublLogo} />
                        <h1><strong>TeachHubl</strong></h1>
                    </div>

                }
                {
                    selectedChatId != ""&&
                    <div className="chat_screen">
                        <header className='chat-header'>
                            <img src={profileIcon} /> &nbsp; &nbsp; 
                            <span >{selectedChatId}</span>
                        </header>
                        <div className="display-chat-container">
                            {
                                messagesOfSelectedChat.map((msg,ind)=>(
                                    <div className="msg_container" style={{flexDirection:(msg.from==userId)?"row-reverse":"row"}} key={ind}>
                                            <div className="msg_box">
                                                <p>{msg.content}</p>
                                                <p><span>{new Date(msg.sentAt).toISOString().split('T')[1].substring(0,5)}</span></p>
                                            </div>
                                    </div>
                                ))
                            }
                        </div>
                        <div className="text_box_container">
                            <img src={emojiIcon} />
                            <textarea  placeholder={"Type your message here..."} value={typingMessage}
                            onChange={handleTypingMessage}></textarea>
                            <img src={sendIcon} onClick={handleSendMessage}/>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default ChatPage;