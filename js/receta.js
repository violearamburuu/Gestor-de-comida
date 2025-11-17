class Receta {
  constructor(nombre, ingredientes) {
    this.nombre = nombre;
    this.ingredientes = ingredientes
      .split(",")
      .map(ingrediente => ingrediente.trim())
      .filter(ingrediente => ingrediente.length > 0);
  }
}
