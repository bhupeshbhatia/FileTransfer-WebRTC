// let array = [];

// //reference yourself inside of a worker - self
// self.addEventListener("message", event => {
//     if (event.data === "download") {
//         //turn array of chunks back into blob
//         const blob = new Blob(array);

//         //This individual worker will call itself and sent the postmessage back to main thread
//         self.postMessage(blob);
//         array = [];
//     }
//     else {
//         array.push(event.data);
//     }
// });




let array = [];
self.addEventListener("message", event => {
    if (event.data === "download") {
        const blob = new Blob(array);
        self.postMessage(blob);
        array = [];
    } else if (event.data === "abort") {
        array = [];
    } else {
        array.push(event.data);
    }
})