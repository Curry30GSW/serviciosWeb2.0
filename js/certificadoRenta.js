//autorizacion
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




const style = document.createElement("style");
style.innerHTML = `
    .titulo2 {
        font-weight: bold;
        font-size: 14px;
        color: #333;
        
    }

    .datos {
    color: #333; 
    font-size: 14px; 
    font-weight: normal; 
    margin-top: 0;
    }

.col {
    flex: 1;
    padding: 2px;
    min-width: 120px;
}
    .detalles-header {
    background-color: #666 !important;
    color: white !important;
    font-weight: bold;
    text-align: center;
}

.row {
    margin-bottom: 5px; /* Reduce el espacio entre filas */
}

.form-group {
    margin-bottom: 2px; /* Reduce el espacio entre cada grupo */
}
    `;
document.head.appendChild(style);

async function obtenerCuentasPorCedula() {
    try {
        const token = sessionStorage.getItem('jwt');
        const cedula = sessionStorage.getItem('cedula');

        if (!token || !cedula) {
            console.error("No se encontró el token de autenticación o la cédula");
            return;
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch(`http://localhost:5000/api/cuentas/${cedula}`, { headers });

        if (response.ok) {
            const data = await response.json();

            const cuentasList = document.getElementById("cuentas-list");
            cuentasList.innerHTML = ''; // limpiar

            if (data.length === 0) {
                cuentasList.textContent = "No se encontraron cuentas.";
                return;
            }

            data.forEach(val => {
                const span = document.createElement("span");
                span.className = "badge bg-success px-2 py-2";
                span.textContent = `${val.cuenta} - ${val.nomina}`;
                cuentasList.appendChild(span);
            });
        } else {
            console.error('Error al obtener las cuentas:', response.statusText);
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
    }
}




obtenerCuentasPorCedula();



document.getElementById("consultarCer").addEventListener("click", async function () {
    const anio = document.getElementById("slt-anio").value;
    const libreria = "colib12";
    const token = sessionStorage.getItem('jwt');
    const cedula = sessionStorage.getItem("cedula");
    const inicio = `1${anio}01`;
    const fin = `1${anio}12`;


    if (!anio) {
        alert("Por favor seleccione un año.");
        return;
    }

    if (!token) {
        alert('No hay sesión activa. Inicie sesión nuevamente.');
        return;
    }

    Swal.fire({
        title: 'Cargando información...',
        text: 'Por favor, espera unos segundos.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const url = `http://localhost:5000/api/certificado-renta?libreria=${libreria}${anio}&cedula=${cedula}&inicio=${inicio}&fin=${fin}&year=20${anio}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error("Error en la respuesta de la API:", response.status);
            Swal.fire({
                icon: 'error',
                title: 'Error al obtener los datos',
                text: `Código: ${response.status}`
            });
            return;
        }

        const data = await response.json();
        console.log("Datos recibidos:", data);

        // Verificar si hay datos válidos
        if (!data || !data.success || !data.data) {
            console.warn("No se encontraron datos válidos en la API.");
            Swal.fire({
                icon: 'warning',
                title: 'No se encontraron Datos',
                text: 'No se encontraron datos válidos para mostrar.'
            });
            return;
        }

        // Verificar si hay certificados
        if (!Array.isArray(data.data) || data.data.length === 0) {
            console.warn("No se encontraron certificados en la respuesta.");
            Swal.fire({
                icon: 'warning',
                title: 'No se encontraron Certificados',
                text: 'No se encontraron certificados para la consulta realizada.'
            });
            return;
        }

        Swal.close();

        const cuentasData = data.data;
        if (!Array.isArray(cuentasData) || cuentasData.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No se encontraron Certificados',
                text: 'No se encontraron certificados para la consulta realizada.'
            });
            return;
        }

        // --- Unificar valores ---
        let totalCapital = 0;
        let totalCorriente = 0;
        let totalMora = 0;
        let totalVivienda = 0;
        let totalOtros = 0;
        let totalRevalorizacion = 0;
        let totalFondoSolidario = 0;

        // 👇 nuevos totales
        let totalOrdinarios = 0;
        let totalOcasionales = 0;
        let totalInactivos = 0;

        const cuentas = [];
        const nominas = new Set();
        let certificadoBase = cuentasData[0].socio?.[0] || {};

        cuentasData.forEach(item => {
            totalCapital += item.capital || 0;
            totalCorriente += item.intereses?.corriente || 0;
            totalMora += item.intereses?.mora || 0;
            totalVivienda += Number(item.vivienda?.[0]?.CREDITO_VIVIENDA || 0);
            totalOtros += item.otros?.[0]?.OTROS || 0;
            totalRevalorizacion += item.reAportes?.[0]?.REVALORIZACION || 0;
            totalFondoSolidario += item.fondoSolidario || 0;

            // 👇 aportes sociales del socio
            if (item.socio && item.socio[0]) {
                totalOrdinarios += Number(item.socio[0].ORDINARIOS || 0);
                totalOcasionales += Number(item.socio[0].OCASIONALES || 0);
                totalInactivos += Number(item.socio[0].INACTIVOS || 0);
            }

            cuentas.push(item.cuenta);
            if (item.socio?.[0]?.NOMINA) {
                nominas.add(item.socio[0].NOMINA);
            }
        });



        // Generar fecha formateada
        const fecha = new Date();
        const dia = fecha.getDate();
        const mes = fecha.getMonth() + 1;
        const año = fecha.getFullYear();
        const horas = fecha.getHours();
        const minutos = fecha.getMinutes();
        const segundos = fecha.getSeconds();
        const ampm = horas >= 12 ? 'PM' : 'AM';
        const horasFormato = horas % 12 || 12;
        const list_mes = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const fechaFormateada = `${dia} días de ${list_mes[mes]} de ${año} ${horasFormato}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')} ${ampm}`;


        // Convertir set a texto
        const listaNominas = Array.from(nominas).join(", ");
        const listaCuentas = cuentas.join(", ");
        // Obtener referencias a botones
        const botonDescarga = document.getElementById("descargarCer");
        const botonImprimir = document.getElementById("imprime");
        const contenedor = document.getElementById("CertifiCta");

        // Construir el contenido HTML
        let contenidoCertificado = `
            <div class="container datos">
                <div class="row titulo text-center">
                    <div class="col-12">LA COOPERATIVA DE SERVIDORES PUBLICOS Y JUBILADOS DE COLOMBIA - COOPSERP</div>
                </div>
                <div class="row titulo text-center">
                    <div class="col-12">EN CUMPLIMIENTO DE LAS DISPOSICIONES VIGENTES</div>
                </div>
                <div class="row titulo text-center">
                    <div class="col-12">NIT. 805.004.034-9</div>
                </div>
                <div class="row titulo">
                    <div class="col-12 text-center">
                        <img src="../assets/img/Logo2.png" width="180" height="80" alt="Logo" />
                    </div>
                </div>
                <div class="row titulo text-center">
                    <div class="col-12">CERTIFICA A</div>
                </div>
                <div class="row titulo text-center">
                    <div class="col-12">LA DIRECCIÓN DE IMPUESTOS Y ADUANAS NACIONALES "DIAN"</div>
                </div>
                <br/>
                <div class="row">
                    <div class="col-12 contenido">
                        Que <span class="datos" id="desc"><span class="titulo2">${certificadoBase.NOMBRE}</span></span>
                        con Número de Identificación <span class="datos" ><span class="titulo2" >${certificadoBase.CEDULA}</span></span>
                        asociado(a) a la Cooperativa con la Cuenta No. <span class="titulo2" id="ncta">${listaCuentas}<strong></strong></span>
                        perteneciente a la Nómina de <span class="titulo2" id="nomi">${listaNominas}</span>
                        presentaba al 31 de Diciembre del año <span class="titulo2" id="year">20${anio}</span>, los siguientes saldos:
                    </div>
                </div>
                <br>
                <div class="row">
                    <div class="col-6 contenido titulo2">APORTES SOCIALES</div>
                </div>
                <div class="row">
                    <div class="col-6 titulo2">Ordinarios:</div>
                    <div class="col-6 datos" id="asal">$ ${Number(totalOrdinarios).toLocaleString("es-ES")}</div>
                </div>
                <div class="row">
                    <div class="col-6 contenido titulo2">Inactivos:</div>
                    <div class="col-6 datos" id="inac">$ ${Number(totalInactivos).toLocaleString("es-ES")}</div>
                </div>
                <div class="row">
                    <div class="col-6 contenido titulo2">Ocasionales:</div>
                    <div class="col-6 datos" id="dsal">$ ${Number(totalOcasionales).toLocaleString("es-ES")}</div>
                </div>
                <br>
                <div class="row">
                    <div class="col-6 contenido titulo2">CRÉDITOS CAPITAL</div>
                    <div class="col-6 datos" id="scap">$ ${Number(totalCapital).toLocaleString("es-ES")}</div>
                </div>
                <br>
                <div class="row">
                    <div class="col-6 contenido titulo2">INTERESES VENCIDOS</div>
                </div>
                <div class="row">
                    <div class="col-6 contenido titulo2">Corriente:</div>
                    <div class="col-6 datos" id="cint">$ ${Number(totalCorriente).toLocaleString("es-ES")}</div>
                </div>
                <div class="row">
                    <div class="col-6 titulo2">Mora:</div>
                    <div class="col-6 datos" id="simo">$ ${Number(totalMora).toLocaleString("es-ES")}</div>
                </div>
                <br>
                <div class="row">
                    <div class="col-6 contenido titulo2">INTERESES PAGADOS AÑO 20${anio}:</div>
                </div>
                <div class="row">
                    <div class="col-6 contenido"><span class="titulo2">Crédito de Vivienda:</span></div>
                    <div class="col-6 datos" id="crevivi">$ ${Number(totalVivienda).toLocaleString("es-ES")}</div>
                </div>
                <div class="row">  
                    <div class="col-6 contenido"><span class="titulo2">Otros Créditos:</span></div>
                    <div class="col-6 datos" id="otrosCredi">$ ${Number(totalOtros).toLocaleString("es-ES")}</div>
                </div>
                <br>
                <div class="row">
                    <div class="col-6 contenido"><span class="titulo2">OTROS INGRESOS 20${anio}</span>:</div>
                </div>
                <div class="row">
                    <div class="col-6 contenido"><span class="titulo2">Revalorización de aportes:</span></div>
                    <div class="col-6 datos" id="revaAport">$ ${Number(totalRevalorizacion).toLocaleString("es-ES")}</div>
                </div>
                <div class="row">  
                    <div class="col-6 contenido"><span class="titulo2">Fondo de solidaridad:</span></div>
                    <div class="col-6 datos">$ ${Number(totalFondoSolidario).toLocaleString("es-ES")}</div>
                </div>
                <br>
                <div class="row">
                    <div class="col-12 contenido">
                        El presente Certificado se expide en la ciudad de Cali como sede principal a petición del interesado a los <span class="titulo2">${fechaFormateada}</span>
                    </div>
                </div>
                <br><br>
                <div class="row">
                    <div class="col-6 contenido">Atentamente,</div>
                </div>
                <br><br>
                <div class="container-firma text-center">
                    <div class="row justify-content-center">
                        <!-- Primera Persona -->
                        <div class="col-12 col-md-4 datos_firma">
                            <div>Fdo.<img src="../assets/img/logo-firma.jpeg" alt="Firma" /></div>
                            <div>______________________</div>
                            <div class="titulo2">${jefCartera}</div>
                            <div class="fw-bold titulo2">${CargoCartera}</div>
                        </div>
                        <!-- Segunda Persona -->
                        <div class="col-12 col-md-4 datos_firma">
                            <div>Fdo.<img src="../assets/img/logo-firma.jpeg" alt="Firma" /></div>
                            <div>______________________</div>
                            <div class="titulo2">${contador}</div>
                            <div class="fw-bold titulo2">${Cargocontador}</div>
                        </div>
                        <!-- Tercera Persona -->
                        <div class="col-12 col-md-4 datos_firma">
                            <div>Fdo.<img src="../assets/img/logo-firma.jpeg" alt="Firma" /></div>
                            <div>______________________</div>
                            <div class="titulo2">${jefRevisor}</div>
                            <div class="fw-bold titulo2">${CargoRevisor}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        contenedor.innerHTML = contenidoCertificado;

        // Habilitar botones
        botonDescarga.disabled = false;
        botonImprimir.disabled = false;

        // Hacer scroll después de un breve retraso
        setTimeout(() => {
            document.getElementById("certificados").scrollIntoView({ behavior: "smooth" });
        }, 500);

    } catch (error) {
        console.error("Error al obtener certificados:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error en la conexión',
            text: 'Hubo un problema al conectar con el servidor.'
        });
    }
});



