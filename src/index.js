const path = require('path')
const http = require('http')

const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage,generateLocationMessage} = require('./utils/messages')
const {addUser,getUser,removeUser,getUsersByRoom} = require('./utils/users')
    
    
    
const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')
//app.use(express.json())
app.use(express.static(publicDirectoryPath))
//const port = 3000



io.on('connection',(socket)=>{
    console.log('New web socket connection')

    

    socket.on('join',({username,room},callback)=>{
        const {error, user} = addUser({id:socket.id ,username ,room})

        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message',generateMessage('Admin','Welcome'))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))

        io.to(user.room).emit('roomData',{
            room : user.room,
            users : getUsersByRoom(user.room)
        })

        callback()

    })

   socket.on('SendMessage',(message, callback)=>{
       const user = getUser(socket.id)
       if(user){
       const filter = new Filter()
       if(filter.isProfane(message)){
           return callback('profanity not allowed')
       }      //testing if bad words
       io.to(user.room).emit('message',generateMessage(user.username,message))
       callback()
    }
   })

   socket.on('disconnect',()=>{
       const user = removeUser(socket.id)
       
       if(user){
       io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`))
       io.to(user.room).emit('roomData',{
           room : user.room,
           users : getUsersByRoom(user.room)
       })
       }
   })

//    socket.on('SendLatitude',(message)=>{
//        io.emit('message',message)
//    })

//    socket.on('SendLongitude',(message)=>{
//        io.emit('message',message)

//    })

    // socket.on('SendLocation',(message)=>{
    //     io.emit('message',message)

    // })

    socket.on('SendLocation',(message,callback)=>{
        const user = getUser(socket.id)
        if(user){
        io.to(user.room).emit('LocationMessage',generateLocationMessage(user.username,`https://www.google.com/maps?q=${message.latitude},${message.longitude}`))
        callback()
        }

    })

    

   
})

server.listen(port,()=>{
    console.log('server is up on port ',port)
})




module.exports = app