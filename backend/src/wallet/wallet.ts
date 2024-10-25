import { Request, RequestHandler, Response } from "express";
import { RowDataPacket, FieldPacket } from 'mysql2';

export namespace walletHandler {

    //Carteira do usuario
    export type UserWallet = {
        id: number;
        value: number;
    }

    function connectDatabase() {
        var mysql = require('mysql2');
        const conn = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'footbet'
        });

        return conn;
    }

    async function seeBalance(id_user: number) {
        if (id_user) {
            let conn = connectDatabase();
            conn.query(`SELECT SUM(value) as 'saldo' FROM Transacao WHERE id_user = ${id_user};`, function (err: Error, data: RowDataPacket[]) {
                if (!err) {
                    return data[0].saldo;
                }
            });
        }
    }

    //Verificando se os dados estão vindo e chamando a função de add deposito
    export const addFunds: RequestHandler = (req: Request, res: Response) => {
        const id_wallet = Number(req.get('id_wallet'));
        const id_user = Number(req.get('id_user'));
        let value = Number(req.get('value'));
        const type = 'deposito';

        //verificando se nao vem campo vazio
        if (id_wallet && id_user && value && type) {
            console.log(value)
            //conectando com o banco, fiz a função para nao ter que copiar 7 linhas toda hora
            let conn = connectDatabase();
            conn.query(`INSERT INTO Transacao VALUES(${id_wallet},${id_user}, ${value}, '${type}');`, function (err: Error, data: RowDataPacket[], fields: FieldPacket) {
                if (!err) {
                    res.statusCode = 200;
                    //retornando 1, que é a quantidade de campos alterados, se nao retornar 1 é porque deu erro
                    res.send(fields);
                } else {
                    //erro caso nao envie a informações corretas para o banco
                    res.statusCode = 400;
                    res.send("Error")
                }
            });
        } else {
            //erro caso nao tenha todos os campos preenchidos
            res.statusCode = 400;
            res.send("Error");
        }
    }

    export const withdrawFunds: RequestHandler = (req: Request, res: Response) => {
        const id_wallet = Number(req.get('id_wallet'));
        const id_user = Number(req.get('id_user'));
        let value = -1 * Number(req.get('value'));
        const type = 'saque';
        const balance = seeBalance(id_user);

        console.log("teste ", balance)

        //verificando se nao vem campo vazio
        if (id_wallet && id_user && value && type) {
            console.log(value)
            //conectando com o banco, fiz a função para nao ter que copiar 7 linhas toda hora
            let conn = connectDatabase();
            conn.query(`INSERT INTO Transacao VALUES(${id_wallet},${id_user}, ${value}, '${type}');`, function (err: Error, data: RowDataPacket[], fields: FieldPacket) {
                if (!err) {
                    res.statusCode = 200;
                    //retornando 1, que é a quantidade de campos alterados, se nao retornar 1 é porque deu erro
                    res.send(fields);
                } else {
                    //erro caso nao envie a informações corretas para o banco
                    res.statusCode = 400;
                    res.send("Error")
                }
            });
        } else {
            //erro caso nao tenha todos os campos preenchidos
            res.statusCode = 400;
            res.send("Error");
        }
    }
}















// import { Request, RequestHandler, Response } from "express";
// import { RowDataPacket, FieldPacket } from 'mysql2';

// export namespace walletHandler {

//     // Carteira do usuario
//     export type UserWallet = {
//         id: number;
//         value: number;
//     }

//     function connectDatabase() {
//         var mysql = require('mysql2');
//         const conn = mysql.createConnection({
//             host: 'localhost',
//             user: 'root',
//             password: '',
//             database: 'footbet'
//         });

//         return conn;
//     }

//     // Função para ver o saldo
//     async function seeBalance(id_user: number): Promise<number> {
//         return new Promise((resolve, reject) => {
//             if (id_user) {
//                 let conn = connectDatabase();
//                 conn.query(`SELECT SUM(value) as 'saldo' FROM Transacao WHERE id_user = ?;`, [id_user], (err: Error, data: RowDataPacket[]) => {
//                     if (err) {
//                         return reject(err);
//                     }
//                     resolve(data[0].saldo || 0); // Resolve o saldo ou 0 se não houver transações
//                 });
//             } else {
//                 reject(new Error("Invalid user ID"));
//             }
//         });
//     }

//     // Verificando se os dados estão vindo e chamando a função de add deposito
//     export const addFunds: RequestHandler = (req: Request, res: Response) => {
//         const id_wallet = Number(req.get('id_wallet'));
//         const id_user = Number(req.get('id_user'));
//         let value = Number(req.get('value'));
//         const type = 'deposito';

//         // Verificando se nao vem campo vazio
//         if (id_wallet && id_user && value && type) {
//             console.log(value);
//             // Conectando com o banco
//             let conn = connectDatabase();
//             conn.query(`INSERT INTO Transacao VALUES(${id_wallet},${id_user}, ${value}, '${type}');`, function (err: Error, data: RowDataPacket[], fields: FieldPacket) {
//                 if (!err) {
//                     res.statusCode = 200;
//                     res.send(fields);
//                 } else {
//                     res.statusCode = 400;
//                     res.send("Error");
//                 }
//             });
//         } else {
//             res.statusCode = 400;
//             res.send("Error");
//         }
//     }

//     // Função para saque
//     export const withdrawFunds: RequestHandler = async (req: Request, res: Response) => {
//         const id_wallet = Number(req.get('id_wallet'));
//         const id_user = Number(req.get('id_user'));
//         let value = -1 * Number(req.get('value')); // O valor de saque será negativo
//         const type = 'saque';

//         try {
//             const balance = await seeBalance(id_user); // Aguarda o saldo ser recuperado
//             console.log("Saldo atual: ", balance);

//             if (id_wallet && id_user && value && type) {
//                 if (balance >= Math.abs(value)) {
//                     let conn = connectDatabase();
//                     conn.query(`INSERT INTO Transacao VALUES(${id_wallet},${id_user}, ${value}, '${type}');`, function (err: Error, data: RowDataPacket[], fields: FieldPacket) {
//                         if (!err) {
//                             res.statusCode = 200;
//                             res.send(fields);
//                         } else {
//                             res.statusCode = 400;
//                             res.send("Error");
//                         }
//                     });
//                 } else {
//                     res.statusCode = 400;
//                     res.send("Saldo insuficiente");
//                 }
//             } else {
//                 res.statusCode = 400;
//                 res.send("Error");
//             }
//         } catch (error) {
//             console.error(error);
//             res.statusCode = 500;
//             res.send("Error retrieving balance");
//         }
//     }
// }