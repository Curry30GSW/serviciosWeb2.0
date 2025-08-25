document.addEventListener("DOMContentLoaded", function () {
    const modalBusqueda = new bootstrap.Modal(document.getElementById('modalBusqueda'), {
        backdrop: 'static',
        keyboard: false
    });

    modalBusqueda.show();

    document.getElementById("formBusqueda").addEventListener("submit", async function (e) {
        e.preventDefault();

        const cedula = document.getElementById("inputCedula").value;
        const anio = document.getElementById("inputAnio").value;

        try {
            const response = await fetch(`http://localhost:5000/api/certificado-renta/cuentas?cedula=${cedula}`);
            const data = await response.json();

            if (data.success && data.data.length > 0) {
                // Mostrar datos en modal
                document.getElementById("resultadoBusqueda").classList.remove("d-none");
                document.getElementById("nombreAsociado").textContent = data.data[0].nombre;
                document.getElementById("nominaAsociado").textContent = data.data[0].nomina;

                // Llenar lista de cuentas
                const listaCuentas = document.getElementById("listaCuentas");
                listaCuentas.innerHTML = "";

                data.data.forEach(cuenta => {
                    const btn = document.createElement("button");
                    btn.type = "button";
                    btn.className = "list-group-item list-group-item-action";
                    btn.textContent = cuenta.cuenta;
                    btn.dataset.cuenta = cuenta.cuenta;

                    btn.addEventListener("click", function () {
                        // Asignamos la cuenta seleccionada al select del card principal
                        const selectCard = document.getElementById("slt-cuenta");
                        selectCard.innerHTML = `<option value="${cuenta.cuenta}" selected>${cuenta.cuenta}</option>`;

                        // Sincronizamos el año
                        document.getElementById("slt-anio").value = anio;

                        // Cerramos modal solo después de elegir
                        modalBusqueda.hide();
                    });

                    listaCuentas.appendChild(btn);
                });
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Sin resultados',
                    text: 'No se encontraron cuentas para esta cédula.'
                });
            }
        } catch (error) {
            console.error("Error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error en la búsqueda',
                text: 'Hubo un problema al buscar cuentas. Intenta nuevamente.'
            });
        }
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


document.getElementById("consultarCer").addEventListener("click", async function () {
    const cuenta = document.getElementById("slt-cuenta").value;
    const anio = document.getElementById("slt-anio").value;
    const libreria = "colib12";
    const token = sessionStorage.getItem('jwt');

    if (!cuenta) {
        Swal.fire({
            icon: 'warning',
            title: 'Cuenta requerida',
            text: 'Por favor seleccione una cuenta.'
        });
        return;
    }

    if (!anio) {
        Swal.fire({
            icon: 'warning',
            title: 'Año requerido',
            text: 'Por favor seleccione un año.'
        });
        return;
    }

    if (!token) {
        Swal.fire({
            icon: 'error',
            title: 'Sesión expirada',
            text: 'No hay sesión activa. Inicie sesión nuevamente.'
        });
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
        const url = `http://localhost:5000/api/certificado-renta?libreria=${libreria}${anio}&cuenta=${cuenta}&inicio=${anio}401&fin=${anio}412&year=20${anio}`;

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
        if (!data.data.certificado || !Array.isArray(data.data.certificado) || data.data.certificado.length === 0) {
            console.warn("No se encontraron certificados en la respuesta.");
            Swal.fire({
                icon: 'warning',
                title: 'No se encontraron Certificados',
                text: 'No se encontraron certificados para la consulta realizada.'
            });
            return;
        }

        Swal.close();

        // Obtener el primer certificado
        const certificado = data.data.certificado[0];

        // Obtener valores con manejo seguro de nulos
        const creditosCapital = data.data.capital || 0;
        const interesesVencidos = data.data.intereses || { corriente: 0, mora: 0 };
        const creditosVivienda = data.data.vivienda && data.data.vivienda.length > 0 ? data.data.vivienda[0] : 0;

        // Manejar créditos otros
        let creditosOtrosValor = 0;
        if (data.data.otros && Array.isArray(data.data.otros) && data.data.otros.length > 0) {
            creditosOtrosValor = data.data.otros[0].OTROS || 0;
        }

        // Manejar revalorización
        let revalorizacion = 0;
        if (data.data.reAportes && Array.isArray(data.data.reAportes) && data.data.reAportes.length > 0) {
            revalorizacion = data.data.reAportes[0].REVALORIZACION || 0;
        }

        const fondoSolidario = data.data.fondoSolidario || 0;
        const inactivos = 0; // Valor por defecto según tu código original

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
                        Que <span class="datos" id="desc"><span class="titulo2">${certificado.NOMBRE}</span></span>
                        con Número de Identificación <span class="datos" ><span class="titulo2" >${certificado.CEDULA}</span></span>
                        asociado(a) a la Cooperativa con la Cuenta No. <span class="titulo2" id="ncta">${certificado.CUENTA}<strong></strong></span>
                        perteneciente a la Nómina de <span class="titulo2" id="nomi">${certificado.NOMINA}</span>
                        presentaba al 31 de Diciembre del año <span class="titulo2" id="year">20${anio}</span>, los siguientes saldos:
                    </div>
                </div>
                <br>
                <div class="row">
                    <div class="col-6 contenido titulo2">APORTES SOCIALES</div>
                </div>
                <div class="row">
                    <div class="col-6 titulo2">Ordinarios:</div>
                    <div class="col-6 datos" id="asal">$ ${Number(certificado.ORDINARIOS || 0).toLocaleString("es-ES")}</div>
                </div>
                <div class="row">
                    <div class="col-6 contenido titulo2">Inactivos:</div>
                    <div class="col-6 datos" id="inac">$ ${Number(inactivos).toLocaleString("es-ES")}</div>
                </div>
                <div class="row">
                    <div class="col-6 contenido titulo2">Ocasionales:</div>
                    <div class="col-6 datos" id="dsal">$ ${Number(certificado.OCASIONALES || 0).toLocaleString("es-ES")}</div>
                </div>
                <br>
                <div class="row">
                    <div class="col-6 contenido titulo2">CRÉDITOS CAPITAL</div>
                    <div class="col-6 datos" id="scap">$ ${Number(creditosCapital).toLocaleString("es-ES")}</div>
                </div>
                <br>
                <div class="row">
                    <div class="col-6 contenido titulo2">INTERESES VENCIDOS</div>
                </div>
                <div class="row">
                    <div class="col-6 contenido titulo2">Corriente:</div>
                    <div class="col-6 datos" id="cint">$ ${Number(interesesVencidos.corriente || 0).toLocaleString("es-ES")}</div>
                </div>
                <div class="row">
                    <div class="col-6 titulo2">Mora:</div>
                    <div class="col-6 datos" id="simo">$ ${Number(interesesVencidos.mora || 0).toLocaleString("es-ES")}</div>
                </div>
                <br>
                <div class="row">
                    <div class="col-6 contenido titulo2">INTERESES PAGADOS AÑO 20${anio}:</div>
                </div>
                <div class="row">
                    <div class="col-6 contenido"><span class="titulo2">Crédito de Vivienda:</span></div>
                    <div class="col-6 datos" id="crevivi">$ ${Number(creditosVivienda).toLocaleString("es-ES")}</div>
                </div>
                <div class="row">  
                    <div class="col-6 contenido"><span class="titulo2">Otros Créditos:</span></div>
                    <div class="col-6 datos" id="otrosCredi">$ ${Number(creditosOtrosValor).toLocaleString("es-ES")}</div>
                </div>
                <br>
                <div class="row">
                    <div class="col-6 contenido"><span class="titulo2">OTROS INGRESOS 20${anio}</span>:</div>
                </div>
                <div class="row">
                    <div class="col-6 contenido"><span class="titulo2">Revalorización de aportes:</span></div>
                    <div class="col-6 datos" id="revaAport">$ ${Number(revalorizacion).toLocaleString("es-ES")}</div>
                </div>
                <div class="row">  
                    <div class="col-6 contenido"><span class="titulo2">Fondo de solidaridad:</span></div>
                    <div class="col-6 datos" id="fondoSoli">$ ${Number(fondoSolidario).toLocaleString("es-ES")}</div>
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




