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

    // Páginas restringidas
    const paginasRestringidas = ["auditoria.html", "renta-admin.html"];

    if (paginasRestringidas.some(pagina => paginaActual.includes(pagina)) && !usuariosAutorizados.includes(usuario)) {
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

    // 👁️ Ocultar módulos según usuario
    const moduloAuditoria = document.getElementById("moduloAuditoria");
    const moduloBuscar = document.getElementById("moduloBuscar");

    if (!usuariosAutorizados.includes(usuario)) {
        // Si NO está autorizado → oculta ambos
        if (moduloAuditoria) moduloAuditoria.style.display = "none";
        if (moduloBuscar) moduloBuscar.style.display = "none";
    } else if (usuario === "16603757") {
        // Caso especial → oculta solo Auditoría, deja Buscar
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

    obtenerAuditoria().then(() => {
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




async function obtenerAuditoria() {
    try {
        const token = sessionStorage.getItem('jwt');
        const url = 'http://localhost:5000/api/auditoria';

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.message || 'Error en la solicitud');
        }

        const respuesta = await response.json();
        const auditoria = respuesta;

        console.log("Auditoria", auditoria);


        if (!Array.isArray(auditoria) || auditoria.length === 0) {
            Swal.fire({
                title: 'Sin registros',
                text: 'No se encontraron auditorías en la base de datos.',
                icon: 'info',
                confirmButtonText: 'Entendido',
                allowOutsideClick: false,
                allowEscapeKey: false
            });
            return;
        }

        mostrar(auditoria);

    } catch (error) {
        console.error('❌ Error en auditoria:', error);
        Swal.fire('Error', 'No se pudo obtener la información.', 'error');
    }
}


const mostrar = (auditoria) => {
    let resultados = '';

    auditoria.slice().reverse().forEach((registro) => {
        const fechaFormateada = new Date(registro.fecha).toLocaleString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        resultados += `
    <tr>
        <td class="text-center">${registro.id_web}</td>
        <td class="text-center text-uppercase">${registro.asociado}</td>
        <td class="text-center">${registro.evento}</td>
        <td class="text-center">${registro.ip_web}</td>
        <td class="text-center">${fechaFormateada}</td>
    </tr>
    `;
    });


    if ($.fn.DataTable.isDataTable('#tablaAuditoria')) {
        $('#tablaAuditoria').DataTable().clear().destroy();
    }

    $("#tablaAuditoria tbody").html(resultados);

    $('#tablaAuditoria').DataTable({
        pageLength: 13,
        lengthMenu: [[13, 20, 45, -1], [13, 20, 45, "Todos"]],
        order: [[0, "desc"]],
        language: {
            sProcessing: "Procesando...",
            sLengthMenu: "Mostrar _MENU_ registros",
            sZeroRecords: "No se encontraron resultados",
            sEmptyTable: "Ningún dato disponible en esta tabla",
            sInfo: "Mostrando del _START_ al _END_ de _TOTAL_ registros",
            sInfoEmpty: "Mostrando 0 a 0 de 0 registros",
            sInfoFiltered: "(filtrado de un total de _MAX_ registros)",
            sSearch: "Buscar:",
            oPaginate: {
                sNext: "Siguiente",
                sPrevious: "Anterior"
            }
        }
    });
};
