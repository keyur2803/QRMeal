/**
 * Socket.IO client for real-time kitchen updates.
 * Currently not auto-connected — call socket.connect() when ready.
 */

import { io } from "socket.io-client";
import { API_BASE } from "../config/env";

export const socket = io(API_BASE, { autoConnect: false });
