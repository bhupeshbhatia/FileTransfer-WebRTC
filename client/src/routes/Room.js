// import React, { useEffect, useRef, useState } from "react";
// import io from "socket.io-client";
// import Peer from "simple-peer";
// import styled from "styled-components";
// import streamSaver from "streamsaver";

// const worker = new Worker("../worker.js");

// const Container = styled.div`
//     padding: 20px;
//     display: flex;
//     height: 100vh;
//     width: 90%;
//     margin: auto;
//     flex-wrap: wrap;
// `;

// const Room = (props) => {
//     const [connectionEstablished, setConnection] = useState(false);
//     const [file, setFile] = useState();
//     const [gotFile, setGotFile] = useState(false);

//     const chunksRef = useRef([]);
//     const socketRef = useRef();
//     const peersRef = useRef([]);
//     const peerRef = useRef();
//     const fileNameRef = useRef("");

//     const roomID = props.match.params.roomID;

//     useEffect(() => {
//         socketRef.current = io.connect("/");
//         socketRef.current.emit("join room", roomID);
//         socketRef.current.on("all users", users => {
//             peerRef.current = createPeer(users[0], socketRef.current.id);
//         });

//         socketRef.current.on("user joined", payload => {
//             peerRef.current = addPeer(payload.signal, payload.callerID);
//         });

//         socketRef.current.on("receiving returned signal", payload => {
//             peerRef.current.signal(payload.signal);
//             setConnection(true);
//         });

//         socketRef.current.on("room full", () => {
//             alert("room is full");
//         })

//     }, []);

//     function createPeer(userToSignal, callerID) {
//         const peer = new Peer({
//             initiator: true,
//             trickle: false,
//         });

//         peer.on("signal", signal => {
//             socketRef.current.emit("sending signal", { userToSignal, callerID, signal });
//         });

//         peer.on("data", handleReceivingData);

//         return peer;
//     }

//     function addPeer(incomingSignal, callerID) {
//         const peer = new Peer({
//             initiator: false,
//             trickle: false,
//         });

//         peer.on("signal", signal => {
//             socketRef.current.emit("returning signal", { signal, callerID });
//         });

//         peer.on("data", handleReceivingData);

//         peer.signal(incomingSignal);
//         setConnection(true);
//         return peer;
//     }

//     //If you allow users to send large files - eventually run out of memory
//     // On chrome the file type can't actually be a blocb - supported types = array buffer
//     //Large files with array buffer doesn't work - it gets stuck
//     //So I used stream - at no time would the entire array buffer will be in memory. Just sending little bits of stream

//     function handleReceivingData(data) {
//         if (data.toString().includes("done")) {
//             setGotFile(true);

//             const parsed = JSON.parse(data);
//             fileNameRef.current = parsed.fileName;
//         }
//         else {
//             worker.postMessage(data);
//         }
//     }

//     function download() {
//         //once a file is received setGotfile will become false
//         setGotFile(false);
//         worker.postMessage("download");
//         worker.addEventListener("message", event => {
//             //turn blob back into a stream since it is a large file - can run into memory issue
//             const stream = event.data.stream();
//             const fileStream = streamSaver.createWriteStream(fileNameRef.current);
//             stream.pipeTo(fileStream);
//         });
//     }

//     function selectFile(e) {
//         setFile(e.target.files[0]);
//     }

//     function sendFile() {
//         const peer = peerRef.current;
//         const stream = file.stream();
//         const reader = stream.getReader();

//         //keep calling recursively until buffer stream is done
//         //property done is set from false to true
//         reader.read().then(obj => {
//             handlereading(obj.done, obj.value);
//         });

//         function handlereading(done, value) {
//             if (done) {
//                 peer.write(JSON.stringify({done: true, fileName: file.name}));
//             }

//             //send data off to another peer and other peer is listening for any event and on that event will receive data.
//             peer.write(value);
//             reader.read().then(obj => {
//                 handlereading(obj.done, obj.value);
//             });
//         }
//     }

