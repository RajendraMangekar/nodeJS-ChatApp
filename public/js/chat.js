//const messages = require("../../src/utils/messages")

const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $SendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
//const $messageTemplate = document.querySelector('message-template').innerHTML
const $messagesTemplate=document.querySelector("#message-template").innerHTML
const $locationsTemplate=document.querySelector("#location-template").innerHTML
const $sideBarTemplate = document.querySelector("#sidebar-template").innerHTML

//options
const {username , room } = Qs.parse(location.search,{ ignoreQueryPrefix : true})

const autoScroll = ()=>{
    //new message
    const $newMessage = $messages.lastElementChild

    //height of last element
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of message container
    const containerHeight = $messages.scrollHeight

    //how far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

     if(containerHeight - newMessageHeight <= scrollOffset){
         $messages.scrollTop = $messages.scrollHeight
    }



}


socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render($messagesTemplate,{
        userName : message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm:ss a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

//location listning
socket.on('LocationMessage',(url)=>{
    console.log(url)
    const html = Mustache.render($locationsTemplate,{
        userName : url.username,
        url : url.text,
        createdAt:moment(url.createdAt).format('h:mm:ss a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render($sideBarTemplate,{
        room,
        users

    })
    document.querySelector('#sidebar').innerHTML= html
})


$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    //Disable
    const message = e.target.elements.message.value
    //const message = document.querySelector('input').value
    //console.log(message)
    socket.emit('SendMessage',message, (error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('message delivered')
    })
    
})

$SendLocationButton.addEventListener('click',()=>{
    
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    $SendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        //console.log(position)
        //console.log(position.coords.latitude)
        //console.log(position.coords.longitude)
        //const message_latitude = position.coords.latitude
        //const message_longitude = position.coords.longitude

        //socket.emit('SendLatitude',message_latitude)
        //socket.emit('SendLongitude',message_longitude)
        
        socket.emit('SendLocation',{
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        },(message)=>{
            $SendLocationButton.removeAttribute('disabled')
            console.log('Location shared')

        })
       

    })

})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }

})
