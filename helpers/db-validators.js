import {prisma} from '../src/db.js';

export const emailExiste = async( email = '' ) => {

    // Verificar si el correo existe
    const existeEmail = await prisma.users.findFirst({ where: {user_email: email} });
    if ( existeEmail ) {
        throw new Error(`El correo: ${ email }, ya está registrado`);
    }
}

export const existeUsuarioPorId = async( user_id ) => {

    // Verificar si el correo existe
    const existeUsuario = await prisma.users.findFirst({ where: {user_id} });
    if ( !existeUsuario ) {
        throw new Error(`El id no existe ${ user_id }`);
    }
}

export const accountExiste = async( account = '' ) => {

    // Verificar si el número de cuenta existe
    const accountExiste = await prisma.users.findFirst({ where: {user_account: account} });
    if( accountExiste ) {
        throw new Error(`El número de cuenta no existe ${ account }`);
    }
}