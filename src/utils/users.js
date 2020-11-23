const users = []

//add usr, emove user, get user , user in room

const addUser = ({id, username , room})=>{
    //cleaning data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate data
    if(!username ||!room){

        return {
            error : 'User Name and room are required!'
        }

    }

    //check for existing user
    const existingUser = users.find((user)=>{
        return user.username === username && user.room === room

    })

    //validate user

    if(existingUser){
        return {
            error : 'user name already taken'
        }
    }

    const user = {id,username,room}
    users.push(user)
    return {
        user
    }
}

//Remove user

const removeUser = (id)=>{
    const index = users.findIndex((user)=>{
        return user.id ===id
    })

    if(index !== -1){
        return users.splice(index,1)[0]
    }

}

//get userby id
const getUser = (id)=>{
    const user = users.find((user)=>{
        return user.id === id    
    })
    if(!user){
        return {
            error : 'user not found'
        }
    }
    return user  
}

//get romm and find users

const getUsersByRoom = (room)=>{
    room = room.trim().toLowerCase()
    return users.filter((user)=> user.room === room)
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersByRoom
}

