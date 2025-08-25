document.getElementById('btnLogin').addEventListener('click', async function () {
    const cedula = document.getElementById('cedula').value;
    const password = document.getElementById('password').value;
    let fechaExpedicion = document.getElementById("fechaExpedicion").value;
    fechaExpedicion = fechaExpedicion.replace(/-/g, '');
    fechaExpedicion = parseInt(fechaExpedicion, 10);

    if (!cedula || !password) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos vacíos',
            text: 'Por favor ingrese ambos campos.',
        });
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + (sessionStorage.getItem('jwt') || '')
            },
            body: JSON.stringify({ cedula, password, fechaExpedicion }),
            credentials: 'include' // Necesario para cookies de sesión
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error en la autenticación');
        }

        const data = await response.json();
        manejarRespuesta(data, '/pages/cuenta.html');

    } catch (error) {
        console.error('Error en la API:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'No se pudo iniciar sesión. Verifique sus credenciales o intente nuevamente.',
        });
    }
});

function manejarRespuesta(data, path) {
    if (data.token) {
        // Guardar datos en sessionStorage
        sessionStorage.setItem('jwt', data.token);
        sessionStorage.setItem('nombreUsuario', data.user?.descripcion?.trim().toUpperCase() || 'Usuario');
        sessionStorage.setItem('cedula', (data.user?.nnit || '').trim());

        Swal.fire({
            icon: 'success',
            title: 'Bienvenido',
            html: `Inicio de sesión exitoso, <b>${sessionStorage.getItem('nombreUsuario')}.</b>`,
            timer: 2000,
            showConfirmButton: false,
        }).then(() => {
            window.location.href = `http://127.0.0.1:5501${path}`;
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.message || 'Credenciales incorrectas o falta token de acceso.',
        });
    }
}



// Recuperar contraseña
document.querySelector('#forgotPasswordModal form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const cedula = document.getElementById('cedulaR').value;
    const fecha = formatFecha(document.getElementById('fechaNacimiento').value);
    const correo = document.getElementById('correo').value;
    const pwd = document.getElementById('newPassword').value;

    try {
        const res = await fetch('http://localhost:5000/api/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cedula, fecha, correo, pwd })
        });

        const data = await res.json();

        if (data.registrado === 0) {
            Swal.fire({
                icon: 'success',
                title: '¡Usuario actualizado!',
                text: 'Tu contraseña y correo han sido actualizados correctamente.',
                confirmButtonColor: '#212529'
            }).then(() => {
                // cerrar modal al confirmar
                const modal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
                modal.hide();
            });
        } else if (data.registrado === 2) {
            Swal.fire({
                icon: 'warning',
                title: 'Asociado no válido',
                text: 'Por favor comunicarse con su Agencia correspondiente',
                confirmButtonColor: '#000000ff'
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error inesperado',
                text: 'Intenta nuevamente más tarde.',
                confirmButtonColor: '#dc3545'
            });
        }
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor intente más tarde',
            confirmButtonColor: '#dc3545'
        });
    }
});


// Crear usuario
document.querySelector('#crearUsuarioModal form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const cedula = document.getElementById('cedulaCreacion').value;
    const fecha = formatFecha(document.getElementById('fechaNacimientoCreacion').value);
    const correo = document.getElementById('correoCreacion').value;
    const pwd = document.getElementById('passwordCreacion').value;

    try {
        const res = await fetch('http://localhost:5000/api/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cedula, fecha, correo, pwd })
        });

        const data = await res.json();
        console.log(data);

        if (data.registrado === 1) {
            Swal.fire({
                icon: 'success',
                title: '¡Usuario creado!',
                text: 'Tu usuario fue registrado correctamente.',
                confirmButtonColor: '#212529'
            }).then(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('crearUsuarioModal'));
                modal.hide();
            });

        } else if (data.registrado === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Usuario ya existe',
                text: 'El usuario ya estaba registrado, se actualizaron sus datos.',
                confirmButtonColor: '#0d6efd'
            }).then(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('crearUsuarioModal'));
                modal.hide();
            });

        } else if (data.registrado === 2) {
            Swal.fire({
                icon: 'warning',
                title: 'Asociado no válido',
                text: 'Por favor comunicarse con su Agencia correspondiente',
                confirmButtonColor: '#ffc107'
            });

        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error inesperado',
                text: 'Intenta nuevamente más tarde.',
                confirmButtonColor: '#dc3545'
            });
        }
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor intente más tarde',
            confirmButtonColor: '#dc3545'
        });
    }
});



