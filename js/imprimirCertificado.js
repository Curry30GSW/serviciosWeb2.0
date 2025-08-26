document.getElementById("imprime").addEventListener("click", function () {
    imprimirContenido("CertifiCta");
});

function imprimirContenido(id) {
    let contenido = document.getElementById(id).innerHTML;

    // Obtener los estilos dinámicos que creaste
    const dynamicStyles = Array.from(document.head.querySelectorAll('style'))
        .filter(style => style.innerHTML.includes('.titulo2') ||
            style.innerHTML.includes('.datos') ||
            style.innerHTML.includes('.detalles-header'))
        .map(style => style.innerHTML)
        .join('');

    // Crear un contenedor temporal para la impresión
    let printSection = document.createElement("div");
    printSection.id = "printSection";
    printSection.innerHTML = contenido;

    // Aplicar estilos específicos para la impresión en hoja carta
    let estilos = `
        <style>
            ${dynamicStyles}
            
            @media print {
                @page {
                    size: letter; /* Tamaño carta */
                    margin: 0.7cm; /* Márgenes reducidos */
                }
                
                body { 
                    font-family: Arial, sans-serif !important; 
                    padding: 0 !important; 
                    font-size: 12px !important; /* Reducir tamaño de fuente */
                    margin: 0 !important;
                    color: #000 !important;
                    background: white !important;
                    width: 100% !important;
                    height: auto !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                /* Eliminar cualquier sombra o efecto visual */
                * {
                    box-shadow: none !important;
                    text-shadow: none !important;
                    filter: none !important;
                }
                
                .container.datos {
                    width: 100% !important;
                    max-width: 100% !important;
                    padding: 10px 10px 10px 0.5cm !important;
                    margin: 0 auto !important;
                }
                
                .titulo2 {
                    font-weight: bold !important;
                    font-size: 12px !important; /* Reducido para ahorrar espacio */
                    color: #000 !important;
                    margin: 2px 0 !important;
                    padding: 0 !important;
                }

                .datos {
                    color: #000 !important; 
                    font-size: 12px !important; /* Reducido para ahorrar espacio */
                    font-weight: normal !important; 
                    margin: 2px 0 !important;
                    padding: 0 !important;
                }
                
                .row {
                    margin-bottom: 3px !important; /* Espaciado reducido */
                    display: flex !important;
                    width: 100% !important;
                    page-break-inside: avoid !important;
                }

                .col-6 {
                    width: 50% !important;
                    padding: 1px !important; /* Padding mínimo */
                }
                
                .col-12 {
                    width: 100% !important;
                    padding: 1px !important; /* Padding mínimo */
                }
                
                .text-center {
                    text-align: center !important;
                }
                
                /* Optimizar espacio en firmas */
                .container-firma {
                    display: flex !important;
                    justify-content: space-between !important;
                    margin-top: 10px !important; /* Reducido */
                    page-break-inside: avoid !important;
                }

                .datos_firma {
                    text-align: center !important;
                    flex: 1 !important;
                    min-width: 30% !important;
                    page-break-inside: avoid !important;
                    padding: 5px !important;
                    margin: 0 5px !important;
                }

                .datos_firma img {
                    display: block !important;
                    margin: 0 auto !important;
                    max-width: 80px !important; /* Reducido */
                    height: auto !important;
                }
                
                /* Eliminar todos los elementos decorativos */
                .card, .card-header, .card-body, .shadow, .bg-gradient-dark {
                    all: unset !important;
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                }
                
                /* Ajustar espacios y saltos de línea */
                br {
                    display: block !important;
                    margin: 2px 0 !important;
                    content: "" !important;
                }
                
                /* Reducir el watermark */
                body::before {
                    content: "DOCUMENTO INFORMATIVO, NO VALIDO PARA TRANSACCIONES" !important;
                    position: fixed !important;
                    top: 50% !important;
                    left: 50% !important;
                    transform: translate(-50%, -50%) rotate(-45deg) !important;
                    font-size: 30px !important; /* Reducido */
                    color: rgba(0, 0, 0, 0.05) !important; /* Más transparente */
                    font-weight: bold !important;
                    text-transform: uppercase !important;
                    white-space: nowrap !important;
                    text-align: center !important;
                    z-index: 9999 !important;
                    pointer-events: none !important;
                }
                
                /* Asegurar que las imágenes se impriman */
                img {
                    max-width: 100% !important;
                    height: auto !important;
                }
                
                /* Compactar aún más el contenido */
                .contenido {
                    margin: 1px 0 !important;
                    padding: 0 !important;
                    line-height: 1.2 !important;
                }
                
                /* Reducir espacio entre secciones */
                .row.titulo {
                    margin-bottom: 2px !important;
                }
            }
        </style>
    `;

    // Guardar el contenido original de la página
    let originalContent = document.body.innerHTML;

    // Reemplazar solo el contenido para imprimir
    document.body.innerHTML = estilos + printSection.outerHTML;

    // Ejecutar la impresión después de un breve retraso para que se apliquen los estilos
    setTimeout(function () {
        window.print();

        // Restaurar el contenido original después de la impresión
        document.body.innerHTML = originalContent;
    }, 100);

    window.onafterprint = () => {
        location.reload();
    };

}




// Agregar event listener para el botón de descarga
document.getElementById("descargarCer").addEventListener("click", function () {
    descargarContenido("CertifiCta");
});

