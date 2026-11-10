const formulario = document.querySelector("#formulario-cliente");
const listaClientes = document.querySelector("#lista-clientes");
const mensaje = document.querySelector("#mensaje");
const totalClientes = document.querySelector("#total-clientes");
const almacenamientoClientes = "inventario-clientes";

function mostrarMensaje(texto, esError = false) {
  mensaje.textContent = texto;
  mensaje.classList.toggle("error", esError);
}

function obtenerClientes() {
  const datos = localStorage.getItem(almacenamientoClientes);
  if (!datos) {
    return [];
  }

  const clientes = JSON.parse(datos);
  if (!Array.isArray(clientes)) {
    throw new Error("El formato de los clientes guardados no es válido.");
  }

  return clientes;
}

function actualizarListado(clientes) {
  listaClientes.replaceChildren();

  if (clientes.length === 0) {
    const fila = document.createElement("tr");
    fila.className = "fila-vacia";
    const celda = document.createElement("td");
    celda.colSpan = 5;
    celda.textContent = "Todavía no hay clientes registrados.";
    fila.append(celda);
    listaClientes.append(fila);
  } else {
    clientes.forEach((cliente) => {
      const fila = document.createElement("tr");
      [cliente.identificacion, cliente.nombre, cliente.correo, cliente.telefono, cliente.direccion]
        .forEach((valor) => {
          const celda = document.createElement("td");
          celda.textContent = valor;
          fila.append(celda);
        });
      listaClientes.append(fila);
    });
  }

  totalClientes.textContent = `${clientes.length} ${clientes.length === 1 ? "cliente" : "clientes"}`;
}

try {
  actualizarListado(obtenerClientes());
} catch (error) {
  mostrarMensaje(`No se pudieron cargar los clientes: ${error.message}`, true);
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const datosFormulario = new FormData(formulario);
  const cliente = Object.fromEntries(
    ["identificacion", "nombre", "correo", "telefono", "direccion"].map((campo) => [
      campo,
      String(datosFormulario.get(campo)).trim(),
    ]),
  );

  try {
    const clientes = obtenerClientes();
    const identificacionExiste = clientes.some(
      (registrado) => registrado.identificacion.toLocaleLowerCase() === cliente.identificacion.toLocaleLowerCase(),
    );
    if (identificacionExiste) {
      mostrarMensaje("Ya existe un cliente con esa identificación.", true);
      return;
    }

    const clientesActualizados = [...clientes, cliente];
    localStorage.setItem(almacenamientoClientes, JSON.stringify(clientesActualizados));
    actualizarListado(clientesActualizados);
    formulario.reset();
    mostrarMensaje("Cliente registrado correctamente.");
  } catch (error) {
    mostrarMensaje(`No se pudo registrar el cliente: ${error.message}`, true);
  }
});