function formatFecha(fechaInput) {
    return fechaInput.replaceAll('-', ''); // → "20000419"
}


// Resto del código para registro y recuperación de contraseña
// document.addEventListener("DOMContentLoaded", function () {
//     const forgotPasswordForm = document.querySelector("#forgotPasswordModal form");
//     const createUserForm = document.querySelector("#crearUsuarioModal form");

//     forgotPasswordForm.addEventListener("submit", function (event) {
//         event.preventDefault();
//         handleFormSubmit(forgotPasswordForm, 'http://localhost:5000/api/auth/forgot-password');
//     });

//     createUserForm.addEventListener("submit", function (event) {
//         event.preventDefault();
//         handleFormSubmit(createUserForm, 'http://localhost:5000/api/registro');
//     });

//     async function handleFormSubmit(form, endpoint) {
//         const formData = new FormData(form);
//         const cedula = formData.get("cedulaR") || formData.get("cedulaCreacion");
//         const fecha = formatFechaNumerica(formData.get("fechaNacimiento")) || formatFechaNumerica(formData.get("fechaNacimientoCreacion"));
//         const correo = formData.get("correo") || formData.get("correoCreacion");
//         const pwd = formData.get("newPassword") || formData.get("passwordCreacion");

//         if (!cedula || !fecha || !correo || !pwd) {
//             Swal.fire({
//                 icon: "warning",
//                 title: "Campos incompletos",
//                 text: "Por favor, complete todos los campos.",
//             });
//             return;
//         }

//         try {
//             const response = await fetch(`${endpoint}`, {
//                 method: "POST",
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': 'Bearer ' + (sessionStorage.getItem('jwt') || '')
//                 },
//                 body: JSON.stringify({ cedula, fecha, correo, pwd }),
//                 credentials: 'include'
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Error en la solicitud');
//             }

//             const data = await response.json();

//             Swal.fire({
//                 icon: "success",
//                 title: data.registrado === 0 ? "Usuario actualizado" : "Usuario registrado",
//                 text: data.registrado === 0 ?
//                     "Tu información ha sido actualizada correctamente." :
//                     "Tu cuenta ha sido creada con éxito.",
//             });

//             form.reset();
//             bootstrap.Modal.getInstance(form.closest(".modal")).hide();
//         } catch (error) {
//             console.error("Error:", error);
//             Swal.fire({
//                 icon: "error",
//                 title: "Error",
//                 text: error.message || "Ocurrió un error al procesar tu solicitud.",
//             });
//         }
//     }

//     function formatFechaNumerica(fecha) {
//         return fecha ? fecha.replace(/-/g, "") : "";
//     }
// });


function limpiarCamposModal(modalId) {
    const modal = document.getElementById(modalId);
    const inputs = modal.querySelectorAll('input');
    inputs.forEach(input => {
        input.value = '';
    });
}

// Evento al cerrar modal de Recuperar Contraseña
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
forgotPasswordModal.addEventListener('hidden.bs.modal', function () {
    limpiarCamposModal('forgotPasswordModal');
});

// Evento al cerrar modal de Crear Usuario
const crearUsuarioModal = document.getElementById('crearUsuarioModal');
crearUsuarioModal.addEventListener('hidden.bs.modal', function () {
    limpiarCamposModal('crearUsuarioModal');
});


function updatePasswordCount(input, counterId) {
    document.getElementById(counterId).innerText = input.value.length;
}


document.getElementById("togglePassword").addEventListener("click", function () {
    const password = document.getElementById("password");
    const icon = this.querySelector("i");

    if (password.type === "password") {
        password.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        password.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
});
