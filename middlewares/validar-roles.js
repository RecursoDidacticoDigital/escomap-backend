import response  from 'express';


export const esAdminRole = ( req, res = response, next ) => {

    const body = req.body;

    const {name, role} = body;

    if ( !body ) {
        return res.status(500).json({
            msg: 'Se quiere verificar el role sin validar el token primero'
        });
    }

    //const { rol, nombre } = req.usuario;
    
    if ( role !== 'administrador' || role !== 'superadmin') {
        return res.status(401).json({
            msg: `${ name } no es administrador - No puede hacer esto`
        });
    }
    next();
}


export const tieneRole = ( ...roles  ) => {
    return (req, res = response, next) => {
        
        const body = req.body;

        if ( !body ) {
            return res.status(500).json({
                msg: 'Se quiere verificar el role sin validar el token primero'
            });
        }

        if ( !roles.includes( body.user_role ) ) {
            return res.status(401).json({
                msg: `El servicio requiere uno de estos roles ${ roles }`
            });
        }
        next();
    }
}