//     let body;
//     if (connectionEstablished) {
//         body = (
//             <div>
//                 <input onChange={selectFile} type="file" />
//                 <button onClick={sendFile}>Send file</button>
//             </div>
//         );
//     } else {
//         body = (
//             <h1>Once you have a peer connection, you will be able to share files</h1>
//         );
//     }


//     let downloadPrompt;
//     if (gotFile) {
//         downloadPrompt = (
//             <div>
//                 <span>You have received a file. Would you like to download the file?</span>
//                 <button onClick={download}>Yes</button>
//             </div>
//         );
//     }

//     return (
//         <Container>
//             {body}
//             {downloadPrompt}
//         </Container>
//     );
// };

// export default Room;












import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import streamSaver from "streamsaver";

const Container = styled.div`
    padding: 20px;
    display: flex;
    height: 100vh;
    width: 90%;
    margin: auto;
    flex-wrap: wrap;
`;

const worker = new Worker("../../worker.js");

const Room = (props) => {
    const [connectionEstablished, setConnection] = useState(false);
    const [file, setFile] = useState();
    const [gotFile, setGotFile] = useState(false);

    const chunksRef = useRef([]);
    const socketRef = useRef();
    const peersRef = useRef([]);
    const peerRef = useRef();
    const fileNameRef = useRef("");

    const roomID = props.match.params.roomID;

    useEffect(() => {
        socketRef.current = io.connect("/");
        socketRef.current.emit("join room", roomID);
        socketRef.current.on("all users", users => {
            peerRef.current = createPeer(users[0], socketRef.current.id);
        });

        socketRef.current.on("user joined", payload => {
            peerRef.current = addPeer(payload.signal, payload.callerID);
        });

        socketRef.current.on("receiving returned signal", payload => {
            peerRef.current.signal(payload.signal);
            setConnection(true);
        });

        socketRef.current.on("room full", () => {
            alert("room is full");
        })

    }, []);

    function createPeer(userToSignal, callerID) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal });
        });

        peer.on("data", handleReceivingData);

        return peer;
    }

    function addPeer(incomingSignal, callerID) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID });
        });

        peer.on("data", handleReceivingData);

        peer.signal(incomingSignal);
        setConnection(true);
        return peer;
    }

    function handleReceivingData(data) {
        if (data.toString().includes("done")) {
            setGotFile(true);
            const parsed = JSON.parse(data);
            fileNameRef.current = parsed.fileName;
            // peer.write(JSON.stringify({load:true}));
        } else {
            worker.postMessage(data);
        }
    }

    function download() {

        setGotFile(false);
        worker.postMessage("download");
        worker.addEventListener("message", event => {
            const stream = event.data.stream();
            const fileStream = streamSaver.createWriteStream(fileNameRef.current);
            stream.pipeTo(fileStream);
        })
    }

    function selectFile(e) {
        setFile(e.target.files[0]);
    }

    function sendFile() {
        const peer = peerRef.current;
        const stream = file.stream();
        const reader = stream.getReader();

        reader.read().then(obj => {
            handlereading(obj.done, obj.value);
        });

        function handlereading(done, value) {
            if (done) {
                peer.write(JSON.stringify({ done: true, fileName: file.name}));
                return;
            }

            peer.write(value);
            reader.read().then(obj => {
                handlereading(obj.done, obj.value);
            })
        }

    }

    let body;
    if (connectionEstablished) {
        body = (
            <div>
                <input onChange={selectFile} type="file" />
                <button onClick={sendFile}>Send file</button>
            </div>
        );
    } else {
        body = (
            <h1>Once you have a peer connection, you will be able to share files</h1>
        );
    }


    let downloadPrompt;
    if (gotFile) {
        downloadPrompt = (
            <div>
                <span>You have received a file. Would you like to download the file?</span>
                <button onClick={download}>Yes</button>
            </div>
        );
    }

    return (
        <Container>
            {body}
            {downloadPrompt}
        </Container>
    );
};

export default Room;