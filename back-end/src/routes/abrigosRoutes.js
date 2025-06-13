import express from "express";
import getAbrigosController from "../controllers/getAbrigosController.js";

const routes = (app) => {
    app.use(express.json());

    app.get('/getAbrigos', getAbrigosController);
}

export default routes;