import './chatPage.css';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { io } from 'socket.io-client'

import TeachHublLogo from '/WhatsApp Image 2025-02-19 at 20.32.04_9336c379.jpg';
import newChatIcon from "../assets/new-chat-icon.svg";
import searchlogo from '../assets/search.svg';


function ChatPage() {

    const [urlsearchparams, _] = useSearchParams();
    const userId = urlsearchparams.get('user');

    const [selectedChatId, setSelectedChatId] = useState("");
    const socketRef = useRef();

    useEffect(() => {
        socketRef.current = io(`http://localhost:4002/chat`,{
            transports:['websocket']
        });

        // socketRef.current.connect();

        return () => {
            socketRef.current.disconnect();
        }
    }, []);

    const handleIncomingMessageList=(data)=>{
        console.log(data);
        alert("data is received");
    };

    useEffect(() => {

        if (!socketRef.current) return;

        socketRef.current.on('provide-user-details', () => {
            socketRef.current.emit('user-details',{
                userId:userId,
                selectedChat:""
            });
        });

        socketRef.current.on('message-list',handleIncomingMessageList);

        return ()=>{
            socketRef.current.off('message-list',handleIncomingMessageList)
        }

    }, []);



    return (
        <div className="chat_page">
            <div className="message_list_container">
                <header>
                    <strong>Chats</strong>
                    <button><img src={newChatIcon} height={"25px"} width={"25px"} /></button>
                </header>
                <div className="search_bar">
                    <img src={searchlogo} />
                    <input type="text" className="text" placeholder='Search' />
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
                    selectedChatId != ""
                }
            </div>
        </div>
    )
}

export default ChatPage;