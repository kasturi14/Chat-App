//used for defining functions that are going to generate the message objects.

const generateMessage = (username, text)=>{
    return {
        username, 
        text,
        createdAt: new Date().getTime()
    }
}
const generateLocationMessage = (username, url)=>{
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}
module.exports = {
    generateMessage,
    generateLocationMessage
}