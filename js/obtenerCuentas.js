document.addEventListener('DOMContentLoaded', () => {
    const usuario = sessionStorage.getItem('cedula');
    const usuariosAutorizados = ['1007864285', '79638888', '1299299', '16603757'];
    const token = sessionStorage.getItem('jwt');
    const paginaActual = window.location.pathname;

    if (!token) {
        Swal.fire({
            icon: 'warning',
            title: 'Sesión expirada',
            text: 'Redirigiendo al login...',
            timer: 3000,
            showConfirmButton: false
        }).then(() => {
            window.location.href = '../pages/inicio.html';
        });
        return;
    }

    // 🚫 Bloquear páginas restringidas
    const paginasRestringidas = ["auditoria.html", "renta-admin.html"];

    if (
        paginasRestringidas.some(pagina => paginaActual.includes(pagina)) &&
        (
            !usuariosAutorizados.includes(usuario) || // si no está autorizado
            usuario === "16603757" && paginaActual.includes("auditoria.html") // caso especial: bloquea solo auditoria.html
        )
    ) {
        Swal.fire({
            icon: 'error',
            title: 'Acceso denegado',
            text: 'No tienes permisos para ver esta página.',
            showConfirmButton: false,
            timer: 2000
        });

        setTimeout(() => {
            window.location.href = '/pages/cuenta.html';
        }, 2000);

        return;
    }

    // 👁️ Ocultar módulos desde el menú
    const moduloAuditoria = document.getElementById("moduloAuditoria");
    const moduloBuscar = document.getElementById("moduloBuscar");

    if (!usuariosAutorizados.includes(usuario)) {
        // No autorizado → oculta ambos
        if (moduloAuditoria) moduloAuditoria.style.display = "none";
        if (moduloBuscar) moduloBuscar.style.display = "none";
    } else if (usuario === "16603757") {
        // Caso especial → oculta Auditoría, deja Buscar
        if (moduloAuditoria) moduloAuditoria.style.display = "none";
        if (moduloBuscar) moduloBuscar.style.display = "block";
    }

    Swal.fire({
        title: 'Cargando información...',
        text: 'Por favor espera un momento.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    obtenerCuentasPorCedula().then(() => {
        Swal.close();
    }).catch((error) => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al cargar los datos.',
        });
        console.error(error);
    });
});



async function obtenerCuentasPorCedula() {
    try {
        const token = sessionStorage.getItem('jwt');
        const cedula = sessionStorage.getItem('cedula'); // Recuperamos la cédula

        // Si el token o la cédula no están presentes, no hacemos la solicitud
        if (!token || !cedula) {
            console.error("No se encontró el token de autenticación o la cédula");
            return;
        }

        // Configurar los encabezados, incluyendo el JWT
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`  // Añadir el token al encabezado
        };

        const response = await fetch(`http://localhost:5000/api/cuentas/${cedula}`, { headers });

        // Si la respuesta es exitosa, procesamos los datos
        if (response.ok) {
            const data = await response.json();  // Obtiene los datos en formato JSON

            const cuentasSelect = document.getElementById("slt-cuenta");

            cuentasSelect.innerHTML = '';

            data.forEach(val => {
                const option = document.createElement("option");
                option.value = val.cuenta;  // Establecemos el valor del <option>
                option.textContent = `${val.cuenta} ${val.nomina}`;  // Establecemos el texto visible del <option>
                cuentasSelect.appendChild(option);  // Agregamos el <option> al <select>
            });
        } else {
            console.error('Error al obtener las cuentas:', response.statusText);
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
    }
}


obtenerCuentasPorCedula();
