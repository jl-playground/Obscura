import Server from '@/server';
import 'dotenv/config';

const server = Server.getInstance(3001);

server.start();
