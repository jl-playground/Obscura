import 'dotenv/config';
import Database from '@/app/core/database/database';
import Server from '@/server';

Database.getInstance();
const server = Server.getInstance(3000);

server.start();
