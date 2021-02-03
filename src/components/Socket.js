import React, {useEffect} from 'react';
import {Terminal} from 'xterm'
import 'xterm/css/xterm.css'

const term = new Terminal({
    cursorBlink: true
})
const ws = new WebSocket("ws://211.253.10.9:8080/ws/sftp")
const inputValue = []
let uuid = ""

const Socket = () => {

    term.onKey((key) => {

        //ESC key 입력
        if (key.domEvent.code === "Backspace") {
            inputValue.pop()
            console.log(inputValue)
            term.write("\b \b")
        }
        else if (key.domEvent.code === "Enter") {
            ws.send(JSON.stringify({
                "requestType" : "Command",
                "uuid" : uuid,
                "message" : inputValue.join("")
            }))
            ws.onmessage = (e) => {
                console.log(e.data)
            }
        }
        else if (key.domEvent.code === "Escape") { //sftp 연결종료
            ws.send(JSON.stringify({
                "requestType": "Disconnect",
                "uuid": uuid
            }))
            ws.onmessage = (e) => {
                console.log(e.data)
            }
        }else{
            term.write(key.key)
            inputValue.push(key.key)
            console.log(inputValue)
            // ws.send(JSON.stringify({
            //     "requestType" : "Message",
            //     "uuid" : uuid,
            //     "message" : key.key
            // }))
        }

    })

    useEffect(() => {
        //xterm 연결
        term.open(document.getElementById('terminal'))
        term.write("web shell $")
        //명령어전송 부분

        //websocket open
        ws.onopen = function (e) {
            console.log("open connection")
            //원격지 sftp 서버에 연결
            ws.send(JSON.stringify({
                "requestType": "Connect",
                "host": "211.253.10.9",
                "user": "root",
                "password": "Netand141)",
                "port": 10021
            }))
        }
        ws.onmessage = (e) => {
            const data = JSON.parse(e.data)
            uuid = data.uuid
        }
        // ws.onclose = function (e) {
        //     if (e.wasClean) {
        //         alert(`[close] 커넥션이 정상적으로 종료되었습니다(code=${e.code} reason=${e.reason})`);
        //     } else {
        //         // 예시: 프로세스가 죽거나 네트워크에 장애가 있는 경우
        //         // event.code가 1006이 됩니다.
        //         alert('[close] 커넥션이 죽었습니다.');
        //     }
        // };

        ws.onerror = function (error) {
            alert(`[error] ${error.message}`);
        };
    }, [])


    return (
        <div>
            <h2>웹 터미널</h2>
            <div id="terminal"></div>
        </div>
    );
};

export default Socket;
