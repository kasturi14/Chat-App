//used for defining functions that are going to generate the message objects.

const generateMessage = (text)=>{
    return {
        text,
        createdAt: new Date().getTime()
    }
}
const generateLocationMessage = (url)=>{
    return {
        url,
        createdAt: new Date().getTime()
    }
}
module.exports = {
    generateMessage,
    generateLocationMessage
}