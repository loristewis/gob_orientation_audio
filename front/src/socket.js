import { io } from "socket.io-client";
import config from './config'

const socket = io('https://loristewis-getmovements.herokuapp.com/')

export default socket
