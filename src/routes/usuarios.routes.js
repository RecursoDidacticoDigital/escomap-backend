import {Router} from 'express';
import { prisma } from '../db.js';
import bcrypt from 'bcryptjs';
import generarJWT from '../../helpers/generar-jwt.js';
import {check} from 'express-validator';
import validarCampos from '../../middlewares/validar-campos.js';

import {
    emailExiste, 
    accountExiste, 
    accountNoExiste,
    validarTokenUsuario,
    validarJWT
} from '../../helpers/db-validators.js';

export const router = Router();

router.post('/users/register', [
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('password', 'La contraseña debe ser de más de 6 caracteres').isLength({min: 6}),
    check('email', 'El correo no es válido').isEmail(),
    check('email').custom(emailExiste),
    check('account', 'El número de cuenta o de empleado es de mínimo 10 caracteres').isLength({min: 10}),
    check('account').custom(accountExiste),
    validarCampos
],async (req, res, next) => {
    
    const body = req.body;
    //console.log(body);
    const header = req.headers;
    //console.log(header);
    const {name, email, password, account} = body;
    var role 
    if(account.length === 10){
        role = 'estudiante';
    }
    if(account.length > 10){
        role = 'profesor';
    }
    try {
        const usuario = await prisma.users.create({
            data: {
                user_name: name,
                user_email: email,
                user_password: bcrypt.hashSync(password),
                user_account: account,
                user_role: role
            },
        });

        // Generar el JWT
        const token = await generarJWT( usuario.user_id );
        console.log(usuario);
        console.log(token);
        console.log("Successful signup");
        return res.json({
            usuario,
            token
        });
    } catch (error) {
        console.log(error.message);
        return res.send("Bad request");
    }
});

router.post('/users/login', [
    check('account', 'El número de cuenta es obligatorio').not().isEmpty(),
    check('account').custom(accountNoExiste),
    check('password', 'La contraseña debe ser de más de 6 caracteres').isLength({min: 6}),
    validarCampos
], async (req, res) => {
    const {account, password} = req.body;

    try {
        
        // Indica los datos que se requerirán
        const usuario = await prisma.users.findFirst({where: {user_account: account},
        select:{
            user_id: true,
            user_name: true,
            user_account: true,
            user_email: true,
            user_password: true,
            user_role: true
        }});

        // Verificar si el número de cuenta existe
        if(!usuario){
            return res.status(400).json({
                msg: 'Número de cuenta o de empleado no es correcto'
            });
        }

        // Verificar la contraseña                  Puede que truene
        /*const user_password = bcrypt.(usuario.user_id);
        console.log(user_password);
        const validPassword = bcrypt.compareSync(password, user_password);*/
        if(!bcrypt.compareSync(password, usuario.user_password)) {
            return res.status(400).json({
                msg: 'Contraseña no es correcta'
            });
        }

        // Generar el JWT               Puede que truene
        const token = await generarJWT( usuario.user_id );
        console.log(usuario);
        console.log(token);
        console.log("Successful signup");
        return res.json({
            usuario,
            token
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'Comuníquese con el administrador'
        });
    }
});

router.get('/', [
    validarJWT
], validarTokenUsuario);

export default router;
