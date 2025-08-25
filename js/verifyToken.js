const LOGIN_PAGE = "../pages/inicio.html";

function verificarTokenSessionStorage() {
    const token = sessionStorage.getItem('jwt');

    if (!token) {
        redirigirALogin();
    }
}

// Función para redirigir al usuario a la página de inicio de sesión
function redirigirALogin() {
    Swal.fire({
        icon: 'info',
        title: 'Sesión no iniciada',
        text: 'Por favor, inicia sesión para continuar.',
        timer: 2000,
        showConfirmButton: false,
        allowOutsideClick: false,
    }).then(() => {
        window.location.href = LOGIN_PAGE;
    });
}

verificarTokenSessionStorage();
