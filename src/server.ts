// import { Server } from 'http';
// import { WebSocketServer, WebSocket } from 'ws';
// import app from './app';
// import config from './config';
// import { PrismaClient } from '@prisma/client';
// import path from 'path';
// import fs from 'fs';
// import { messageServices } from './app/modules/Message/message.service';

// const prisma = new PrismaClient();
// let wss: WebSocketServer;
// const channelClients = new Map<string, Set<WebSocket>>();

// function broadcastToChannel(
//   channelId: string,
//   data: object,
//   excludeSocket: WebSocket | null = null
// ) {
//   const clients = channelClients.get(channelId);
//   if (clients) {
//     clients.forEach((client) => {
//       if (excludeSocket !== client && client.readyState === WebSocket.OPEN) {
//         client.send(JSON.stringify(data));
//       }
//     });
//   }
// }

// async function main() {
//   const server: Server = app.listen(config.port, () => {
//     console.log('Server is running on port', config.port);
//   });

//   // WebSocket Server setup
//   wss = new WebSocketServer({ server });

//   // Handle WebSocket connections
//   wss.on('connection', (ws) => {
//     console.log('New WebSocket connection established!');

//     let subscribedChannel: string | null = null; // Track the client's subscribed channel

//     // Listen for subscription messages
//     ws.on('message', async (message) => {
//       try {
//         const parsedMessage = JSON.parse(message.toString());
//         const { type, channelId } = parsedMessage;

//         if (type === 'subscribe') {
//           if (!channelId) {
//             ws.send(
//               JSON.stringify({ error: 'ChannelId is required to subscribe' })
//             );
//           }
//           // Manage subscription
//           if (subscribedChannel) {
//             // If already subscribed, remove from the previous channel
//             const previousSet = channelClients.get(subscribedChannel);
//             previousSet?.delete(ws);
//             if (previousSet?.size === 0)
//               channelClients.delete(subscribedChannel);
//           }

//           // Add to the new channel
//           if (!channelClients.has(channelId)) {
//             channelClients.set(channelId, new Set());
//           }
//           channelClients.get(channelId)?.add(ws);
//           subscribedChannel = channelId;

//           // Fetch past messages for the channel and send to the client
//           const pastMessages =
//             await messageServices.getMessagesFromDB(channelId);

//           ws.send(
//             JSON.stringify({
//               type: 'pastMessages',
//               message: pastMessages,
//             })
//           );
//         } else if (
//           type === 'message' //&& // Check if the type is "message"
//           //channelId && // Ensure channelId is present
//           //subscribedChannel === channelId // Ensure the client is subscribed to the correct channel
//         ) {
//           // Broadcast new messages to all clients in the same channel
//           const channelId = parsedMessage.channelName;
//           const message = parsedMessage.message;

//           broadcastToChannel(channelId, message);
//           if (message.image) {
//             const base64Image = message.image;
//             const filename = `${Date.now()}.jpeg`;
//             const base64Data = base64Image.replace(
//               /^data:image\/\w+;base64,/,
//               ''
//             );

//             const filePath = path.join(
//               process.cwd(),
//               `uploads/message`,
//               filename
//             );

//             const localFilePath = `http://localhost:3018/uploads/message/${filename}`;
//             message.imageUrl = [localFilePath];
//             const buffer = Buffer.from(base64Data, 'base64');

//             fs.writeFile(filePath, buffer, (err) => {
//               if (err) {
//                 console.error('Error saving image:', err);
//                 ws.send(
//                   JSON.stringify({
//                     type: 'error',
//                     message: 'Failed to save image',
//                   })
//                 );
//               } else {
//                 console.log('Image saved successfully at', filePath);
//                 ws.send(
//                   JSON.stringify({
//                     type: 'image',
//                     message: 'Image saved successfully',
//                   })
//                 );
//               }
//             });
//           }
//           await messageServices.sendMessage(
//             message.senderId,
//             message.receiverId,
//             message.content,
//             message.imageUrl // Ensure this is an array of strings
//           );

//           // const messagePayload = {
//           //   type: 'message',
//           //   channelId,
//           //   message: parsedMessage.message,
//           // };

//           // Send to all clients subscribed to the channel
//           // channelClients.get(channelId)?.forEach((client) => {
//           //   if (client.readyState === WebSocket.OPEN) {
//           //     client.send(JSON.stringify(messagePayload));
//           //   }
//           // });
//           // messageServices.sendMessage( )
//         }
//       } catch (err: any) {
//         console.error('Error processing WebSocket message:', err.message);
//       }
//     });

//     // Handle client disconnections
//     ws.on('close', () => {
//       if (subscribedChannel) {
//         const clientsInChannel = channelClients.get(subscribedChannel);
//         clientsInChannel?.delete(ws);
//         if (clientsInChannel?.size === 0)
//           channelClients.delete(subscribedChannel);
//       }
//       console.log('WebSocket client disconnected!');
//     });
//   });
// }

// main();

// export default channelClients;

import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import app from "./app";
import config from "./config";
import { PrismaClient } from "@prisma/client";
// import { privateMessageService } from "./app/modules/privateMessage/privateMessage.service";

const prisma = new PrismaClient();
let wss: WebSocketServer;
const channelClients = new Map<string, Set<WebSocket>>();

function broadcastToChannel(
  channelId: string,
  data: object,
  excludeSocket: WebSocket | null = null
) {
  const clients = channelClients.get(channelId);
  if (clients) {
    clients.forEach((client) => {
      if (excludeSocket !== client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}
async function main() {
  const server: Server = app.listen(config.port, () => {
    console.log("Server running on port", config.port);
  });

  // new WebSocket server
  wss = new WebSocketServer({ server });

  // client handle connection
  wss.on("connection", (ws) => {
    console.log("New WebSocket connection!");

    let channelId: string | null = null;
    // client received message
    ws.on("message", async (message) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.type === "subscribe" && parsed.channelId) {
          channelId = parsed.channelId;
          
          if (channelId && !channelClients.has(channelId)) {
            channelClients.set(channelId, new Set());
          }
          channelId && channelClients.get(channelId)?.add(ws);
          ws.send(JSON.stringify({ type: "subscribed", channelId }));
        } else if (parsed.type === "message") {
          const channelId = parsed.channelId;
          const privateMessage = parsed.message;
          broadcastToChannel(channelId, privateMessage);
        } 
        // else if (
        //   parsed.type === "offer" ||
        //   parsed.type === "answer" ||
        //   parsed.type === "candidate"
        // ) {
        //   broadcastToChannel(parsed.channelName, parsed, ws);
        // }
      } catch (err: any) {
        console.error("error:", err.message);  
      }
    });
    ws.on("close", () => {
      if (channelId) {
        channelClients.get(channelId)?.delete(ws);
        if (channelClients.get(channelId)?.size === 0) {
          channelClients.delete(channelId);
        }
      }
      console.log("Client disconnected!");
    });
  });
}

main();