// Función para descargar como PDF
function descargarContenido(id) {

    // Verificar si html2pdf está disponible
    if (typeof html2pdf === 'undefined') {
        cargarHtml2Pdf().then(() => {
            // Una vez cargado, ejecutar la función de nuevo
            descargarContenido(id);
        }).catch(error => {
            console.error('Error al cargar html2pdf:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo preparar la descarga. Por favor, recarga la página.',
                confirmButtonText: 'Aceptar'
            });
        });
        return;
    }

    // Obtener el número de cuenta para el nombre del archivo
    const cuentaElement = document.querySelector("#CertifiCta .titulo2#ncta");
    const cuenta = cuentaElement ? cuentaElement.textContent.trim() : "certificado";

    // Obtener el contenido
    let contenido = document.getElementById(id).innerHTML;

    // Obtener los estilos dinámicos
    const dynamicStyles = Array.from(document.head.querySelectorAll('style'))
        .filter(style => style.innerHTML.includes('.titulo2') ||
            style.innerHTML.includes('.datos') ||
            style.innerHTML.includes('.detalles-header'))
        .map(style => style.innerHTML)
        .join('');

    // Crear un contenedor temporal para el PDF
    let pdfSection = document.createElement("div");
    pdfSection.id = "pdfSection";
    pdfSection.innerHTML = contenido;

    // Aplicar estilos específicos para PDF
    let estilos = `
        <style>
            ${dynamicStyles}
            
            body { 
                font-family: Arial, sans-serif !important; 
                padding: 0 !important; 
                font-size: 12px !important;
                margin: 0 !important;
                color: #000 !important;
                background: white !important;
                width: 100% !important;
                height: auto !important;
            }
            
            /* Eliminar cualquier sombra o efecto visual */
            * {
                box-shadow: none !important;
                text-shadow: none !important;
                filter: none !important;
            }
            
            .container.datos {
                width: 100% !important;
                max-width: 100% !important;
                padding: 15px !important;
                margin: 0 auto !important;
            }
            
            .titulo2 {
                font-weight: bold !important;
                font-size: 12px !important;
                color: #000 !important;
                margin: 2px 0 !important;
                padding: 0 !important;
            }

            .datos {
                color: #000 !important; 
                font-size: 12px !important;
                font-weight: normal !important; 
                margin: 2px 0 !important;
                padding: 0 !important;
            }
            
            .row {
                margin-bottom: 3px !important;
                display: flex !important;
                width: 100% !important;
            }

            .col-6 {
                width: 50% !important;
                padding: 1px !important;
            }
            
            .col-12 {
                width: 100% !important;
                padding: 1px !important;
            }
            
            .text-center {
                text-align: center !important;
            }
            
            /* Optimizar espacio en firmas */
            .container-firma {
                display: flex !important;
                justify-content: space-between !important;
                margin-top: 10px !important;
            }

            .datos_firma {
                text-align: center !important;
                flex: 1 !important;
                min-width: 30% !important;
                padding: 5px !important;
                margin: 0 5px !important;
            }

            .datos_firma img {
                display: block !important;
                margin: 0 auto !important;
                max-width: 80px !important;
                height: auto !important;
            }
            
            /* Eliminar todos los elementos decorativos */
            .card, .card-header, .card-body, .shadow, .bg-gradient-dark {
                all: unset !important;
                background: transparent !important;
                border: none !important;
                box-shadow: none !important;
            }
            
            /* Ajustar espacios y saltos de línea */
            br {
                display: block !important;
                margin: 2px 0 !important;
                content: "" !important;
            }
            
            /* Watermark para PDF */
            .watermark {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 30px;
                color: rgba(0, 0, 0, 0.05);
                font-weight: bold;
                text-transform: uppercase;
                white-space: nowrap;
                text-align: center;
                z-index: 9999;
                pointer-events: none;
                content: "DOCUMENTO INFORMATIVO, NO VALIDO PARA TRANSACCIONES";
            }
            
            /* Asegurar que las imágenes se muestren */
            img {
                max-width: 100% !important;
                height: auto !important;
            }
            
            /* Compactar el contenido */
            .contenido {
                margin: 1px 0 !important;
                padding: 0 !important;
                line-height: 1.2 !important;
            }
            
            /* Reducir espacio entre secciones */
            .row.titulo {
                margin-bottom: 2px !important;
            }
        </style>
    `;

    // Crear documento completo para PDF
    let pdfDocument = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Certificado de Renta</title>
            ${estilos}
        </head>
        <body>
            <div class="watermark"></div>
            ${pdfSection.outerHTML}
        </body>
        </html>
    `;

    // Crear un blob con el contenido
    const blob = new Blob([pdfDocument], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    // Configuración para html2pdf
    const options = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `Certificado-Renta-${cuenta}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'cm', format: 'letter', orientation: 'portrait' }
    };

    // Usar html2pdf para generar y descargar el PDF
    html2pdf()
        .from(pdfDocument)
        .set(options)
        .save()
        .then(() => {
            // Liberar el objeto URL
            URL.revokeObjectURL(url);
        });
}



function cargarHtml2Pdf() {
    return new Promise((resolve, reject) => {
        // Verificar si ya está cargado
        if (typeof html2pdf !== 'undefined') {
            resolve();
            return;
        }

        // Crear script element
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}