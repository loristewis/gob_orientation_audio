import { io } from "socket.io-client";
import config from './config'

const socket = io(process.env.BACKEND_HEROKU_URL)

export default socket
