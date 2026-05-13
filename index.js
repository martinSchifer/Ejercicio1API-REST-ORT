import express from 'express';
import fs from 'fs';
import cors from 'cors';


const app = express();
const port = 3000;
const FILE_PATH = "./tareas.json";

app.use(cors());
app.use(express.json())

//Funciones

function leerTareas () {
    if(!fs.existsSync(FILE_PATH)){
        fs.writeFileSync(FILE_PATH, JSON.stringify([], null, 2));
        return [];
    }

    const data = fs.readFileSync(FILE_PATH, "utf-8");
    return JSON.parse(data);
}

function guardarTareas(tareas) {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(tareas, null, 2));
    } catch (error) {
        console.log(error);
    }
}

function validarTarea(req, res, next){
    const {nombre} = req.body;

    if(!nombre || nombre.trim() === ""){
        return res.status(400).json({
            error: "La tarea no tiene nombre!"
        })
    }
    next();
}

//Endpoints

app.get('/', (req, res) => {
    res.send("Hola mundo!");
})

app.get('/tasks', (req, res) => {
    res.json(leerTareas());
})

app.post('/tasks', validarTarea, (req, res) => {
    const tareas = leerTareas();

    const tareaNueva = {
        id: Date.now(),
        nombre: req.body.nombre,
        completada: false
    };

    tareas.push(tareaNueva);
    guardarTareas(tareas);

    res.status(201).json(tareaNueva);
})

app.put('/tasks/:id', (req, res) => {
    const tareas = leerTareas();
    const id = Number(req.params.id);
    const tareaACambiar = tareas.find(tarea => tarea.id === id);

    if(!tareaACambiar) {
        return res.status(404).json({
            error: `No se encontró la tarea con id: ${id}`
        })
    }

    if(typeof req.body.completada !== 'boolean'){
        return res.status(400).json({
            error: 'El atributo: "completada" debe ser un booleano'
        })
    }

    tareaACambiar.completada = req.body.completada;
    guardarTareas(tareas);
    res.json(tareaACambiar);
})

app.delete('/tasks/:id', (req, res) => {
    const tareas = leerTareas();
    const id = Number(req.params.id);
    const tareasFiltradas = tareas.filter(tarea => tarea.id !== id);

    if(tareas.length === tareasFiltradas.length) {
        return res.status(404).json({
            error: `No se encontró la tarea con id: ${id}`
        })
    }

    // console.log(`Cantidad de tareas: ${tareas.length}`);
    // console.log(`Cantidad de tareas Filtradas: ${tareasFiltradas.length}`);
    
    guardarTareas(tareasFiltradas);
    res.json({message: `Tarea con id: ${id}, eliminada`});
})

app.listen(port, () => {
    console.log(`Escuchando puerto ${port}!`)
})