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
// routes.post('/signUp', AccountsHandler.createAccountRoute);
// routes.post('/login', AccountsHandler.login);

// Transações
routes.post('/addFunds', walletHandler.addFunds);
routes.post('/withdrawFunds', walletHandler.withdrawFunds);
//seeBalance para ver quanto tem na carteira
// routes.post('/seeBalance/:id', walletHandler.seeBalance);

//eventos
// routes.post('/addNewEvent', EventsHandler.addNewEventRoute);
// routes.post('/deleteEvent', EventsHandler.deleteEvent);

server.use(routes);

server.listen(port, () => {
    console.log(`Server is running on: ${port}`);
})