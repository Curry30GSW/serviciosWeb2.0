const ind_juridico = [51, 52, 53, 54, 55, 63, 64];
const list_depe = [51, 54];
const list_mes = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

/* Nombres que aparecen en la declaración de renta */
const jefCartera = "Elvia Yolima CEPEDA ANGULO";
const contador = "Gustavo Adolfo APARICIO BELALCAZAR";
const CargoCartera = "Jefe Dpto. Cartera";
const Cargocontador = "Contador";
const jefRevisor = "Fernando GONZALEZ MARTINEZ";
const CargoRevisor = "Revisor Fiscal";


function obtenerFechaActual() {

    const fecha = new Date();
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1;
    const año = fecha.getFullYear();
    const horas = fecha.getHours();
    const minutos = fecha.getMinutes();
    const segundos = fecha.getSeconds();

    // Formato AM/PM
    const ampm = horas >= 12 ? 'PM' : 'AM';
    const horasFormato = horas % 12 || 12;

    const list_mes = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const fechaFormateada = `${dia} días de ${list_mes[mes]} de ${año} ${horasFormato}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')} ${ampm}`;

}

setTimeout(obtenerFechaActual, 1000);

