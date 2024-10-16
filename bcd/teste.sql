drop database footbet;
create database footbet;
use footbet;

CREATE TABLE Usuario(
    id_user INTEGER NOT NULL PRIMARY KEY,
    nome_completo varchar(255) NOT NULL,
    nome_user VARCHAR(20) NOT NULL,
    password INTEGER NOT NULL,
    token VARCHAR(32),
    email VARCHAR(20) NOT NULL,
    data_nascimento DATE NOT NULL
);

CREATE TABLE Carteira(
    id_wallet INTEGER NOT NULL PRIMARY KEY,
    id_user INTEGER NOT NULL,
    value INTEGER NOT NULL,
    FOREIGN KEY (id_user) REFERENCES Usuario(id_user)
);

CREATE TABLE Evento(
    id_evento INTEGER NOT NULL PRIMARY KEY,
    id_criador INTEGER NOT NULL,
    titulo VARCHAR(50) NOT NULL,
    descricao VARCHAR(50) NOT NULL,
    time1 VARCHAR(15) NOT NULL,
    time2 VARCHAR(15) NOT NULL,
    aprovado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY(id_criador) REFERENCES Usuario(id_user)
);

CREATE TABLE Participa(
    id_participante INTEGER NOT NULL,
    id_evento INTEGER NOT NULL,
    FOREIGN KEY(id_participante) REFERENCES Usuario(id_user),
    FOREIGN KEY(id_evento) REFERENCES Evento(id_evento)
);