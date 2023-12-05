import {prisma} from '../src/db.js';
import jwt from 'jsonwebtoken';
import generarJWT from '../helpers/generar-jwt.js';

export const emailExiste = async( email = '' ) => {

    // Verificar si el correo existe
    const existeEmail = await prisma.users.findFirst({ where: {user_email: email} });
    if ( existeEmail ) {
        throw new Error(`El correo: ${ email }, ya está registrado`);
    }
}

export const existeUsuarioPorId = async( user_id ) => {

    // Verificar si el correo existe
    const existeUsuario = await prisma.users.findFirst({ where: {user_id: user_id} });
    if ( !existeUsuario ) {
        throw new Error(`El id no existe ${ user_id }`);
    }
}

export const accountExiste = async( account = '' ) => {

    // Verificar si el número de cuenta existe
    const accountExiste = await prisma.users.findFirst({ where: {user_account: account} });
    if( accountExiste ) {
        throw new Error(`El número de cuenta ${ account }, ya está registrado`);
    }
}

export const accountNoExiste = async( account = '' ) => {

    // Verificar si el número de cuenta existe
    const accountNoExiste = await prisma.users.findFirst({ where: {user_account: account} });
    if( !accountNoExiste ) {
        throw new Error(`El número de cuenta ${ account } no está registrado`);
    }
}

export const validarJWT = async( req, res, next ) => {

    const token = req.header('x-token');

    if ( !token ) {
        return res.status(401).json({
            msg: 'No hay token en la petición'
        });
    }

    try {
        
        const { uid } = jwt.verify( token, process.env.SECRETORPRIVATEKEY );

        // leer el usuario que corresponde al uid
        const usuario = await prisma.users.findFirst( {where: {user_id: uid}} );

        if( !usuario ) {
            return res.status(401).json({
                msg: 'Token no válido - usuario no existe DB'
            })
        }
        
        req.user = usuario;
        console.log(req.user);
        next();

    } catch (error) {

        console.log(error);
        res.status(401).json({
            msg: 'Token no válido'
        })
    }
}

export const validarTokenUsuario = async(req, res) => {

    // Generar JWT                  Puede que truene
    const token = await generarJWT(req.user.user_id);

    console.log(token);

    res.json({
        usuario: req.user,
        token: token,
    })
}