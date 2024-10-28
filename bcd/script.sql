drop database footbet;
create database footbet;
use footbet;

CREATE TABLE User(
    user_id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    full_name varchar(255) NOT NULL,
    username VARCHAR(20) NOT NULL,
    email VARCHAR(20) NOT NULL,
    password_user VARCHAR(20) NOT NULL,
    token VARCHAR(32) UNIQUE,
    birth_date timestamp NOT NULL
);

CREATE TABLE Transacao(
    id_wallet INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    value INTEGER NOT NULL DEFAULT 0,
    type VARCHAR(8),
    CONSTRAINT CHK_type CHECK (type ='saque' or type='deposito'),
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    date_transation timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Evento(
    id_evento INTEGER NOT NULL PRIMARY KEY,
    id_criador INTEGER NOT NULL,
    titulo VARCHAR(50) NOT NULL,
    descricao VARCHAR(50) NOT NULL,
    dataEvento DATE,
    inicioApostas datetime,
    fimApostas datetime,
    valor_cota decimal(10,2),
    status varchar(20) Default 'analise',
    FOREIGN KEY(id_criador) REFERENCES User(user_id)
);

CREATE TABLE Participa(
    id_participante INTEGER NOT NULL,
    id_evento INTEGER NOT NULL,
    qtd_cotas integer,
    total_apostado decimal(10,2),
    aposta varchar(2),
    CONSTRAINT ck_aposta CHECK (aposta ='s' or aposta = 'n'),
    FOREIGN KEY(id_participante) REFERENCES User(user_id),
    FOREIGN KEY(id_evento) REFERENCES Evento(id_evento)
);

INSERT INTO User VALUES(DEFAULT,'Natã Batista', 'natabatista', 'natabatista2908@gmail.com', '123', '1h234j', '2007/05/20');
INSERT INTO User VALUES(DEFAULT,'Jhenifer Laís', 'JLais', 'Lais@Wager.com', 'WagerBest123', 'FEWUFIEJOQDHRUY32HEFU3RB2UT', '2004/02/21');

SELECT * FROM User;
SELECT * FROM Transacao;

SELECT SUM(value) as 'saldo' FROM Transacao WHERE user_id = 2;