import express from "express";
import cors from "cors";
import router from "./routes/usuarios.routes.js";

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST, PUT', 'DELETE'],
    allowedHeaders: ['Content-Type','Authorization', 'x-token']
}));

app.use(express.json());

app.use("/api", router);

app.listen(3000);
console.log("Server on port", 3000);