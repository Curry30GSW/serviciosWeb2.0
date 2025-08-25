document.getElementById('consultar').addEventListener('click', async () => {
    const selectCuenta = document.getElementById('slt-cuenta');
    const cuenta = selectCuenta.value;
    const token = sessionStorage.getItem('jwt');

    // Obtener la fecha actual
    const now = new Date();
    const opcionesFecha = { day: "2-digit", month: "short", year: "numeric" };
    const fechaHoy = now.toLocaleDateString("es-ES", opcionesFecha)
        .replace(".", "")
        .replace(/\b\w/g, (l) => l.toUpperCase());

    // Obtener la hora actual en formato HH:MM:SS
    const horaHoy = now.toLocaleTimeString("es-CO", { hour12: false });

    if (!cuenta) {
        Swal.fire({
            icon: 'warning',
            title: 'Cuenta requerida',
            text: 'Seleccione una cuenta.'
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

    // Variables para controlar el progreso
    let progressBar, progressText, progressPercentage, loadingAlert;

    // Función para actualizar el progreso
    const updateProgress = (progress, message) => {
        if (progressBar && progressText && progressPercentage) {
            progressBar.style.width = `${progress}%`;
            progressPercentage.textContent = `${progress}%`;
            progressText.textContent = message;

            // Cambiar color según el progreso
            if (progress >= 80) {
                progressBar.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
            }
        }
    };

    // Mostrar la barra de carga inmediatamente
    loadingAlert = Swal.fire({
        title: 'Cargando Estado de Cuenta',
        html: `
            <div class="progress-container">
                <div class="progress">
                    <div id="progress-bar" class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%">
                        <span id="progress-percentage" class="progress-percentage">0%</span>
                    </div>
                </div>
                <p id="progress-text" class="progress-text pulse-text">Iniciando proceso de consulta...</p>
            </div>
        `,
        showConfirmButton: false,
        allowOutsideClick: false,
        customClass: {
            popup: 'custom-swal-popup'
        },
        didOpen: () => {
            progressBar = document.getElementById('progress-bar');
            progressText = document.getElementById('progress-text');
            progressPercentage = document.getElementById('progress-percentage');
            updateProgress(10, 'Conectando con el servidor...');
        }
    });

    try {

        await new Promise(resolve => setTimeout(resolve, 300));


        // Etapa 1: Realizar la petición fetch
        updateProgress(25, 'Solicitando datos de la cuenta...');
        const response = await fetch(`http://localhost:5000/api/cuenta/${cuenta}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        await new Promise(resolve => setTimeout(resolve, 200));


        // Etapa 2: Procesar la respuesta
        updateProgress(50, 'Procesando información recibida...');
        const result = await response.json();

        // Guardar datos en sessionStorage
        sessionStorage.setItem('estadoCuentaData', JSON.stringify(result.data));

        // Etapa 3: Verificar si hay datos
        updateProgress(70, 'Verificando datos...');
        if (result.success && result.data.cuentaData.length > 0) {
            const data = result.data.cuentaData[0];

            await new Promise(resolve => setTimeout(resolve, 200));

            // Etapa 4: Formatear datos
            updateProgress(80, 'Formateando información...');
            const formatNumber = (num) => new Intl.NumberFormat('es-CO').format(num);

            const salo = result.data.salo09;
            const creditoEspecial = Number(result.data.vlrCredEsp ?? 0).toLocaleString("es-CO");
            const couCredEsp = Number(result.data.vlrCredCouEsp ?? 0).toLocaleString("es-CO");
            const vrTotalEsp = Number(result.data.vrTotalEsp ?? 0).toLocaleString("es-CO");
            const creditoOrdinario = Number(result.data.vlrCredOrd[0]?.CREDITO_ORDINARIO ?? 0).toLocaleString("es-CO");
            const couCredOrd = Number(result.data.vlrCredCouOrd[0]?.COU_CRED_ORD ?? 0).toLocaleString("es-CO");
            const vrTotalOrd = Number(result.data.vrTotalOrd ?? 0).toLocaleString("es-CO");
            const comprometido = Number(result.data.comprometido ?? 0).toLocaleString("es-CO");
            const cupo = Number(result.data.cupo ?? 0);
            const cupoFormato = cupo.toLocaleString("es-CO");
            const cupoColor = cupo > 0 ? "#000" : "text-danger";
            const deudatotal = Number(result.data.deudaTotal ?? 0).toLocaleString("es-CO");

            // Formateo de fechas
            const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

            // Formateo fecha distribución de aporte
            const rawFecha = Number(result.data.fecha09) || 0;
            const fechaCalculada = rawFecha + 19000000;
            const año = Math.floor(fechaCalculada / 10000);
            const mesNumero = Math.floor((fechaCalculada % 10000) / 100);
            const dia = String(fechaCalculada % 100).padStart(2, '0');
            const mesTexto = meses[mesNumero - 1];
            const fechaFormateada = `${dia} de ${mesTexto} de ${año}`;

            // Extraer el año y el mes actual
            const lapso = `${meses[now.getMonth()]} ${now.getFullYear()}`;

            // Formateo de fecha para data.FEVI05
            const rawFechaFEVI = Number(data.FEVI05) || 0;
            const fechaCalculadaFEVI = rawFechaFEVI + 19000000;
            const añoFEVI = Math.floor(fechaCalculadaFEVI / 10000);
            const mesNumeroFEVI = Math.floor((fechaCalculadaFEVI % 10000) / 100);
            const diaFEVI = String(fechaCalculadaFEVI % 100).padStart(2, '0');
            const mesTextoFEVI = meses[mesNumeroFEVI - 1];
            const fechaFormateadaFEVI = `${diaFEVI} ${mesTextoFEVI} del ${añoFEVI}`;

            let idCuenta = Number(data.IDCUENTA) || 0;
            let bio = idCuenta > 0 ? "SI" : "NO";
            let asal09 = Number(data.ASAL09 || 0).toLocaleString("es-CO");
            let acuo09 = Number(data.ACUO09 || 0).toLocaleString("es-CO");
            let dsal09 = Number(data.DSAL09 || 0).toLocaleString("es-CO");

            // Etapa 5: Generar HTML de detalles de créditos
            await new Promise(resolve => setTimeout(resolve, 200));

            updateProgress(90, 'Generando detalles de créditos...');
            let detallesCreditosHTML = "";

            if (result.data.detallesCreditos && result.data.detallesCreditos.length > 0) {
                detallesCreditosHTML = `
                <div class="card shadow mb-4">
                    <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                        <div class="bg-gradient-dark shadow-dark border-radius-lg pt-4 pb-3">
                            <h5 class="text-white text-capitalize text-center">
                                <i class="fas fa-list-alt me-2"></i> Detalles de Créditos
                            </h5>
                        </div>
                    </div>
                    <div class="card-body" style="padding: 20px;">
                        <div class="table-responsive">
                            <table class="table table-hover" style="border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden;">
                                <thead class="bg-gradient-dark text-white">
                                    <tr>
                                        <th class="text-center" style="font-weight: 500; border-bottom: none;">Línea</th>
                                        <th class="text-center" style="font-weight: 500; border-bottom: none;">Crédito</th>
                                        <th class="text-center" style="font-weight: 500; border-bottom: none;">Garantía</th>
                                        <th class="text-center" style="font-weight: 500; border-bottom: none;">Saldo Capital</th>
                                        <th class="text-center" style="font-weight: 500; border-bottom: none;">Vencidos</th>
                                        <th class="text-center" style="font-weight: 500; border-bottom: none;">Cuota Capital</th>
                                        <th class="text-center" style="font-weight: 500; border-bottom: none;">Cuota Interés</th>
                                        <th class="text-center" style="font-weight: 500; border-bottom: none;">Cuota Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${result.data.detallesCreditos.map((credito, index) => `
                                    <tr style="${index % 2 === 0 ? 'background-color: #f8f9fa;' : 'background-color: white;'}">
                                        <td class="text-center" style="font-weight: 525; vertical-align: middle;">${credito.TCRE13}</td>
                                        <td class="text-center" style="font-weight: 525; vertical-align: middle;">${credito.NCRE13}</td>
                                        <td class="text-center" style="font-weight: 525; vertical-align: middle;">${credito.MOGA13.trim()}</td>
                                        <td class="text-center" style="font-weight: 525; vertical-align: middle;">$ ${Number(credito.SCAP13).toLocaleString("es-CO")}</td>
                                        <td class="text-center" style="font-weight: 525; vertical-align: middle;">$ ${Number(result.data.vencidos[index]).toLocaleString("es-CO")}</td>
                                        <td class="text-center" style="font-weight: 525; vertical-align: middle;">$ ${Number(credito.CCAP13).toLocaleString("es-CO")}</td>
                                        <td class="text-center" style="font-weight: 525; vertical-align: middle;">$ ${Number(credito.CINT13).toLocaleString("es-CO")}</td>
                                        <td class="text-center" style="font-weight: 525; vertical-align: middle;">$ ${Number(result.data.cuotasTotales[index]).toLocaleString("es-CO")}</td>
                                    </tr>
                                    `).join("")}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>`;
            }

            // Validar si `salo` es un número mayor a 0
            let distribucionAportesHTML = "";
            if (!isNaN(salo) && salo > 0) {
                distribucionAportesHTML = `
                <div class="col-12 mb-3">
                    <p style="color: rgba(25, 135, 84, 0.9); font-size: 1.1rem; margin-bottom: 5px; font-weight: 500;">Distribución Aportes</p>
                    <div style="color: #000; font-weight: 525;">
                        El <strong>${fechaFormateada}</strong> se le distribuyó Aportes por <strong>$${formatNumber(salo)}</strong>
                    </div>
                </div>`;
            }

            // Etapa 6: Generar HTML final
            updateProgress(95, 'Preparando visualización...');
            const estadoCuentaHTML = `
                <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                    <div class="bg-gradient-dark shadow-dark border-radius-lg pt-4 pb-3">
                        <div class="d-flex justify-content-between align-items-center px-3">
                        <h5 class="mb-0 text-white text-capitalize">
                            <i class="fas fa-file-invoice-dollar me-2"></i> Estado de Cuenta
                        </h5>
                        <span class="text-white" style="font-size: 1.1rem;">
                            Fecha y Hora: ${fechaHoy} - ${horaHoy}
                        </span>
                        </div>
                    </div>
                </div>


                <div class="text-center mt-3">
                    <img id="userImage" src="../assets/img/Logo2.png" alt="Imagen de usuario"
                        class="img-fluid logo-superior" style="max-height: 100px;">
                </div>
                            
                    <div class="card-body" style="padding: 20px;">
                        <!-- Sección de información básica -->
                        <div class="row mb-4">
                            <div class="col-md-6 mb-3 mb-md-0" style="padding-right: 15px;">
                                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; height: 100%;">
                                    <div class="d-flex align-items-center mb-3" style="border-bottom: 1px solid #e9ecef; padding-bottom: 10px;">
                                        <i class="fas fa-user-tie me-3" style="color: #198754; font-size: 1.2rem;"></i>
                                        <h4 class="mb-0" style="font-weight: 600; color: #212529;">Información del Asociado</h4>
                                    </div>
                                    <div class="row">
                                        <div class="col-6 mb-3">
                                            <p style="color: rgba(25, 135, 84, 0.9); font-size: 1.1rem; margin-bottom: 5px; font-weight: 500;">Cuenta No.</p>
                                            <p style="color: #000; font-weight: 525; margin-bottom: 0;">${data.DIST05} - ${cuenta}</p>
                                        </div>
                                        <div class="col-6 mb-3">
                                            <p style="color: rgba(25, 135, 84, 0.9); font-size: 1.1rem; margin-bottom: 5px; font-weight: 500;">Nombre</p>
                                            <p style="color: #000; font-weight: 525; margin-bottom: 0;">${data.DESC05.trim()}</p>
                                        </div>
                                        <div class="col-6 mb-3">
                                            <p style="color: rgba(25, 135, 84, 0.9); font-size: 1.1rem; margin-bottom: 5px; font-weight: 500;">Cédula</p>
                                            <p style="color: #000; font-weight: 525; margin-bottom: 0;">${data.NNIT05}</p>
                                        </div>
                                        <div class="col-6 mb-3">
                                            <p style="color: rgba(25, 135, 84, 0.9); font-size: 1.1rem; margin-bottom: 5px; font-weight: 500;">Vinculación</p>
                                            <p style="color: #000; font-weight: 525; margin-bottom: 0;">${fechaFormateadaFEVI}</p>
                                        </div>
                                        <div class="col-6 mb-3">
                                            <p style="color: rgba(25, 135, 84, 0.9); font-size: 1.1rem; margin-bottom: 5px; font-weight: 500;">Nómina</p>
                                            <p style="color: #000; font-weight: 525; margin-bottom: 0;">${data.NOMI05} ${data.DESC04}</p>
                                        </div>
                                        <div class="col-6 mb-3">
                                            <p style="color: rgba(25, 135, 84, 0.9); font-size: 1.1rem; margin-bottom: 5px; font-weight: 500;">Dependencia</p>
                                            <p style="color: #000; font-weight: 525; margin-bottom: 0;">${data.ENTI05} ${data.DEPE05} ${data.DESC02}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-6" style="padding-left: 15px;">
                                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; height: 100%;">
                                    <div class="d-flex align-items-center mb-3" style="border-bottom: 1px solid #e9ecef; padding-bottom: 10px;">
                                        <i class="fas fa-info-circle me-3" style="color: #198754; font-size: 1.2rem;"></i>
                                        <h4 class="mb-0" style="font-weight: 600; color: #212529;">Estado Actual</h4>
                                    </div>
                                    <div class="row">
                                        <div class="col-6 mb-3">
                                            <p style="color: rgba(25, 135, 84, 0.9); font-size: 1.1rem; margin-bottom: 5px; font-weight: 500;">Agencia</p>
                                            <p style="color: #000; font-weight: 525; margin-bottom: 0;">${data.AGENCIA}</p>
                                        </div>
                                        <div class="col-6 mb-3">
                                            <p style="color: rgba(25, 135, 84, 0.9); font-size: 1.1rem; margin-bottom: 5px; font-weight: 500;">Estado</p>
                                        <p style="font-weight: 525; margin-bottom: 0; color: ${data.DCARTERA === 'NORMAL' ? '#007bff' : '#dc3545'}">
                                                <strong>${data.DCARTERA}</strong>
                                        </p>
                                        </div>
                                        <div class="col-6 mb-3">
                                            <p style="color: rgba(25, 135, 84, 0.9); font-size: 1.1rem; margin-bottom: 5px; font-weight: 500;">Biometría</p>
                                            <p style="color: #000; font-weight: 525; margin-bottom: 0;">${bio}</p>
                                        </div>
                                        <div class="col-6 mb-3">
                                            <p style="color: rgba(25, 135, 84, 0.9); font-size: 1.1rem; margin-bottom: 5px; font-weight: 500;">Lapso</p>
                                            <p style="color: #000; font-weight: 525; margin-bottom: 0;">${lapso}</p>
                                        </div>
                                        ${distribucionAportesHTML ? `
                                        <div class="col-12 mb-3">
                                            <p style="color: rgba(25, 135, 84, 0.9); font-size: 1.1rem; margin-bottom: 5px; font-weight: 500;">Distribución Aportes</p>
                                            <div style="color: #000; font-weight: 525;">${distribucionAportesHTML}</div>
                                        </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Sección de resumen financiero -->
                        <div class="d-flex align-items-center mb-3" style="border-bottom: 1px solid #e9ecef; padding-bottom: 10px;">
                            <i class="fas fa-calculator me-3" style="color: #198754; font-size: 1.2rem;"></i>
                            <h4 class="mb-0" style="font-weight: 600; color: #212529;">Resumen Financiero</h4>
                        </div>
                        
                        <div class="table-responsive mb-4">
                            <table class="table table-borderless" style="margin-bottom: 0;">
                              <thead style="background-color: #e8f3ed;">
                                    <tr>
                                        <th style="width: 30%; border-top: none; font-weight: 600; color: #000;">Concepto</th>
                                        <th style="width: 23%; border-top: none; font-weight: 600; color: #000; text-align: right;">Total Capital</th>
                                        <th style="width: 23%; border-top: none; font-weight: 600; color: #000; text-align: right;">Total Vencido</th>
                                        <th style="width: 24%; border-top: none; font-weight: 600; color: #000; text-align: right;">Valor Cuota</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style="font-weight: 525; color: #000;">Aportes Sociales</td>
                                        <td style="text-align: right; font-weight: 525; color: #000;">$ ${asal09}</td>
                                        <td style="text-align: right; font-weight: 525; color: #000;">0</td>
                                        <td style="text-align: right; font-weight: 525; color: #000;">$ ${acuo09}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-weight: 525; color: #000;">Aportes Ocasionales</td>
                                        <td style="text-align: right; font-weight: 525; color: #000;">$ ${dsal09}</td>
                                        <td style="text-align: right; font-weight: 525; color: #000;">-</td>
                                        <td style="text-align: right; font-weight: 525; color: #000;">-</td>
                                    </tr>
                                    <tr>
                                        <td style="font-weight: 525; color: #000;">Crédito Especial</td>
                                        <td style="text-align: right; font-weight: 525; color: #000;">$ ${creditoEspecial}</td>
                                        <td style="text-align: right; font-weight: 525; color: #000;">$ ${vrTotalEsp}</td>
                                        <td style="text-align: right; font-weight: 525; color: #000;">$ ${couCredEsp}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-weight: 525; color: #000;">Crédito Ordinario</td>
                                        <td style="text-align: right; font-weight: 525; color: #000;">$ ${creditoOrdinario}</td>
                                        <td style="text-align: right; font-weight: 525; color: #000;">$ ${vrTotalOrd}</td>
                                        <td style="text-align: right; font-weight: 525; color: #000;">$ ${couCredOrd}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Sección de totales -->
                        <div class="row" style="margin-left: -5px; margin-right: -5px;">
                            <div class="col-md-4 mb-3" style="padding: 5px;">
                                <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; height: 100%; border: 1px solid #e9ecef;">
                                    <p style="color: rgba(25, 135, 84, 0.9); font-size: 1.1rem; margin-bottom: 10px; font-weight: 500;">Comprometido</p>
                                    <h3 style="color: #000; font-weight: 600; margin-bottom: 0;">$ ${comprometido}</h3>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3" style="padding: 5px;">
                                <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; height: 100%; border: 1px solid #e9ecef;">
                                    <p style="color: rgba(25, 135, 84, 0.9); font-size: 1.1rem; margin-bottom: 10px; font-weight: 500;">Cupo Disponible</p>
                                    <h3 style="color: ${cupoColor}; font-weight: 600; margin-bottom: 0;">$ ${cupoFormato}</h3>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3" style="padding: 5px;">
                                <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; height: 100%; border: 1px solid #e9ecef;">
                                    <p style="color: rgba(25, 135, 84, 0.9); font-size: 1.1rem; margin-bottom: 10px; font-weight: 500;">Deuda Total</p>
                                    <h3 style="color: #000; font-weight: 600; margin-bottom: 0;">$ ${deudatotal}</h3>
                                </div>
                            </div>
                        </div>
                         <div class="mt-4">
                         ${detallesCreditosHTML}
                        </div>
                    </div>
                </div>`;

            // Etapa 7: Completado
            updateProgress(100, '¡Completado!');

            // Cerrar el alert y mostrar los datos
            Swal.close();
            document.getElementById('EstadoCta').innerHTML = estadoCuentaHTML;
            document.getElementById("imprime").disabled = false;

            setTimeout(() => {
                document.getElementById("cuenticas").scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 300);

        } else {
            updateProgress(100, 'No se encontraron datos para la cuenta');

            await new Promise(resolve => setTimeout(resolve, 800));

            Swal.close();
            document.getElementById('EstadoCta').innerHTML = `
                <div class="alert alert-warning text-center" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    No se encontraron datos para la cuenta ${cuenta}. 
                    <br>Por favor, verifique el número e intente nuevamente.
                </div>
            `;
        }

    } catch (error) {
        console.error('Error:', error);
        updateProgress(100, 'Error en la consulta');

        setTimeout(() => {
            Swal.close();
            Swal.fire({
                title: 'Error',
                text: 'Hubo un problema en la consulta',
                icon: 'error'
            });
        }, 500);
    }
});