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
            database: 'teste'
        });

        return conn;
    }

    //Verificando se os dados estão vindo e chamando a função de add deposito
    export const deposit: RequestHandler = (req: Request, res: Response) => {
        const id = Number(req.get('id'));
        const value = Number(req.get('value'));

        //verificando se nao vem campo vazio
        if (id && value) {
            //conectando com o banco, fiz a função para nao ter que copiar 7 linhas toda hora
            let conn = connectDatabase();
            conn.query(`INSERT INTO carteira VALUES(${id}, ${value});`, function (err: Error, data: RowDataPacket[], fields: FieldPacket) {
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

    //Para ver os depositos feitos
    export const seeDeposits: RequestHandler = (req: Request, res: Response) => {
        let conn = connectDatabase();

        conn.query('SELECT * FROM carteira;', function (err: Error, data: RowDataPacket[]) {
            if (!err) {
                res.statusCode = 200;
                res.send(data);
            } else {
                res.statusCode = 400;
                res.send("Error")
            }
        });
    }
}