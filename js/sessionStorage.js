document.addEventListener("DOMContentLoaded", function () {
    const nombreUsuario = sessionStorage.getItem('nombreUsuario');

    if (nombreUsuario) {
        document.getElementById('nombreUsuario').textContent = nombreUsuario;
    } else {
        // Si no hay usuario en sesión, redirige al login
        window.location.href = '../pages/inicio.html';
    }
});



function confirmLogout() {
    Swal.fire({
        title: '¿Cerrar sesión?',
        text: '¿Estás seguro que deseas cerrar tu sesión?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {

            sessionStorage.clear();

            setTimeout(() => {
                window.location.href = '../pages/inicio.html';
            }, 500);
        }
    });
}
