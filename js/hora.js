function actualizarFechaHora() {
    const opcionesFecha = {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: 'short',
        day: '2-digit'
    };

    const opcionesHora = {
        timeZone: 'America/Bogota',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };

    const formatoFecha = new Intl.DateTimeFormat('en-US', opcionesFecha);
    const formatoHora = new Intl.DateTimeFormat('en-US', opcionesHora);

    const ahora = new Date();
    const fecha = formatoFecha.format(ahora);
    const hora = formatoHora.format(ahora);

    document.getElementById('fechaActual').textContent = `${fecha} - ${hora}`;
}

// Actualiza la fecha y hora cada segundo
setInterval(actualizarFechaHora, 1000);

// Llama a la función inicialmente para mostrar la hora al cargar la página
actualizarFechaHora();