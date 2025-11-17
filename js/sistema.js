export class Sistema {
    constructor(){
        this.listaRecetas = [];
        this.listaCarritos = [];
    }

    agregarReceta(receta){
        this.listaRecetas.push(receta);
    }
}