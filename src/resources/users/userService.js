const User = require('./usersModel')
const {getModelError, NotFoundError, UnexpectedError} = require('../utils/modelErrors')


const findOneUser = async (filter) => {
    try {
        if (filter.id) return await User.findById(filter.id)
        return await User.findOne(filter)
    } catch (error) {
        throw getModelError(error)        
    }
}

const checkUserFound = (user, filter) => {
    if(user) return user
    throw new NotFoundError(filter)
}

const getUser = async (filter) => {
    const userFound = await findOneUser(filter)
    return checkUserFound(userFound, filter)
}


const updateOneUser = async (id, user) => {
    try{
        return await User.updateOne({_id:id}, user)
    }catch(error){
        throw (getModelError(error))
    }
}

const checkUpdateReport = (id, updateReport) => {
    if(!updateReport.matchedCount) throw new NotFoundError({id:id})
    // maybe return 202? here is 0 if the request is equal to registered data
    // if(!updateReport.modifiedCount) throw new UnexpectedError("Could not update user")
}


module.exports = {
    create: (async (user) => {
        try{
            const newUser = new User(user)
            return await newUser.save()
        }catch(error){
            throw (getModelError(error))
        }
    }),
    getById: (async (id, caller) => {
        const filter = {id:id}
        return await getUser(filter)

    }),
    getByEmail: (async (email, caller) => {
        const filter = {email: email}
        return await getUser(filter)        
        }),
    update: (async (user, id, caller) => {
        const filter = {id:id}
        const registeredUser = await getUser(filter)
        registeredUser.name = user.name
        registeredUser.email = user.email
        registeredUser.password = user.password
        registeredUser.lastName = user.lastName
        try {
            return await registeredUser.save()
        } catch (error) {
            throw (getModelError(error))
        }        
        // const updateReport = await updateOneUser(id, user)
        // return checkUpdateReport(id, updateReport)
    }),
}