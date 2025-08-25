document.getElementById("imprime").addEventListener("click", function () {
    const estadoCuentaData = JSON.parse(sessionStorage.getItem('estadoCuentaData') || '{}');
    if (!estadoCuentaData || Object.keys(estadoCuentaData).length === 0) {
        alert("No hay datos para imprimir.");
        return;
    }

    // Datos principales
    const data = estadoCuentaData.cuentaData?.[0] || {};
    const nombre = data.DESC05 || '';
    const cedula = data.NNIT05 || '';
    const cuenta = data.DIST05 || '';
    const dependencia = `${data.ENTI05 || ''} ${data.DEPE05 || ''} ${data.DESC02 || ''}`;
    const fechaVinculacion = data.FEVI05 || '';
    const nomina = `${data.NOMI05 || ''} ${data.DESC04 || ''}`;
    const agencia = data.AGENCIA || '';
    const estado = data.DCARTERA || '';
    const biometria = data.IDCUENTA > 0 ? 'SI' : 'NO';

    // Obtener fecha actual
    const fechaActual = new Date();
    const fechaFormateada = fechaActual.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }) + ' - ' + fechaActual.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    // Resumen financiero
    const aportesSociales = Number(data.ASAL09 || 0);
    const aportesOcasionales = Number(data.DSAL09 || 0);
    const creditoEspecial = Number(estadoCuentaData.vlrCredEsp || 0);
    const creditoOrdinario = Number(estadoCuentaData.vlrCredOrd || 0);
    const comprometido = Number(estadoCuentaData.comprometido || 0);
    const cupo = Number(estadoCuentaData.cupo || 0);
    const deudaTotal = Number(estadoCuentaData.deudaTotal || 0);

    // Tabla de detalles de créditos
    let detallesCreditosHTML = '';
    if (Array.isArray(estadoCuentaData.detallesCreditos) && estadoCuentaData.detallesCreditos.length > 0) {
        detallesCreditosHTML = `
            <div class="seccion-creditos">
                <div class="titulo-seccion">📋 Detalles de Créditos</div>
                <table class="tabla-creditos">
                    <thead>
                        <tr>
                            <th>Línea</th>
                            <th>Crédito</th>
                            <th>Garantía</th>
                            <th>Saldo Capital</th>
                            <th>Vencidas</th>
                            <th>Cuota Capital</th>
                            <th>Cuota Interés</th>
                            <th>Cuota Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${estadoCuentaData.detallesCreditos.map(c => `
                            <tr>
                                <td>${c.TCRE13}</td>
                                <td>${c.NCRE13}</td>
                                <td style="text-align:center;">${c.MOGA13}</td>
                                <td class="numero">$ ${Number(c.SCAP13 || 0).toLocaleString("es-CO")}</td>
                                <td class="numero">$ 0</td>
                                <td class="numero">$ ${Number(c.CCAP13 || 0).toLocaleString("es-CO")}</td>
                                <td class="numero">$ ${Number(c.CINT13 || 0).toLocaleString("es-CO")}</td>
                                <td class="numero">$ ${Number((c.CCAP13 || 0) + (c.CINT13 || 0)).toLocaleString("es-CO")}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    const htmlImpresion = `
        <div class="documento">
            <!-- Header -->
            <div class="header">
                <div class="header-izq">
                    <div class="titulo-doc">Estado de Cuenta</div>
                </div>
                <div class="header-der">
                    <div class="fecha-hora">Fecha y Hora: ${fechaFormateada}</div>
                </div>
            </div>

            <!-- Logo y empresa -->
            <div class="logo-empresa">
                <div class="logo-texto">Coopserp</div>
                <div class="subtitulo">Cooperativa de Empleados</div>
            </div>

            <!-- Información personal y estado en la misma fila -->
            <div class="fila-info-estado">
               <div class="seccion-info">
                <div class="titulo-icono">
                    <i class="fas fa-user-tie"></i>
                    <h4>Información del Asociado</h4>
                </div>

                <div class="info-grid">
                    <div class="info-col">
                    <div class="info-item">
                        <span class="label">Cuenta No.</span>
                        <span class="valor">${cuenta}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Cédula</span>
                        <span class="valor">${cedula}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Nómina</span>
                        <span class="valor">${nomina}</span>
                    </div>
                    </div>
                    <div class="info-col">
                    <div class="info-item">
                        <span class="label">Nombre</span>
                        <span class="valor">${nombre}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Vinculación</span>
                        <span class="valor">${fechaVinculacion}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Dependencia</span>
                        <span class="valor">${dependencia}</span>
                    </div>
                    </div>
                </div>
                </div>

                <div class="seccion-estado">
                    <div class="titulo-seccion">📊 Estado Actual</div>
                    <div class="estado-grid">
                        <div class="estado-item">
                            <span class="label">Agencia</span>
                            <span class="valor">${agencia}</span>
                        </div>
                        <div class="estado-item">
                            <span class="label">Estado</span>
                            <span class="valor estado-normal">${estado}</span>
                        </div>
                        <div class="estado-item">
                            <span class="label">Biometría</span>
                            <span class="valor">${biometria}</span>
                        </div>
                        <div class="estado-item">
                            <span class="label">Lapso</span>
                            <span class="valor">Junio 2025</span>
                        </div>
                    </div>
                    <div class="distribucion">
                        <strong>Distribución Aportes:</strong> El 31 de Marzo de 2025 se le distribuye Aportes por $2.476
                    </div>
                </div>
            </div>

            <!-- Resumen financiero -->
            <div class="seccion-financiera">
                <div class="titulo-seccion">💰 Resumen Financiero</div>
                <table class="tabla-financiera">
                    <thead>
                        <tr>
                            <th>Concepto</th>
                            <th>Total Capital</th>
                            <th>Total Vencida</th>
                            <th>Valor Cuota</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Aportes Sociales</td>
                            <td class="numero">$ ${aportesSociales.toLocaleString("es-CO")}</td>
                            <td class="numero">0</td>
                            <td class="numero">$ 106.500</td>
                        </tr>
                        <tr>
                            <td>Aportes Ocasionales</td>
                            <td class="numero">$ ${aportesOcasionales.toLocaleString("es-CO")}</td>
                            <td class="numero">0</td>
                            <td class="numero">$ 0</td>
                        </tr>
                        <tr>
                            <td>Crédito Especial</td>
                            <td class="numero">$ ${creditoEspecial.toLocaleString("es-CO")}</td>
                            <td class="numero">$ 0</td>
                            <td class="numero">$ 521.777</td>
                        </tr>
                        <tr>
                            <td>Crédito Ordinario</td>
                            <td class="numero">$ ${creditoOrdinario.toLocaleString("es-CO")}</td>
                            <td class="numero">$ 0</td>
                            <td class="numero">$ 0</td>
                        </tr>
                    </tbody>
                </table>

                <!-- Resumen de totales -->
                <div class="totales-grid">
                    <div class="total-item comprometido">
                        <div class="total-label">Comprometido</div>
                        <div class="total-valor">$ ${comprometido.toLocaleString("es-CO")}</div>
                    </div>
                    <div class="total-item cupo">
                        <div class="total-label">Cupo Disponible</div>
                        <div class="total-valor">$ ${cupo.toLocaleString("es-CO")}</div>
                    </div>
                    <div class="total-item deuda">
                        <div class="total-label">Deuda Total</div>
                        <div class="total-valor">$ ${deudaTotal.toLocaleString("es-CO")}</div>
                    </div>
                </div>
            </div>

            ${detallesCreditosHTML}
        </div>
    `;

    const watermark = `
        <div class="watermark">
            DOCUMENTO INFORMATIVO<br>
            NO VÁLIDO PARA TRANSACCIONES
        </div>
    `;

    const styles = `
    <style>
        @page {
            size: letter;
            margin: 1.5cm;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 15px;
            line-height: 1.5;
            color: #333;
            background: #fff;
        }
        .documento {
            max-width: 100%;
            margin: 0 auto;
            position: relative;
        }

        /* ---------- NUEVO BLOQUE PARA INFO ASOCIADO ---------- */
        .seccion-info {
            background: #f8f9fa;
            padding: 18px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
            margin-bottom: 20px;
        }
        .titulo-icono {
            display: flex;
            align-items: center;
            border-bottom: 1px solid #e9ecef;
            padding-bottom: 10px;
            margin-bottom: 18px;
        }
        .titulo-icono i {
            color: #198754;
            font-size: 1.2rem;
            margin-right: 10px;
        }
        .titulo-icono h4 {
            font-weight: 600;
            color: #212529;
            font-size: 18px;
            margin: 0;
        }
        .info-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        }
        .info-col {
            flex: 1;
            min-width: 240px;
        }
        .info-item {
            margin-bottom: 14px;
        }
        .info-item .label {
            display: block;
            font-size: 15px;
            color: rgba(25, 135, 84, 0.9);
            font-weight: 500;
            margin-bottom: 4px;
        }
        .info-item .valor {
            color: #000;
            font-weight: 525;
        }

        /* ------------------------------------------ */

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(135deg, #2d8a5a, #1e6b47);
            color: white;
            padding: 16px 28px;
            margin-bottom: 14px;
            border-radius: 8px;
            font-size: 18px;
        }
        .titulo-doc {
            font-size: 15px;
            font-weight: 500;
            letter-spacing: 1px;
            color: #000;
        }
        .fecha-hora {
            font-size: 15px;
            font-weight: 500;
            color: #000;
        }
        .logo-empresa {
            text-align: center;
            margin-bottom: 24px;
            padding: 18px;
            background: linear-gradient(45deg, #f8f9fa, #e9ecef);
            border-radius: 10px;
        }
        .logo-texto {
            font-size: 28px;
            font-weight: bold;
            color: #2d8a5a;
            letter-spacing: 2px;
        }
        .subtitulo {
            font-size: 16px;
            color: #666;
            margin-top: 7px;
        }
        .fila-info-estado {
            display: flex;
            gap: 24px;
            margin-bottom: 30px;
        }
        .seccion-estado {
            flex: 1 1 0;
            min-width: 0;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: #fafbfc;
            font-size: 20px;
            padding: 18px;
        }
        .titulo-seccion {
            background: linear-gradient(135deg, #2d8a5a, #1e6b47);
            color: white !important;
            padding: 13px 18px;
            font-weight: bold;
            font-size: 18px;
            letter-spacing: 0.5px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        .estado-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
            padding: 18px;
            background: #fafbfc;
            font-size: 16px;
        }
        .estado-item {
            text-align: center;
            padding: 13px;
            background: white;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.07);
        }
        .estado-item .label {
            display: block;
            font-size: 14px;
            color: #666;
            margin-bottom: 7px;
            min-width: auto;
        }
        .estado-item .valor {
            display: block;
            font-weight: bold;
            color: #2d8a5a;
            text-align: center;
            font-size: 16px;
        }
        .distribucion {
            padding: 13px 18px;
            background: #e8f5e8;
            font-size: 15px;
            color: #2d8a5a;
        }
        .tabla-financiera, .tabla-creditos {
            width: 100%;
            border-collapse: collapse;
            font-size: 15px;
        }
        .tabla-financiera th, .tabla-creditos th {
            background: #2d8a5a !important;
            color: #fff !important;
            padding: 13px 10px;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            border-bottom: 2px solid #1e6b47;
        }
        .tabla-financiera td, .tabla-creditos td {
            padding: 10px;
            border-bottom: 1px solid #eee;
            text-align: left;
            font-size: 15px;
        }
        .numero {
            text-align: right !important;
            font-family: 'Courier New', monospace;
            font-weight: 500;
            font-size: 15px;
        }
        .tabla-financiera tbody tr:nth-child(even) {
            background: #f8f9fa;
        }
        .totales-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 18px;
            padding: 18px;
            background: #f8f9fa;
            font-size: 16px;
        }
        .total-item {
            text-align: center;
            padding: 18px;
            border-radius: 8px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .comprometido {
            background: linear-gradient(135deg, #ffeaa7, #fdcb6e);
        }
        .cupo {
            background: linear-gradient(135deg, #a8e6cf, #88d8a3);
        }
        .deuda {
            background: linear-gradient(135deg, #fab1a0, #e17055);
        }
        .total-label {
            font-size: 15px;
            color: #666;
            margin-bottom: 7px;
            font-weight: 600;
        }
        .total-valor {
            font-size: 20px;
            font-weight: bold;
            color: #333;
            font-family: 'Courier New', monospace;
        }
        .watermark {
            position: fixed;
            top: 45%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 40px;
            color: rgba(45, 138, 90, 0.08);
            font-weight: bold;
            text-transform: uppercase;
            white-space: pre-line;
            text-align: center;
            z-index: 1;
            pointer-events: none;
            user-select: none;
            line-height: 1.2;
        }
        @media print {
            * {
                background: transparent !important;
                box-shadow: none !important;
            }
            .no-print {
                display: none !important;
            }
            body {
                print-color-adjust: exact !important;
                -webkit-print-color-adjust: exact !important;
            }
            .titulo-seccion,
            .tabla-financiera th,
            .tabla-creditos th {
                background: #2d8a5a !important;
                color: #fff !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
        }
    </style>
`;


    const originalContent = document.body.innerHTML;

    document.body.innerHTML = `
        <html>
            <head>
                <title>Estado de Cuenta - Coopserp</title>
                <meta charset="UTF-8">
                ${styles}
            </head>
            <body>
                ${watermark}
                ${htmlImpresion}
            </body>
        </html>
    `;

    window.print();
    document.body.innerHTML = originalContent;
    location.reload();
});