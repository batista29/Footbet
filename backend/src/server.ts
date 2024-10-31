import express from "express";
import { Request, Response, Router } from "express";
import { AccountsHandler } from "./accounts/accounts";
import { EventsHandler } from "./events/events";
import { walletHandler } from "./wallet/wallet";

const port = 3000;
const server = express();
const routes = Router();

routes.get('/', (req: Request, res: Response) => {
    res.statusCode = 403;
    res.send('Acesso não permitido.');
});


// vamos organizar as rotas em outro local 
routes.post('/signUp', AccountsHandler.signUp); //Ok
routes.post('/login', AccountsHandler.login); //Ok

// Transações
routes.post('/addFunds', walletHandler.addFunds); //Ok
routes.post('/withdrawFunds', walletHandler.withdrawFunds); //ok

//eventos
routes.post('/addNewEvent', EventsHandler.addNewEventRoute); //ok
routes.put('/evaluateNewEvent', EventsHandler.evaluateNewEvent); //ok

routes.post('/finishEvent', EventsHandler.finishEventRoute);//ok
routes.post('/betOnEvent', EventsHandler.betOnEvent); //ok
routes.post('/deleteEvent', EventsHandler.deleteEventRoute);// ok

server.use(routes);

server.listen(port, () => {
    console.log(`Server is running on: ${port}`);
})