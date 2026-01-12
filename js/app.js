/**
 * OSMOFILTER - Aplicación Principal
 * Lógica de la interfaz de usuario para clientes
 */

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const elements = {
        menuBtn: document.getElementById('menuBtn'),
        sidebar: document.getElementById('sidebar'),
        sidebarOverlay: document.getElementById('sidebarOverlay'),
        closeSidebar: document.getElementById('closeSidebar'),
        sidebarLinks: document.querySelectorAll('.sidebar-menu a'),
        sections: document.querySelectorAll('.section'),
        chatForm: document.getElementById('chatForm'),
        chatInput: document.getElementById('chatInput'),
        chatMessages: document.getElementById('chatMessages'),
        quickBtns: document.querySelectorAll('.quick-btn'),
        productSearch: document.getElementById('productSearch'),
        productsGrid: document.getElementById('productsGrid'),
        productModal: document.getElementById('productModal'),
        closeProductModal: document.getElementById('closeProductModal'),
        productModalContent: document.getElementById('productModalContent'),
        guideModal: document.getElementById('guideModal'),
        closeGuideModal: document.getElementById('closeGuideModal'),
        guideModalContent: document.getElementById('guideModalContent'),
        contactForm: document.getElementById('contactForm'),
        contactRequestModal: document.getElementById('contactRequestModal'),
        closeContactModal: document.getElementById('closeContactModal'),
        contactRequestForm: document.getElementById('contactRequestForm'),
        cancelContactRequest: document.getElementById('cancelContactRequest'),
        pendingQuestion: document.getElementById('pendingQuestion'),
        installBanner: document.getElementById('installBanner'),
        installBtn: document.getElementById('installBtn'),
        dismissInstall: document.getElementById('dismissInstall')
    };

    let deferredPrompt;

    // ===== Inicialización =====
    function init() {
        setupEventListeners();
        loadProducts();
        setupPWA();
        showSection('chat');
    }

    // ===== Event Listeners =====
    function setupEventListeners() {
        // Menú móvil
        elements.menuBtn.addEventListener('click', toggleSidebar);
        elements.closeSidebar.addEventListener('click', closeSidebar);
        elements.sidebarOverlay.addEventListener('click', closeSidebar);

        // Navegación
        elements.sidebarLinks.forEach(link => {
            link.addEventListener('click', handleNavigation);
        });

        // Chat
        elements.chatForm.addEventListener('submit', handleChatSubmit);
        elements.quickBtns.forEach(btn => {
            btn.addEventListener('click', handleQuickQuestion);
        });

        // Productos
        elements.productSearch?.addEventListener('input', handleProductSearch);
        elements.closeProductModal.addEventListener('click', () => closeModal('productModal'));

        // Guías
        elements.closeGuideModal.addEventListener('click', () => closeModal('guideModal'));

        // Contacto
        elements.contactForm.addEventListener('submit', handleContactSubmit);

        // Modal de contacto por IA
        elements.closeContactModal.addEventListener('click', () => closeModal('contactRequestModal'));
        elements.cancelContactRequest.addEventListener('click', () => closeModal('contactRequestModal'));
        elements.contactRequestForm.addEventListener('submit', handleContactRequest);

        // PWA Install
        elements.installBtn?.addEventListener('click', handleInstall);
        elements.dismissInstall?.addEventListener('click', dismissInstallBanner);

        // Cerrar modales con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllModals();
            }
        });
    }

    // ===== Sidebar =====
    function toggleSidebar() {
        elements.sidebar.classList.toggle('active');
        elements.sidebarOverlay.classList.toggle('active');
    }

    function closeSidebar() {
        elements.sidebar.classList.remove('active');
        elements.sidebarOverlay.classList.remove('active');
    }

    // ===== Navegación =====
    function handleNavigation(e) {
        e.preventDefault();
        const section = e.currentTarget.dataset.section;
        showSection(section);
        closeSidebar();

        // Actualizar estado activo
        elements.sidebarLinks.forEach(link => link.classList.remove('active'));
        e.currentTarget.classList.add('active');
    }

    function showSection(sectionName) {
        elements.sections.forEach(section => section.classList.remove('active'));
        const targetSection = document.getElementById(sectionName + 'Section');
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    // ===== Chat =====
    async function handleChatSubmit(e) {
        e.preventDefault();
        const message = elements.chatInput.value.trim();
        if (!message) return;

        // Añadir mensaje del usuario
        addMessage(message, 'user');
        elements.chatInput.value = '';

        // Mostrar indicador de escritura
        const typingIndicator = showTypingIndicator();

        // Simular pequeño delay para mejor UX
        await delay(500 + Math.random() * 1000);

        // Procesar pregunta con la IA
        const response = await OsmofilterIA.processQuestion(message);

        // Eliminar indicador de escritura
        typingIndicator.remove();

        // Mostrar respuesta
        if (response.success) {
            addMessage(response.message, 'bot', response);
        } else {
            addMessage(response.message, 'bot');
            // Mostrar modal de contacto
            setTimeout(() => {
                elements.pendingQuestion.value = message;
                openModal('contactRequestModal');
            }, 1000);
        }
    }

    function handleQuickQuestion(e) {
        const question = e.currentTarget.dataset.question;
        elements.chatInput.value = question;
        elements.chatForm.dispatchEvent(new Event('submit'));
    }

    function addMessage(content, sender, response = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'bot' ? '🤖' : '👤';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        // Parsear markdown básico
        const formattedContent = formatMarkdown(content);
        contentDiv.innerHTML = formattedContent;

        // Añadir productos relacionados si hay
        if (response && response.relatedProducts && response.relatedProducts.length > 0) {
            const productsDiv = document.createElement('div');
            productsDiv.className = 'related-products';
            productsDiv.innerHTML = '<p><strong>Ver productos:</strong></p>';

            response.relatedProducts.forEach(product => {
                const btn = document.createElement('button');
                btn.className = 'quick-btn';
                btn.textContent = product.name;
                btn.addEventListener('click', () => showProductDetail(product));
                productsDiv.appendChild(btn);
            });

            contentDiv.appendChild(productsDiv);
        }

        // Indicador de baja confianza
        if (response && response.lowConfidence) {
            const warningDiv = document.createElement('div');
            warningDiv.className = 'confidence-warning';
            warningDiv.innerHTML = '<small>⚠️ Esta respuesta puede no ser completamente precisa. Si necesitas más información, contacta con nuestro servicio técnico.</small>';
            contentDiv.appendChild(warningDiv);
        }

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        elements.chatMessages.appendChild(messageDiv);

        // Scroll al final
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing';
        typingDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        elements.chatMessages.appendChild(typingDiv);
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
        return typingDiv;
    }

    function formatMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/^- (.*)/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    }

    // ===== Productos =====
    function loadProducts() {
        const products = OsmofilterIA.getProducts();
        renderProducts(products);
    }

    function renderProducts(products) {
        if (!elements.productsGrid) return;

        if (products.length === 0) {
            elements.productsGrid.innerHTML = '<p class="no-products">No hay productos disponibles en este momento.</p>';
            return;
        }

        elements.productsGrid.innerHTML = products.map(product => `
            <div class="product-card" data-id="${product.id}">
                <h3>${escapeHtml(product.name)}</h3>
                <p class="product-ref">Ref: ${escapeHtml(product.ref)}</p>
                ${product.category ? `<span class="product-category">${escapeHtml(product.category)}</span>` : ''}
            </div>
        `).join('');

        // Añadir event listeners
        elements.productsGrid.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', () => {
                const product = products.find(p => p.id === card.dataset.id);
                if (product) showProductDetail(product);
            });
        });
    }

    function handleProductSearch(e) {
        const query = e.target.value.toLowerCase();
        const products = OsmofilterIA.getProducts();

        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.ref.toLowerCase().includes(query) ||
            (p.altName && p.altName.toLowerCase().includes(query)) ||
            (p.category && p.category.toLowerCase().includes(query))
        );

        renderProducts(filtered);
    }

    function showProductDetail(product) {
        let html = `
            <h2>${escapeHtml(product.name)}</h2>
            ${product.altName ? `<p class="alt-name">También conocido como: ${escapeHtml(product.altName)}</p>` : ''}
            <p><strong>Referencia:</strong> ${escapeHtml(product.ref)}</p>
            ${product.category ? `<p><strong>Categoría:</strong> ${escapeHtml(product.category)}</p>` : ''}
            ${product.description ? `<div class="product-description"><p>${escapeHtml(product.description)}</p></div>` : ''}
        `;

        // Documentos
        if (product.files && product.files.length > 0) {
            html += `
                <div class="product-files">
                    <h3>📄 Documentación</h3>
                    <ul>
                        ${product.files.map(file => `<li><a href="${file.url}" target="_blank">${escapeHtml(file.name)}</a></li>`).join('')}
                    </ul>
                </div>
            `;
        }

        // Errores y soluciones
        if (product.errors && product.errors.length > 0) {
            html += `
                <div class="product-errors">
                    <h3>🔧 Problemas y Soluciones</h3>
                    ${product.errors.map(error => `
                        <div class="error-item">
                            <h4>⚠️ ${escapeHtml(error.description)}</h4>
                            ${error.solutions && error.solutions.length > 0 ? `
                                <ul class="solutions">
                                    ${error.solutions.map(sol => `<li>✅ ${escapeHtml(sol)}</li>`).join('')}
                                </ul>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        elements.productModalContent.innerHTML = html;
        openModal('productModal');
    }

    // ===== Guías =====
    window.showGuide = function(guideId) {
        const guides = {
            'basics': {
                title: '📖 Conceptos Básicos de Tratamiento de Agua',
                content: getBasicsGuideContent()
            },
            'maintenance': {
                title: '🔧 Mantenimiento Preventivo',
                content: getMaintenanceGuideContent()
            },
            'troubleshooting': {
                title: '⚠️ Solución de Problemas Comunes',
                content: getTroubleshootingGuideContent()
            }
        };

        const guide = guides[guideId];
        if (guide) {
            elements.guideModalContent.innerHTML = `
                <h2>${guide.title}</h2>
                <div class="guide-content">${guide.content}</div>
            `;
            openModal('guideModal');
        }
    };

    function getBasicsGuideContent() {
        return `
            <h3>¿Qué es el tratamiento de agua?</h3>
            <p>El tratamiento de agua es el proceso de mejorar la calidad del agua para hacerla adecuada para un uso específico, ya sea consumo humano, uso industrial, o cualquier otra aplicación.</p>

            <h3>Tipos principales de tratamiento</h3>
            <ul>
                <li><strong>Ósmosis Inversa:</strong> Elimina hasta el 99% de contaminantes mediante una membrana semipermeable.</li>
                <li><strong>Filtración:</strong> Usa diferentes tipos de filtros para eliminar partículas y químicos.</li>
                <li><strong>Descalcificación:</strong> Reduce la dureza del agua mediante intercambio iónico.</li>
                <li><strong>Desinfección UV:</strong> Elimina microorganismos mediante luz ultravioleta.</li>
            </ul>

            <h3>¿Por qué es importante?</h3>
            <p>El agua de red puede contener cloro, cal, metales pesados y otros contaminantes que afectan su sabor, pueden dañar electrodomésticos y tuberías, y en algunos casos pueden ser perjudiciales para la salud.</p>

            <h3>Términos importantes</h3>
            <ul>
                <li><strong>TDS (Total Dissolved Solids):</strong> Mide los sólidos disueltos en el agua en partes por millón (ppm).</li>
                <li><strong>Dureza:</strong> Cantidad de calcio y magnesio disueltos, se mide en grados franceses (°f).</li>
                <li><strong>pH:</strong> Indica la acidez o alcalinidad del agua (7 es neutro).</li>
                <li><strong>Micra:</strong> Unidad de medida para el tamaño de poro de los filtros.</li>
            </ul>
        `;
    }

    function getMaintenanceGuideContent() {
        return `
            <h3>Mantenimiento de Equipos de Ósmosis</h3>

            <h4>Cada 6-12 meses:</h4>
            <ul>
                <li>Cambiar filtros de sedimentos y carbón activo</li>
                <li>Verificar estado de conexiones y mangueras</li>
                <li>Comprobar presión del depósito (0.5-0.7 bar vacío)</li>
                <li>Limpiar exterior del equipo</li>
            </ul>

            <h4>Cada 2-3 años:</h4>
            <ul>
                <li>Cambiar membrana de ósmosis</li>
                <li>Desinfectar el sistema completo</li>
                <li>Revisar válvulas y componentes electrónicos</li>
            </ul>

            <h3>Mantenimiento de Descalcificadores</h3>
            <ul>
                <li>Comprobar nivel de sal semanalmente</li>
                <li>Añadir sal cuando sea necesario (usar sal específica)</li>
                <li>Limpieza anual del tanque de sal</li>
                <li>Verificar dureza del agua tratada mensualmente</li>
            </ul>

            <h3>Consejos Generales</h3>
            <ul>
                <li>Usar siempre recambios originales o de calidad equivalente</li>
                <li>Anotar las fechas de cambio de filtros</li>
                <li>No dejar el equipo sin uso más de 2 semanas</li>
                <li>Ante cualquier anomalía, consultar con servicio técnico</li>
            </ul>
        `;
    }

    function getTroubleshootingGuideContent() {
        return `
            <h3>Problemas Frecuentes y Soluciones</h3>

            <h4>🔴 El equipo produce poca agua</h4>
            <ul>
                <li>Filtros saturados → Cambiar filtros</li>
                <li>Presión de entrada baja → Verificar presión (mín. 2.5 bar)</li>
                <li>Membrana agotada → Reemplazar membrana</li>
                <li>Depósito sin presión → Presurizar a 0.5-0.7 bar</li>
            </ul>

            <h4>🔴 El agua tiene mal sabor</h4>
            <ul>
                <li>Postfiltro saturado → Cambiar postfiltro</li>
                <li>Mucho tiempo sin usar → Vaciar depósito y renovar agua</li>
                <li>Depósito contaminado → Desinfectar el sistema</li>
            </ul>

            <h4>🔴 Hay fugas de agua</h4>
            <ul>
                <li>Conexiones flojas → Apretar o rehacer conexiones</li>
                <li>Juntas deterioradas → Cambiar juntas tóricas</li>
                <li>Carcasa de filtro dañada → Reemplazar carcasa</li>
            </ul>

            <h4>🔴 El equipo hace ruido</h4>
            <ul>
                <li>Aire en el sistema → Purgar circuito</li>
                <li>Presión muy alta → Instalar reductor de presión</li>
                <li>Bomba defectuosa → Revisar/cambiar bomba</li>
            </ul>

            <h4>🔴 El descalcificador no ablanda</h4>
            <ul>
                <li>Sin sal → Añadir sal al depósito</li>
                <li>No regenera → Verificar programación y válvula</li>
                <li>Resina agotada → Cambiar resina</li>
            </ul>
        `;
    }

    // ===== Contacto =====
    function handleContactSubmit(e) {
        e.preventDefault();

        const contact = {
            name: document.getElementById('contactName').value,
            company: document.getElementById('contactCompany').value,
            phone: document.getElementById('contactPhone').value,
            email: document.getElementById('contactEmail').value,
            message: document.getElementById('contactMessage').value,
            source: 'contact_form'
        };

        OsmofilterIA.addContactRequest(contact);

        // Mostrar confirmación
        alert('¡Gracias! Hemos recibido tu solicitud. Un técnico se pondrá en contacto contigo pronto.');
        e.target.reset();
    }

    function handleContactRequest(e) {
        e.preventDefault();

        const contact = {
            name: document.getElementById('reqName').value,
            company: document.getElementById('reqCompany').value,
            phone: document.getElementById('reqPhone').value,
            question: elements.pendingQuestion.value,
            source: 'ia_unable'
        };

        OsmofilterIA.addContactRequest(contact);

        // Añadir mensaje de confirmación al chat
        addMessage('Perfecto, hemos registrado tu solicitud. Un técnico se pondrá en contacto contigo lo antes posible. ¡Gracias!', 'bot');

        closeModal('contactRequestModal');
        e.target.reset();
    }

    // ===== Modales =====
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function closeAllModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }

    // ===== PWA =====
    function setupPWA() {
        // Registrar Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('Service Worker registrado'))
                .catch(err => console.log('Error registrando SW:', err));
        }

        // Capturar evento de instalación
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            showInstallBanner();
        });
    }

    function showInstallBanner() {
        if (elements.installBanner) {
            elements.installBanner.classList.add('show');
        }
    }

    function handleInstall() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(choice => {
                if (choice.outcome === 'accepted') {
                    console.log('PWA instalada');
                }
                deferredPrompt = null;
                dismissInstallBanner();
            });
        }
    }

    function dismissInstallBanner() {
        if (elements.installBanner) {
            elements.installBanner.classList.remove('show');
        }
    }

    // ===== Utilidades =====
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Iniciar aplicación
    init();
});
