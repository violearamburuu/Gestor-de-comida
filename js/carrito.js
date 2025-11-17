class Carrito {
    constructor(){
        this.recetas = [];
        this.ingredientes = [];
    }

    agregarReceta(receta){
        this.recetas.push(receta);
        receta.ingredientes.forEach(ingrediente => {
            const ingredienteExistente = this.ingredientes.find(
                item => item.nombre.toLowerCase() === ingrediente.toLowerCase()
            );
            
            if (ingredienteExistente) {
                ingredienteExistente.cantidad++;
            } else {
                this.ingredientes.push({
                    nombre: ingrediente,
                    cantidad: 1
                });
            }
        });
    }
}