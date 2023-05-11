const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

const getUsers = asyncHandler(async (req, res) => {
    
    const users = await User.find()
    if (!users.length) {
        res.status(400)
        throw new Error('There are no users regristed')
    }

    //res.status(200).json({ mensaje: 'All products' })
    res.status(200).json(users)
}) 

const loginUser = asyncHandler(async (req, res) => {

    //desestructuramos la informacion del body request
    const { email, password } = req.body

    //verificamos que recibamos la informacion que el modelo User necesita
    if (!email || !password) {
        res.status(400)
        throw new Error('Favor de verificar que esten todos los datos')
    }

    //verificamos que el usuario exista
    const user = await User.findOne({ email })

    //comparamos el hash del password y el usuario
    if (user && (await bcrypt.compare(password, user.password))) {
        res.status(200).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user.id)
        })
    } else {
        res.status(400)
        throw new Error('Credenciales Incorrectas')
    }
})

const registerUser = asyncHandler(async (req, res) => {

    //desestructuramos el body request
    const { name, email, password, isAdmin } = req.body

    //verificamos que recibamos la informacion que el modelo User necesita
    if (!name || !email || !password || !isAdmin) {
        res.status(400)
        throw new Error('Llena todos los datos')
    }

    //verificamos que no exista ya ese usuario en la coleccion
    const userExiste = await User.findOne({ email })
    if (userExiste) {
        res.status(400)
        throw new Error('Ese email ya fué registrado, el usuario ya existe')
    }

    //hash al password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    //creamos el usuario
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        isAdmin
    })

    //mandamos la respuesta de la funcion
    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
        })
    } else {
        res.status(400)
        throw new Error('No se pudo crear el usuario, datos incorrectos')
    }
})

const getMisDatos = asyncHandler(async (req, res) => {
    res.json(req.user)
})

//-----------------------

// Guardar movie user

const saveMovie = asyncHandler (async (req,res) => {
    
})



const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}

module.exports = {
    getUsers,
    loginUser,
    registerUser,
    getMisDatos
}